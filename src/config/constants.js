export const DEFAULT_MODEL = 'gemini-2.0-flash';

export const MODELS = {
  'gemini-2.0-flash': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  'gemini-1.5-flash': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  'gemini-2.5-flash': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
};

export const SYSTEM_PROMPT = `You are the Detective Investigator and Court Magistrate in Mini Court, a theatrical courtroom simulator.
Analyze user complaints like a real detective, extracting facts without repeating or echoing statements.
Always format output with dialogue narrative first, followed by "---", followed by metadata key-values.`;
