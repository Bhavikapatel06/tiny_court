import React, { useState } from 'react';
import styles from './ApiKeyModal.module.css';

export default function ApiKeyModal({ apiKey, onSave, onCancel }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>🔑 Enter Gemini API Key</h3>
        <p className={styles.modalNote}>
          Required for <strong>Gemini AI Mode</strong>. Get a free key from the{' '}
          <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">
            Google AI Studio
          </a>.
        </p>
        <input
          type="password"
          className={styles.modalInput}
          placeholder="AIzaSy..."
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
        />
        <div className={styles.modalBtns}>
          <button onClick={() => onSave(keyInput)} className={styles.modalSaveBtn}>
            Save & Connect
          </button>
          <button onClick={onCancel} className={styles.modalCancelBtn}>
            Use Offline Simulation
          </button>
        </div>
      </div>
    </div>
  );
}
