import { useState, useCallback } from 'react';

const STORAGE_KEY = 'minicourt_apikey';

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
  });

  const setApiKey = useCallback((key) => {
    setApiKeyState(key);
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return [apiKey, setApiKey];
}

export function useChat(apiKey) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [casePhase, setCasePhase] = useState('welcome'); // welcome | investigation | analysis | verdict

  const { sendToGemini, parseResponse } = (() => {
    // Dynamic import to avoid circular deps
    const mod = { sendToGemini: null, parseResponse: null };
    import('./api.js').then(m => {
      mod.sendToGemini = m.sendToGemini;
      mod.parseResponse = m.parseResponse;
    });
    return mod;
  })();

  const sendMessage = useCallback(async (content, apiFn, parseFn) => {
    if (!content.trim() || isLoading) return;

    const userMsg = { role: 'user', content: content.trim(), id: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await apiFn(newMessages, apiKey);
      const sections = parseFn(responseText);
      
      const assistantMsg = {
        role: 'assistant',
        content: responseText,
        sections,
        id: Date.now() + 1,
      };

      setMessages(prev => [...prev, assistantMsg]);
      
      // Update phase based on response content
      if (sections.VERDICT) {
        setCasePhase('verdict');
      } else if (sections.PROSECUTION || sections.DEFENSE || sections.CASE_SUMMARY) {
        setCasePhase('analysis');
      } else if (messages.length > 0 || newMessages.length > 0) {
        setCasePhase('investigation');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, apiKey]);

  const resetCase = useCallback(() => {
    setMessages([]);
    setError(null);
    setCasePhase('welcome');
  }, []);

  return { messages, isLoading, error, casePhase, sendMessage, resetCase };
}
