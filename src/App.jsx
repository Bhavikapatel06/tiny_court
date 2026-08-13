import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  sendToGemini,
  parseDelimited,
  mapKvToSections,
  makeCaseOpenPrompt,
  makeEvidencePrompt,
  makeWitnessPrompt,
  makeCrossPrompt,
  makeTwistPrompt,
  makeObjectionPrompt,
  makePleaPrompt,
  makeClosingPrompt
} from './engine/api.js';
import { runSimulationStep } from './engine/simulation.js';
import Header from './components/common/Header.jsx';
import ApiKeyModal from './components/common/ApiKeyModal.jsx';
import WelcomeScreen from './components/welcome/WelcomeScreen.jsx';
import MessageBubble from './components/courtroom/MessageBubble.jsx';
import TypingIndicator from './components/courtroom/TypingIndicator.jsx';
import ChatInput from './components/courtroom/ChatInput.jsx';
import SidebarPanels from './components/courtroom/SidebarPanels.jsx';
import VerdictModal from './components/verdict/VerdictModal.jsx';
import VerdictCard from './components/verdict/VerdictCard.jsx';
import ActionBar from './components/verdict/ActionBar.jsx';
import styles from './App.module.css';

const STORAGE_KEY_API = 'minicourt_apikey_v3';
const STORAGE_KEY_MODE = 'minicourt_mode_v3';
const STORAGE_KEY_HISTORY = 'minicourt_history_v3';

const INITIAL_METERS = {
  suspicion: 30,
  evidence: 20,
  severity: 25,
  dignity: 100,
  patience: 100,
  mercy: 0
};

const INITIAL_TRIAL = {
  complaint: '',
  accused: '',
  caseType: 'Theft',
  trialLength: 'full',
  phase: 'welcome', // welcome | trial | verdict
  focus: 'case',     // case | evidence | suspect | witness | twist | plea
  meters: { ...INITIAL_METERS },
  evidence: [],
  witnesses: [],
  strength: 30,
  caseTitle: '',
  charge: '',
  judge: 'The Honorable Court',
  courtMood: 'Dramatic',
  verdict: '',
  verdictLabel: '',
  confidence: 0,
  reasons: [],
  sentence: '',
  best_quote: '',
  pleaRounds: 0,
  twistUsed: false,
  objectionUsed: false,
  completedSentence: false,
  timeline: { complaint: true, evidence: false, witness: false, complete: false }
};

