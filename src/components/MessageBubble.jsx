import { useMemo } from 'react';
import { extractVerdictType, extractConfidence } from '../api.js';
import styles from './MessageBubble.module.css';

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

// Clean, inline verdict card
function VerdictCard({ sections }) {
  const verdictType = useMemo(() => extractVerdictType(sections.VERDICT || ''), [sections.VERDICT]);
  const confidence = useMemo(() => extractConfidence(sections.VERDICT || ''), [sections.VERDICT]);

  const verdictColors = {
    GUILTY: { bg: 'rgba(224,82,82,0.12)', border: 'rgba(224,82,82,0.3)', text: '#f08080', icon: '🔨' },
    NOT_GUILTY: { bg: 'rgba(82,214,138,0.12)', border: 'rgba(82,214,138,0.3)', text: '#52d68a', icon: '✅' },
    INSUFFICIENT: { bg: 'rgba(224,160,82,0.12)', border: 'rgba(224,160,82,0.3)', text: '#e0a052', icon: '🔍' },
    CIVIL: { bg: 'rgba(160,82,224,0.12)', border: 'rgba(160,82,224,0.3)', text: '#c080f0', icon: '🤝' },
    FURTHER: { bg: 'rgba(201,168,76,0.12)', border: 'rgba(201,168,76,0.3)', text: '#c9a84c', icon: '📋' },
  };

  const vc = verdictColors[verdictType] || verdictColors.FURTHER;
  const score = confidence ?? 0;
  const scoreColor = score >= 70 ? '#52d68a' : score >= 40 ? '#e0a052' : '#e05252';

  return (
    <div className={styles.verdictCard} style={{ borderColor: vc.border, background: vc.bg }}>
      <div className={styles.verdictTitle} style={{ color: vc.text }}>
        {vc.icon} {verdictType?.replace('_', ' ') || 'VERDICT'}
      </div>

      {confidence !== null && (
        <div className={styles.verdictConf}>
          <span>Confidence</span>
          <div className={styles.confBar}>
            <div className={styles.confFill} style={{ width: `${score}%`, background: scoreColor }} />
          </div>
          <span style={{ color: scoreColor, fontWeight: 700, fontSize: '0.8rem' }}>{score}%</span>
        </div>
      )}

      <div
        className={styles.verdictBody}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(sections.VERDICT) }}
      />
    </div>
  );
}

export default function MessageBubble({ message, actions, onAction }) {
  const isUser = message.role === 'user';
  const sections = message.sections || { RAW: message.content };
  const activeRole = sections.role || 'Investigator';

  const getRoleDetails = (roleName) => {
    const r = (roleName || '').toLowerCase();
    if (r.includes('investigator')) return { icon: '🕵️‍♂️', label: 'Investigator', avatarClass: styles.avatarInvestigator, bubbleClass: styles.aiBubble };
    if (r.includes('prosecutor'))   return { icon: '⚔️',  label: 'Prosecutor',  avatarClass: styles.avatarProsecutor, bubbleClass: styles.prosecutorBubble };
    if (r.includes('defense') || r.includes('lawyer')) return { icon: '🛡️', label: 'Defense', avatarClass: styles.avatarDefense, bubbleClass: styles.defenseBubble };
    if (r.includes('judge'))        return { icon: '👨‍⚖️', label: 'Judge', avatarClass: styles.avatarJudge, bubbleClass: styles.judgeBubble };
    if (r.includes('witness'))      return { icon: '👤', label: roleName, avatarClass: styles.avatarWitness, bubbleClass: styles.witnessBubble };
    if (r.includes('clerk') || r.includes('bailiff')) return { icon: '📋', label: roleName, avatarClass: styles.avatarCourt, bubbleClass: styles.clerkBubble };
    return { icon: '⚖️', label: roleName || 'Court', avatarClass: styles.avatarCourt, bubbleClass: styles.aiBubble };
  };

  const role = isUser
    ? { icon: '🧑', label: 'You', avatarClass: styles.avatarUser, bubbleClass: styles.userBubble }
    : getRoleDetails(activeRole);

  const hasVerdict = !!sections.VERDICT;
  const bodyText = sections.prose || sections.RAW || '';

  return (
    <div className={`${styles.wrap} ${isUser ? styles.userWrap : styles.aiWrap}`}>
      {/* Avatar */}
      <div className={`${styles.avatar} ${role.avatarClass}`} title={role.label}>
        {role.icon}
      </div>

      <div className={styles.msgCol}>
        {/* Role label */}
        {!isUser && (
          <span className={styles.roleName}>{role.label}</span>
        )}

        {/* Bubble */}
        <div className={`${styles.bubble} ${role.bubbleClass}`}>
          {isUser ? (
            <p className={styles.text}>{message.content}</p>
          ) : (
            <>
              {bodyText && (
                <div
                  className={styles.text}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(bodyText) }}
                />
              )}
              {hasVerdict && <VerdictCard sections={sections} />}
            </>
          )}
        </div>

        {/* Inline action chips — only on last AI message when actions provided */}
        {!isUser && actions && actions.length > 0 && (
          <div className={styles.chips}>
            {actions.map((a) => (
              <button
                key={a.key}
                className={`${styles.chip} ${a.primary ? styles.chipPrimary : ''}`}
                onClick={() => onAction(a.key, a.label)}
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
