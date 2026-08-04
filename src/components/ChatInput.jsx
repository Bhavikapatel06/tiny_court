import { useState, useRef } from 'react';
import styles from './ChatInput.module.css';

const QUICK_ACTIONS = [
  { label: '📋 Summarize', text: 'Please summarize the case so far.' },
  { label: '⚖️ Give Verdict', text: 'Based on what you know, please give the verdict now.' },
  { label: '🔍 More Questions', text: 'What other information do you need?' },
  { label: '🔄 Start Over', text: null, isReset: true },
];

export default function ChatInput({ onSend, onReset, isLoading, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || isLoading || disabled) return;
    onSend(value.trim());
    setValue('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickAction = (action) => {
    if (action.isReset) {
      onReset();
      return;
    }
    onSend(action.text);
  };

  return (
    <div className={styles.container}>
      {/* Quick Actions */}
      <div className={styles.quickActions}>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            className={`${styles.quickBtn} ${action.isReset ? styles.resetBtn : ''}`}
            onClick={() => handleQuickAction(action)}
            disabled={isLoading}
            id={`quick-${action.label.replace(/[^a-zA-Z]/g, '').toLowerCase()}`}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrap}>
          <textarea
            ref={textareaRef}
            id="chat-input"
            className={styles.textarea}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your case or answer the AI's question... (Enter to send, Shift+Enter for new line)"
            rows={1}
            disabled={isLoading || disabled}
            style={{ height: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
            }}
          />
          <button
            type="submit"
            id="send-message-btn"
            className={styles.sendBtn}
            disabled={!value.trim() || isLoading || disabled}
            title="Send message"
          >
            {isLoading ? (
              <span className={styles.spinner} />
            ) : (
              <span>▶</span>
            )}
          </button>
        </div>
        <p className={styles.hint}>
          ⚠️ Mini Court is an educational simulator. Not legal advice.
        </p>
      </form>
    </div>
  );
}