export default function App() {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY_MODE) || 'simulation');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY_API) || '');
  const [showApiModal, setShowApiModal] = useState(false);
  const [showVerdictModal, setShowVerdictModal] = useState(false);
  const [trial, setTrial] = useState({ ...INITIAL_TRIAL });
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Case History Archive State
  const [history, setHistory] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleMode = useCallback(() => {
    const nextMode = mode === 'simulation' ? 'gemini' : 'simulation';
    setMode(nextMode);
    localStorage.setItem(STORAGE_KEY_MODE, nextMode);
    if (nextMode === 'gemini' && !apiKey) {
      setShowApiModal(true);
    }
  }, [mode, apiKey]);

  const handleSaveApiKey = useCallback((key) => {
    setApiKey(key);
    localStorage.setItem(STORAGE_KEY_API, key);
    setShowApiModal(false);
  }, []);

  const handleReset = useCallback(() => {
    setTrial({ ...INITIAL_TRIAL, meters: { ...INITIAL_METERS }, evidence: [], witnesses: [], timeline: { ...INITIAL_TRIAL.timeline } });
    setMessages([]);
    setError(null);
    setShowVerdictModal(false);
  }, []);

  // Save resolved case to local history and MongoDB Atlas
  const archiveCase = useCallback((completedState, caseMessages) => {
    const archiveRecord = {
      id: Date.now().toString(),
      title: completedState.caseTitle || 'Theft Case Investigation',
      accused: completedState.accused || 'The Suspect',
      verdict: completedState.verdict || 'GUILTY',
      sentence: completedState.sentence || 'No Sentence',
      date: new Date().toISOString(),
      complaint: completedState.complaint,
      caseType: completedState.caseType,
      trialLength: completedState.trialLength,
      phase: completedState.phase,
      focus: completedState.focus,
      meters: completedState.meters,
      evidence: completedState.evidence,
      witnesses: completedState.witnesses,
      strength: completedState.strength,
      charge: completedState.charge,
      judge: completedState.judge,
      courtMood: completedState.courtMood,
      verdictLabel: completedState.verdictLabel,
      confidence: completedState.confidence,
      reasons: completedState.reasons,
      best_quote: completedState.best_quote,
      pleaRounds: completedState.pleaRounds,
      twistUsed: completedState.twistUsed,
      objectionUsed: completedState.objectionUsed,
      completedSentence: completedState.completedSentence,
      timeline: completedState.timeline,
      messages: caseMessages
    };

    setHistory(prev => {
      const nextHistory = [archiveRecord, ...prev].slice(0, 20); // Keep last 20
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(nextHistory));
      return nextHistory;
    });

    // Also persist to MongoDB Atlas
    fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseTitle: completedState.caseTitle || 'Petty Household Dispute',
        complaint: completedState.complaint,
        caseType: completedState.caseType || 'Theft',
        accused: completedState.accused || 'Roommate',
        verdict: completedState.verdictLabel || completedState.verdict || 'GUILTY',
        sentence: completedState.sentence || 'Community Service',
        courtMood: completedState.courtMood || 'Dramatic',
        tags: [completedState.caseType, 'User Dispute'],
        icon: '⚖️'
      })
    }).catch(err => console.warn('Could not post case to MongoDB Atlas:', err));
  }, []);

  // Reload history case
  const handleLoadCase = useCallback((pastCase) => {
    setTrial({
      complaint: pastCase.complaint,
      accused: pastCase.accused,
      caseType: pastCase.caseType,
      trialLength: pastCase.trialLength,
      phase: pastCase.phase,
      focus: pastCase.focus,
      meters: pastCase.meters,
      evidence: pastCase.evidence || [],
      witnesses: pastCase.witnesses || [],
      strength: pastCase.strength || 30,
      caseTitle: pastCase.caseTitle,
      charge: pastCase.charge,
      judge: pastCase.judge,
      courtMood: pastCase.courtMood,
      verdict: pastCase.verdict,
      verdictLabel: pastCase.verdictLabel,
      confidence: pastCase.confidence,
      reasons: pastCase.reasons || [],
      sentence: pastCase.sentence,
      best_quote: pastCase.best_quote,
      pleaRounds: pastCase.pleaRounds || 0,
      twistUsed: pastCase.twistUsed || false,
      objectionUsed: pastCase.objectionUsed || false,
      completedSentence: pastCase.completedSentence || false,
      timeline: pastCase.timeline
    });
    setMessages(pastCase.messages || []);
    setError(null);
    if (pastCase.phase === 'verdict') {
      setShowVerdictModal(true);
    }
  }, []);

  // Engine Runner for Dynamic actions
  const runStep = useCallback(async (action, userText = "") => {
    setIsLoading(true);
    setError(null);

    if (mode === 'gemini' && !apiKey) {
      setShowApiModal(true);
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'simulation') {
        const result = runSimulationStep(trial, action, userText);
        
        const parsed = parseDelimited(result.responseText);
        const sections = mapKvToSections(parsed.prose, parsed.kv, action === 'ask_judge');

        const nextMessages = [...messages];
        if (userText && action !== 'open_case' && action !== 'name_suspect' && action !== 'submit_evidence') {
          nextMessages.push({ role: 'user', content: userText });
        }
        
        // Check for inline timeline update to post inside chat
        if (result.timelineUpdate) {
          nextMessages.push({
            role: 'assistant',
            content: `📅 **Timeline Update:**\n✓ ${result.timelineUpdate.label}`,
            sections: { role: 'Court Clerk', RAW: `📅 **Timeline Update:**\n✓ ${result.timelineUpdate.label}` },
            id: Date.now() - 10
          });
        }

        const assistantMsg = {
          role: 'assistant',
          content: result.responseText,
          sections,
          id: Date.now()
        };
        nextMessages.push(assistantMsg);
        
        setMessages(nextMessages);
        setTrial(result.state);

        // Archive & trigger verdict popup if verdict delivered
        if (action === 'ask_judge') {
          setShowVerdictModal(true);
          archiveCase(result.state, nextMessages);
        }
      } else {
        // Run Gemini Mode
        let prompt = '';
        const summary = `Case: "${trial.caseTitle || 'Pending'}"
Charge: "${trial.charge || 'Pending'}"
Accused: "${trial.accused || 'Pending'}"
Evidence Locker: [${(trial.evidence || []).join(', ')}]
Witnesses: [${(trial.witnesses || []).join(', ')}]
Meters: Suspicion ${trial.meters.suspicion}%, Evidence ${trial.meters.evidence}%, Dignity ${trial.meters.dignity}%, Patience ${trial.meters.patience}%, Mercy ${trial.meters.mercy}%
`;

        switch (action) {
          case 'submit_evidence':
            prompt = makeEvidencePrompt(summary, userText);
            break;
          case 'call_witness':
            prompt = makeWitnessPrompt(summary);
            break;
          case 'cross_examine':
            prompt = makeCrossPrompt(summary);
            break;
          case 'add_twist':
            prompt = makeTwistPrompt(summary);
            break;
          case 'object':
            prompt = makeObjectionPrompt(summary);
            break;
          case 'plea':
            prompt = makePleaPrompt(summary, userText);
            break;
          case 'ask_judge':
            const score = trial.strength;
            const band = score >= 55 ? 'GUILTY' : score >= 40 ? 'CIVIL DISPUTE' : 'NOT GUILTY';
            prompt = makeClosingPrompt(summary, band);
            break;
          default:
            prompt = userText;
        }

        const apiMessages = [{ role: 'user', content: prompt }];
        const responseText = await sendToGemini(apiMessages, apiKey);
        const parsed = parseDelimited(responseText);
        const sections = mapKvToSections(parsed.prose, parsed.kv, action === 'ask_judge');

        const nextMessages = [...messages];
        if (userText && action !== 'submit_evidence') {
          nextMessages.push({ role: 'user', content: userText });
        }

        const assistantMsg = {
          role: 'assistant',
          content: responseText,
          sections,
          id: Date.now()
        };
        nextMessages.push(assistantMsg);

        setMessages(nextMessages);

        // Map state adjustments
        const nextState = { ...trial };
        const clampVal = (val) => Math.min(100, Math.max(0, val));
        if (parsed.deltas.suspicion) nextState.meters.suspicion = clampVal(nextState.meters.suspicion + parsed.deltas.suspicion);
        if (parsed.deltas.evidence) nextState.meters.evidence = clampVal(nextState.meters.evidence + parsed.deltas.evidence);
        if (parsed.deltas.dignity) nextState.meters.dignity = clampVal(nextState.meters.dignity + parsed.deltas.dignity);
        if (parsed.deltas.patience) nextState.meters.patience = clampVal(nextState.meters.patience + parsed.deltas.patience);
        if (parsed.deltas.mercy) nextState.meters.mercy = clampVal(nextState.meters.mercy + parsed.deltas.mercy);
        
        if (action === 'submit_evidence') {
          nextState.evidence.push(userText);
          nextState.strength = clampVal(nextState.strength + 15);
          nextState.timeline.evidence = true;
        } else if (action === 'call_witness') {
          const wName = parsed.kv.WITNESS || 'Secret Witness';
          nextState.witnesses.push(wName);
          nextState.strength = clampVal(nextState.strength + 15);
          nextState.timeline.witness = true;
        } else if (action === 'add_twist') {
          nextState.twistUsed = true;
          nextState.strength = clampVal(nextState.strength + 20);
        } else if (action === 'object') {
          nextState.objectionUsed = true;
        } else if (action === 'ask_judge') {
          nextState.phase = 'verdict';
          nextState.timeline.complete = true;
          const isGuilty = nextState.strength >= 55;
          nextState.verdict = isGuilty ? 'GUILTY' : 'NOT GUILTY';
          nextState.verdictLabel = parsed.kv.VERDICT || nextState.verdict;
          nextState.confidence = nextState.strength;
          nextState.reasons = [parsed.kv.REASON].filter(Boolean);
          nextState.sentence = parsed.kv.SENTENCE || 'Chore Duty';
          nextState.best_quote = parsed.kv.BEST_QUOTE || '';
        } else if (action === 'plea') {
          nextState.pleaRounds = (nextState.pleaRounds || 0) + 1;
          nextState.sentence = parsed.kv.SENTENCE || nextState.sentence;
        }

        setTrial(nextState);

        if (action === 'ask_judge') {
          setShowVerdictModal(true);
          archiveCase(nextState, nextMessages);
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during step execution.');
    } finally {
      setIsLoading(false);
    }
  }, [trial, mode, apiKey, messages, archiveCase]);

  // Initial summons trigger
  const handleStartCase = useCallback(async ({ caseType, complaint }) => {
    const intakeState = {
      ...INITIAL_TRIAL,
      complaint,
      caseType: caseType || 'Theft',
      phase: 'trial',
      focus: 'case',
      meters: { ...INITIAL_METERS },
      evidence: [],
      witnesses: [],
      timeline: { complaint: true, evidence: false, witness: false, complete: false }
    };

    setTrial(intakeState);
    setMessages([
      { role: 'user', content: `SUMMONS: ${complaint}` }
    ]);
    
    setIsLoading(true);
    try {
      if (mode === 'simulation') {
        const step = runSimulationStep(intakeState, 'open_case', complaint);
        const parsed = parseDelimited(step.responseText);
        const sections = mapKvToSections(parsed.prose, parsed.kv);

        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: step.responseText, sections, id: 1 }
        ]);
        setTrial(step.state);
      } else {
        const prompt = makeCaseOpenPrompt(complaint, '', caseType || 'Theft');
        const respText = await sendToGemini([{ role: 'user', content: prompt }], apiKey);
        const parsed = parseDelimited(respText);
        const sections = mapKvToSections(parsed.prose, parsed.kv, false); // never show verdict on open

        const midwayState = {
          ...intakeState,
          caseTitle: parsed.kv.CASE_TITLE || 'Theft Case Investigation',
          charge: parsed.kv.CHARGE || 'General Misbehavior',
          judge: parsed.kv.JUDGE || 'Court',
          courtMood: parsed.kv.COURT_MOOD || 'Dramatic'
        };
        const clampVal = (val) => Math.min(100, Math.max(0, val));
        midwayState.meters.suspicion = clampVal(midwayState.meters.suspicion + (parsed.deltas.suspicion || 20));
        midwayState.meters.evidence = clampVal(midwayState.meters.evidence + (parsed.deltas.evidence || 10));

        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: respText, sections, id: 1 }
        ]);
        setTrial(midwayState);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during case setup.');
    } finally {
      setIsLoading(false);
    }
  }, [mode, apiKey]);

  // Standard chat typing submission
  const handleChatSend = useCallback((content) => {
    if (!content.trim() || isLoading) return;

    if (trial.focus === 'evidence') {
      runStep('submit_evidence', content);
    } else if (trial.focus === 'suspect') {
      runStep('name_suspect', content);
    } else if (trial.focus === 'plea') {
      runStep('plea', content);
    } else {
      // Free chatter with Investigator
      runStep('chatter', content);
    }
  }, [trial, isLoading, runStep]);

  // OBJECTION, TWIST, WITNESS handles
  const handleCallWitness = () => {
    runStep('call_witness');
  };

  const handleAddTwist = () => {
    runStep('add_twist');
  };

  const handleObject = () => {
    runStep('object');
  };

  const handleShowTimeline = () => {
    const t = trial.timeline;
    const timelineStr = `📅 **Case Timeline Archive:**
✓ Complaint Filed ${t.complaint ? '✓' : '✗'}
✓ Evidence Added ${t.evidence ? '✓' : '✗'}
✓ Witness Statement ${t.witness ? '✓' : '✗'}
✓ Investigation Complete ${t.complete ? '✓' : '✗'}`;

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: timelineStr,
      sections: { role: 'Investigator', RAW: timelineStr },
      id: Date.now()
    }]);
  };

  const handleDeliverVerdict = () => {
    runStep('ask_judge');
  };

  const handlePleaChoice = (type) => {
    setTrial(prev => ({ ...prev, phase: 'trial', focus: 'plea', pleaType: type }));
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `The court acknowledges an appeal on the basis of ${type.toUpperCase()}. Please state your arguments in the chat below.`,
      sections: { role: 'Judge', RAW: `The court acknowledges an appeal on the basis of ${type.toUpperCase()}. Please state your arguments in the chat below.` }
    }]);
  };

  const handleServedSentence = () => {
    setTrial(prev => ({ ...prev, completedSentence: true }));
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: "⚖️ Sentence served! The case has been marked as fully completed.",
      sections: { role: 'Judge', RAW: "⚖️ Sentence served! The case has been marked as fully completed." }
    }]);
  };

  const copyVerdict = () => {
    const text = `⚖️ MINI COURT REPORT ⚖️
Case Title: ${trial.caseTitle}
Charge: ${trial.charge}
Suspect: ${trial.accused || 'Dave'}
Verdict: ${trial.verdict} (Confidence: ${trial.confidence}%)
Sentence: ${trial.sentence}
--
Settle petty household crimes with Mini Court.`;
    navigator.clipboard.writeText(text);
    alert("Verdict copied to clipboard!");
  };

  // ─── Compute contextual action chips based on current trial state ───
  const getContextualActions = () => {
    if (isLoading) return [];
    if (trial.phase === 'verdict') {
      const chips = [
        { key: 'view_cards',       icon: '📜', label: 'View Verdict Cards', primary: true },
        { key: 'appeal_leniency',  icon: '💖', label: 'Appeal: Leniency' },
        { key: 'appeal_evidence',  icon: '📂', label: 'Appeal: Evidence' },
        { key: 'appeal_innocent',  icon: '🛡️', label: 'Appeal: Innocent' },
        { key: 'copy_verdict',     icon: '🔗', label: 'Copy Verdict' },
        { key: 'new_case',         icon: '➕', label: 'New Case' },
      ];
      if (!trial.completedSentence && trial.verdict === 'GUILTY') {
        chips.unshift({ key: 'mark_served', icon: '🧹', label: 'Mark Served' });
      }
      return chips;
    }
    if (trial.phase === 'trial') {
      const chips = [
        { key: 'add_evidence',  icon: '📂', label: 'Add Evidence' },
        { key: 'name_suspect',  icon: '👤', label: 'Name Suspect' },
        { key: 'call_witness',  icon: '🗣️', label: 'Call Witness' },
      ];
      if ((trial.evidence?.length || 0) > 0) {
        if (!trial.objectionUsed) chips.push({ key: 'object',    icon: '✋', label: 'Objection!' });
        if (!trial.twistUsed)     chips.push({ key: 'add_twist', icon: '⚠️', label: 'Add Twist' });
      }
      chips.push({ key: 'ask_judge', icon: '👨‍⚖️', label: 'Ask Judge', primary: true });
      return chips;
    }
    return [];
  };

  const handleChipAction = (key) => {
    switch (key) {
      case 'view_cards':     setShowVerdictModal(true); break;
      case 'add_evidence':   setTrial(prev => ({ ...prev, focus: 'evidence' })); break;
      case 'name_suspect':   setTrial(prev => ({ ...prev, focus: 'suspect' })); break;
      case 'call_witness':   runStep('call_witness'); break;
      case 'object':         runStep('object'); break;
      case 'add_twist':      runStep('add_twist'); break;
      case 'ask_judge':      runStep('ask_judge'); break;
      case 'appeal_leniency': handlePleaChoice('leniency'); break;
      case 'appeal_evidence': handlePleaChoice('evidence'); break;
      case 'appeal_innocent': handlePleaChoice('innocent'); break;
      case 'mark_served':    handleServedSentence(); break;
      case 'copy_verdict':   copyVerdict(); break;
      case 'new_case':       handleReset(); break;
    }
  };

  const contextualActions = getContextualActions();

  // Find index of last AI message to attach chips to
  const lastAiIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i;
    }
    return -1;
  })();

  return (
    <div className={styles.app}>
      <div className={styles.bgDecor} aria-hidden="true">
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgGrid} />
      </div>

      <Header
        casePhase={trial.phase === 'trial' ? trial.focus : trial.phase}
        onReset={handleReset}
        onChangeKey={() => setShowApiModal(true)}
        isModeSim={mode === 'simulation'}
        toggleMode={toggleMode}
      />

      <main className={styles.main}>
        {trial.phase === 'welcome' ? (
          <WelcomeScreen
            onStart={handleStartCase}
            isModeSim={mode === 'simulation'}
            toggleMode={toggleMode}
          />
        ) : (
          <div className={styles.chatShell}>
            {/* ── Messages ─────────────────────────────────────── */}
            <div className={styles.messages}>
              {messages.map((msg, index) => (
                <MessageBubble
                  key={index}
                  message={msg}
                  // Attach chips only to the last AI message when not loading
                  actions={!isLoading && index === lastAiIdx ? contextualActions : []}
                  onAction={handleChipAction}
                />
              ))}

              {isLoading && <TypingIndicator />}

              {error && (
                <div className={styles.error}>
                  <span>⚠️</span>
                  <div>
                    <strong>Error:</strong> {error}
                    <br />
                    <small>Switch to Offline Mode in the header to bypass rate limits.</small>
                  </div>
                  <button onClick={() => setError(null)} className={styles.errorClose}>×</button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input bar ─────────────────────────────────────── */}
            {trial.phase !== 'verdict' && (
              <div className={styles.inputBar}>
                <ChatInput
                  onSend={handleChatSend}
                  onReset={handleReset}
                  isLoading={isLoading}
                  disabled={isLoading}
                  placeholder={
                    trial.focus === 'evidence' ? "Describe the evidence you found..." :
                    trial.focus === 'suspect'  ? "Who do you suspect? Type their name..." :
                    trial.focus === 'plea'     ? "State your appeal arguments..." :
                    "Talk to the Investigator..."
                  }
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Verdict Cards Popup Modal (Card 1 ➔ Card 2 Flow) ── */}
      {showVerdictModal && (
        <VerdictModal
          trial={trial}
          onNewCase={handleReset}
          onServedToggle={handleServedSentence}
          onClose={() => setShowVerdictModal(false)}
        />
      )}

      {/* API Key Modal */}
      {showApiModal && (
        <ApiKeyModal
          apiKey={apiKey}
          onSave={handleSaveApiKey}
          onCancel={() => { setMode('simulation'); setShowApiModal(false); }}
        />
      )}
    </div>
  );
}

