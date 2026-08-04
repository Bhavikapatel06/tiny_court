import { MODELS, DEFAULT_MODEL, SYSTEM_PROMPT } from './constants';

/**
 * Send request to Gemini API and get a response.
 */
export async function sendToGemini(messages, apiKey, model = 'gemini-2.0-flash') {
  const modelUrl = MODELS[model] || MODELS[DEFAULT_MODEL];
  
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : msg.role,
    parts: [{ text: msg.content }]
  }));

  const payload = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents,
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 1024,
      topP: 0.95,
    }
  };

  const response = await fetch(`${modelUrl}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `API Error: ${response.status}`;
    throw new Error(errMsg);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from the AI. Please try again.');
  return text;
}

/**
 * Parse Hugging Face style delimited key-value block
 */
export function parseDelimited(text) {
  const parts = text.split('---');
  // If there are multiple --- separators, prose is the first part, metadata is the last part
  const prose = parts[0].trim();
  const kvBlock = parts[parts.length - 1] || '';
  
  const kv = {};
  const deltas = { suspicion: 0, evidence: 0, severity: 0, dignity: 0, patience: 0, mercy: 0 };
  
  const lines = kvBlock.split('\n');
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)\s*:\s*(.+)$/i);
    if (match) {
      const key = match[1].toUpperCase();
      const val = match[2].trim();
      kv[key] = val;
      
      // Parse deltas
      if (key.endsWith('_DELTA')) {
        const deltaKey = key.replace('_DELTA', '').toLowerCase();
        const num = parseInt(val.replace('+', ''));
        if (!isNaN(num)) {
          deltas[deltaKey] = num;
        }
      }
    }
  }
  
  return { prose, kv, deltas };
}

/**
 * Maps the flat key-values to UI structured sections.
 * @param {string} prose - narrative text before the --- delimiter
 * @param {object} kv    - parsed key-value pairs after the --- delimiter
 * @param {boolean} showVerdict - only build the Verdict card when explicitly requested (e.g. ask_judge action)
 */
export function mapKvToSections(prose, kv, showVerdict = false) {
  const sections = {};
  
  if (prose) {
    sections.prose = prose;
  }
  
  // Extract role label
  if (kv.ROLE) {
    sections.role = kv.ROLE;
  }
  
  // Only show structured verdict card when the Judge action fires
  if (showVerdict && (kv.VERDICT || kv.SENTENCE || kv.CONFIDENCE)) {
    sections.VERDICT = `**Verdict:** ${kv.VERDICT || 'CIVIL DISPUTE'}\n\n**Confidence Score:** ${kv.CONFIDENCE || 'Unknown'}\n\n**Reasoning:**\n${kv.REASON || ''}\n\n**Sentence:** ${kv.SENTENCE || 'None'}`;
  }
  
  if (Object.keys(sections).length === 0 || (!sections.prose && !sections.VERDICT)) {
    sections.RAW = prose || kv.TEXT || '';
  }
  
  return sections;
}

// Prompt builders for role-based gameplay
export function makeCaseOpenPrompt(complaint, accused, caseType) {
  return `A citizen submits this Complaint:
"${complaint}"
Accused (named by user or default): "${accused || 'Unknown'}"
Case Type: "${caseType || 'Theft'}"

Open the case file. Respond as 🕵️‍♂️ Investigator. Acknowledge the incident and ask 3-4 friendly follow-up questions to gather key alibi details (where, when, witnesses).

Return dialogue prose, then ---, then these KEYS:
ROLE: Investigator
SUSPICION_DELTA: +20
EVIDENCE_DELTA: +10
DIGNITY_DELTA: 0`;
}

export function makeEvidencePrompt(summary, rawEvidence) {
  return `Case Summary:
${summary}

The complainant submitted new evidence: "${rawEvidence}"

Acknowledge this evidence as 🕵️‍♂️ Investigator. Write a short reaction, log it into the record, and tell the user how it strengthens the case.

Return dialogue prose, then ---, then these KEYS:
ROLE: Investigator
EVIDENCE_DELTA: +20
SUSPICION_DELTA: +10
DIGNITY_DELTA: -5`;
}

export function makeWitnessPrompt(summary) {
  return `Case Summary:
${summary}

Summon a witness related to this incident. Speak in character as 👤 Witness. Provide a humorous or helpful witness testimony.

Return dialogue prose, then ---, then these KEYS:
ROLE: Witness
EVIDENCE_DELTA: +15
SUSPICION_DELTA: +15
DIGNITY_DELTA: -10`;
}

export function makeCrossPrompt(summary) {
  return `Case Summary:
${summary}

Cross-examine the witness as 🛡️ Defense Lawyer. Express skepticism, challenge the testimony, and point out a gap in the timeline.

Return dialogue prose, then ---, then these KEYS:
ROLE: Defense Lawyer
SUSPICION_DELTA: -10
EVIDENCE_DELTA: +10
DIGNITY_DELTA: -5`;
}

export function makeTwistPrompt(summary) {
  return `Case Summary:
${summary}

Announce a surprise twist complication as 🕵️‍♂️ Investigator (e.g. new CCTV clip, missing key item found in a weird place). Make it funny and specific.

Return dialogue prose, then ---, then these KEYS:
ROLE: Investigator
SUSPICION_DELTA: +20
EVIDENCE_DELTA: +15
DIGNITY_DELTA: -15`;
}

export function makeObjectionPrompt(summary) {
  return `Case Summary:
${summary}

A defense objection has been raised. Act as 👨‍⚖️ Judge. Deliver a ruling (SUSTAINED or OVERRULED) with a quick comedic justification.

Return dialogue prose, then ---, then these KEYS:
ROLE: Judge
SUSPICION_DELTA: -10
DIGNITY_DELTA: -10`;
}

export function makePleaPrompt(summary, pleaText) {
  return `Case Summary:
${summary}
Remorse plea from accused: "${pleaText}"

React as 👨‍⚖️ Judge or 🛡️ Defense Lawyer. Deliver a brief reaction showing mercy or skepticism.

Return dialogue prose, then ---, then these KEYS:
ROLE: Judge
MERCY_DELTA: +25
DIGNITY_DELTA: -5`;
}

export function makeClosingPrompt(summary, verdictBand) {
  return `Case Summary:
${summary}
Verifying Verdict: The calculated verdict band is ${verdictBand}. Do not change it.

Act as 👨‍⚖️ Judge. Summarize the evidence checklist, review witness statements, and deliver a formal verdict, confidence score, reasons, and a funny sentence.

Return dialogue prose, then ---, then these KEYS:
ROLE: Judge
VERDICT: ${verdictBand}
CONFIDENCE: 90%
REASON: (1-3 checklist bullets reasons)
SENTENCE: (comedic sentence)
`;
}

export function extractVerdictType(verdictText) {
  if (!verdictText) return null;
  const upper = verdictText.toUpperCase();
  if (upper.includes('NOT GUILTY')) return 'NOT_GUILTY';
  if (upper.includes('GUILTY')) return 'GUILTY';
  if (upper.includes('INSUFFICIENT EVIDENCE')) return 'INSUFFICIENT';
  if (upper.includes('FURTHER INVESTIGATION')) return 'FURTHER';
  if (upper.includes('CIVIL DISPUTE')) return 'CIVIL';
  return null;
}

export function extractConfidence(verdictText) {
  if (!verdictText) return null;
  const match = verdictText.match(/Confidence[:\s]+(\d+)/i);
  return match ? parseInt(match[1]) : null;
}
