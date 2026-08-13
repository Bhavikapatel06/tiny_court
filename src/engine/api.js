import { MODELS, DEFAULT_MODEL, SYSTEM_PROMPT } from '../config/constants.js';

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

export function parseDelimited(text) {
  const parts = text.split('---');
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

export function mapKvToSections(prose, kv, showVerdict = false) {
  const sections = {};
  
  if (prose) {
    sections.prose = prose;
  }
  
  if (kv.ROLE) {
    sections.role = kv.ROLE;
  }
  
  if (showVerdict && (kv.VERDICT || kv.SENTENCE || kv.CONFIDENCE)) {
    sections.VERDICT = `**Verdict:** ${kv.VERDICT || 'CIVIL DISPUTE'}\n\n**Confidence Score:** ${kv.CONFIDENCE || 'Unknown'}\n\n**Reasoning:**\n${kv.REASON || ''}\n\n**Sentence:** ${kv.SENTENCE || 'None'}`;
  }
  
  if (Object.keys(sections).length === 0 || (!sections.prose && !sections.VERDICT)) {
    sections.RAW = prose || kv.TEXT || '';
  }
  
  return sections;
}

export function makeCaseOpenPrompt(complaint, accused, caseType) {
  return `A citizen submits this Complaint:
"${complaint}"
Accused: "${accused || 'Unknown'}"
Case Type: "${caseType || 'Theft'}"

Open the case file as 🕵️‍♂️ Investigator. Perform detective reasoning, extract key facts (without echoing), and ask ONE single follow-up question.

Return dialogue prose, then ---, then these KEYS:
ROLE: Investigator
SUSPICION_DELTA: +20
EVIDENCE_DELTA: +10`;
}

export function makeEvidencePrompt(summary, rawEvidence) {
  return `Case Summary: ${summary}
New evidence: "${rawEvidence}"

Acknowledge as 🕵️‍♂️ Investigator. Reason on how this physical clue impacts the timeline.

Return dialogue prose, then ---, then KEYS:
ROLE: Investigator
EVIDENCE_DELTA: +20`;
}

export function makeWitnessPrompt(summary) {
  return `Case Summary: ${summary}
Summon a witness as 👤 Witness. Provide humorous witness testimony.

Return dialogue prose, then ---, then KEYS:
ROLE: Witness
EVIDENCE_DELTA: +15`;
}

export function makeCrossPrompt(summary) {
  return `Case Summary: ${summary}
Cross-examine as 🛡️ Defense Lawyer. Challenge testimony.

Return dialogue prose, then ---, then KEYS:
ROLE: Defense Lawyer`;
}

export function makeTwistPrompt(summary) {
  return `Case Summary: ${summary}
Announce a surprise twist as 🕵️‍♂️ Investigator.

Return dialogue prose, then ---, then KEYS:
ROLE: Investigator`;
}

export function makeObjectionPrompt(summary) {
  return `Case Summary: ${summary}
Rulings as 👨‍⚖️ Judge. SUSTAINED or OVERRULED.

Return dialogue prose, then ---, then KEYS:
ROLE: Judge`;
}

export function makePleaPrompt(summary, pleaText) {
  return `Case Summary: ${summary}
Remorse plea: "${pleaText}"
React as 👨‍⚖️ Judge showing mercy.

Return dialogue prose, then ---, then KEYS:
ROLE: Judge`;
}

export function makeClosingPrompt(summary, verdictBand) {
  return `Case Summary: ${summary}
Calculated verdict band: ${verdictBand}

Act as 👨‍⚖️ Judge. Deliver formal verdict, confidence score, reasons, and sentence.

Return dialogue prose, then ---, then KEYS:
ROLE: Judge
VERDICT: ${verdictBand}
CONFIDENCE: 90%
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
