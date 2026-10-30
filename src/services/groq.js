/**
 * Groq API Service for Orbit
 * Handles chat streaming, model fetching, and key verification using plain fetch.
 */

// Safe fallback models (always guaranteed to be defined)
export const SAFE_DEFAULT_MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B (Smartest)' },
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B (Fastest)' },
];

export const DEFAULT_MODEL_ID = 'openai/gpt-oss-120b';

// Known friendly names mapping
const FRIENDLY_NAMES = {
  'openai/gpt-oss-120b': 'GPT-OSS 120B (Smartest)',
  'openai/gpt-oss-20b': 'GPT-OSS 20B (Fastest)',
};

/**
 * Retrieve the active API key:
 * Priority: 1. Settings (localStorage), 2. Environment (.env)
 */
export function getActiveApiKey() {
  const localKey = localStorage.getItem('orbit_api_key');
  if (localKey && localKey.trim()) {
    return localKey.trim();
  }
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }
  return '';
}

/**
 * Test if an API key is valid by querying the models endpoint
 */
export async function testApiKey(apiKey) {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Please provide an API key.' };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return { success: true, message: 'Key works' };
    }

    if (response.status === 401) {
      return { success: false, message: 'Invalid API key. Please check and try again.' };
    }

    const data = await response.json().catch(() => ({}));
    return {
      success: false,
      message: data.error?.message || `Error: Received HTTP ${response.status}`,
    };
  } catch (err) {
    return {
      success: false,
      message: 'Network error: could not connect to Groq. Please check your internet.',
    };
  }
}

/**
 * Fetch available models from Groq and filter out retired or non-chat models
 */
export async function fetchAvailableModels(apiKey) {
  const key = apiKey || getActiveApiKey();
  if (!key) {
    return SAFE_DEFAULT_MODELS;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return SAFE_DEFAULT_MODELS;
    }

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
      return SAFE_DEFAULT_MODELS;
    }

    // Filter out non-chat, audio, safeguard, compound, and retired models
    const excludedKeywords = [
      'whisper',
      'tts',
      'orpheus',
      'guard',
      'safeguard',
      'embed',
      'compound',
      'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile',
      'llama-4',
      'qwen3-32b',
      'kimi-k2',
    ];

    const filtered = data.data.filter((item) => {
      const id = item.id.toLowerCase();
      return !excludedKeywords.some((keyword) => id.includes(keyword));
    });

    if (filtered.length === 0) {
      return SAFE_DEFAULT_MODELS;
    }

    // Format for picker
    const formatted = filtered.map((item) => ({
      id: item.id,
      name: FRIENDLY_NAMES[item.id] || item.id,
    }));

    // Ensure our safe defaults are at the top if present
    formatted.sort((a, b) => {
      if (a.id === DEFAULT_MODEL_ID) return -1;
      if (b.id === DEFAULT_MODEL_ID) return 1;
      if (a.id === 'openai/gpt-oss-20b') return -1;
      if (b.id === 'openai/gpt-oss-20b') return 1;
      return a.name.localeCompare(b.name);
    });

    return formatted;
  } catch (err) {
    console.warn('Failed to fetch live Groq models, using safe defaults:', err);
    return SAFE_DEFAULT_MODELS;
  }
}

/**
 * Stream a chat completion from Groq API
 * @param {string} searchContext - Optional web search results to inject into system prompt
 */
export async function streamChatCompletion({
  apiKey,
  model,
  messages,
  signal,
  onChunk,
  searchContext,
}) {
  const key = apiKey || getActiveApiKey();
  if (!key) {
    throw new Error('NO_API_KEY');
  }

  // Build system prompt, injecting search context if available
  let systemContent = 'You are Orbit, a friendly and helpful AI assistant. Format answers clearly using Markdown.';

  if (searchContext) {
    systemContent += `\n\nYou have access to the following real-time web search results to help answer the user's question. Use this information to provide accurate, up-to-date answers. Cite sources when relevant.\n\n--- WEB SEARCH RESULTS ---\n${searchContext}\n--- END SEARCH RESULTS ---`;
  }

  const formattedMessages = [
    {
      role: 'system',
      content: systemContent,
    },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  let response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL_ID,
        messages: formattedMessages,
        stream: true,
        reasoning_effort: 'low',
      }),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) {
      throw new Error('ABORTED');
    }
    throw new Error('NETWORK_ERROR');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error?.message || '';

    if (response.status === 401) {
      throw new Error('INVALID_KEY');
    }
    if (response.status === 429) {
      throw new Error('RATE_LIMITED');
    }
    if (
      response.status === 404 ||
      errorMsg.toLowerCase().includes('model') ||
      errorMsg.toLowerCase().includes('decommissioned')
    ) {
      throw new Error('MODEL_DECOMMISSIONED');
    }

    throw new Error(errorMsg || `API_ERROR_${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const dataStr = trimmed.slice(6);
        if (dataStr === '[DONE]') {
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta;

          // Never show reasoning text; only render delta.content
          if (delta && typeof delta.content === 'string') {
            onChunk(delta.content);
          }
        } catch {
          // Incomplete or non-JSON chunk, ignore and continue
        }
      }
    }
  } catch (err) {
    if (signal?.aborted) {
      throw new Error('ABORTED');
    }
    throw err;
  }
}
