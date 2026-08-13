import React, { useState } from 'react';
import styles from './ChatInput.module.css';

export default function ChatInput({ onSend, onReset, isLoading, placeholder }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.input}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder || "Talk to the Investigator..."}
        disabled={isLoading}
      />
      <button type="submit" className={styles.sendBtn} disabled={isLoading || !text.trim()}>
        Send ➔
      </button>
    </form>
  );
}
