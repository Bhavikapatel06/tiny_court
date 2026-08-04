import React from 'react';
import styles from './Header.module.css';

// Only 4 simple progress dots shown compactly during a case
const PROGRESS_STEPS = [
  { key: 'case',    label: 'Investigation' },
  { key: 'verdict', label: 'Verdict' },
];

export default function Header({ casePhase, onReset, onChangeKey, isModeSim, toggleMode }) {
  const isInCase = casePhase !== 'welcome';
  const isVerdict = casePhase === 'verdict';

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Brand */}
        <div className={styles.brand} onClick={onReset} title="New Case">
          <span className={styles.icon}>⚖️</span>
          <div>
            <h1 className={styles.title}>Mini Court</h1>
            <span className={styles.tagline}>AI Courtroom Simulator</span>
          </div>
        </div>

        {/* Compact inline progress — only visible during an active case */}
        {isInCase && (
          <div className={styles.progress}>
            <div className={`${styles.step} ${!isVerdict ? styles.stepActive : styles.stepDone}`}>
              <span className={styles.dot} />
              <span className={styles.stepLabel}>Investigation</span>
            </div>
            <div className={styles.connector} />
            <div className={`${styles.step} ${isVerdict ? styles.stepActive : ''}`}>
              <span className={styles.dot} />
              <span className={styles.stepLabel}>Conclusion</span>
            </div>
          </div>
        )}

        {/* Right actions */}
        <div className={styles.actions}>
          <button
            onClick={toggleMode}
            className={`${styles.modeBtn} ${isModeSim ? styles.modeSim : styles.modeAi}`}
            title="Switch game engine"
          >
            {isModeSim ? '📴 Offline' : '🤖 AI'}
          </button>

          {isInCase && (
            <button onClick={onReset} className={styles.newCaseBtn} title="Start a new case">
              + New Case
            </button>
          )}

          <button onClick={onChangeKey} className={styles.keyBtn} title="Configure API Key">
            ⚙️
          </button>
        </div>
      </div>

      <div className={styles.bar} />
    </header>
  );
}
