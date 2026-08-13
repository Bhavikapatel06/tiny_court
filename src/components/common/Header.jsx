import React from 'react';
import styles from './Header.module.css';

export default function Header({ casePhase, onReset, onChangeKey, isModeSim, toggleMode }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand} onClick={onReset} style={{ cursor: 'pointer' }}>
        <span className={styles.gavelIcon}>⚖️</span>
        <span className={styles.title}>Mini Court</span>
        <span className={styles.badge}>AI SIMULATOR</span>
      </div>

      <div className={styles.rightActions}>
        <button
          onClick={toggleMode}
          className={`${styles.modeToggleBtn} ${isModeSim ? styles.modeSim : styles.modeGemini}`}
          title="Toggle between Offline Engine and Gemini AI API"
        >
          {isModeSim ? '📴 Offline Mode' : '🤖 Gemini AI'}
        </button>

        {!isModeSim && (
          <button onClick={onChangeKey} className={styles.gearBtn} title="Configure Gemini API Key">
            ⚙️
          </button>
        )}
      </div>
    </header>
  );
}
