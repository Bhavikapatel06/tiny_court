import styles from './ApiKeyModal.module.css';

export default function ApiKeyModal({ onSave }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const key = e.target.apikey.value.trim();
    if (key) onSave(key);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.gavel}>⚖️</div>
        <h1 className={styles.title}>Mini Court</h1>
        <p className={styles.subtitle}>AI-Powered Educational Courtroom Simulator</p>

        <div className={styles.divider} />

        <p className={styles.desc}>
          To power the courtroom AI, please enter your <strong>Google Gemini API Key</strong>.
          Your key is stored only in your browser and never sent to any server other than Google.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="apikey">Gemini API Key</label>
            <input
              id="apikey"
              name="apikey"
              type="password"
              placeholder="AIza..."
              autoComplete="off"
              required
            />
          </div>
          <button type="submit" className={styles.btn}>
            Enter the Courtroom →
          </button>
        </form>

        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          🔑 Get a free API key from Google AI Studio
        </a>

        <p className={styles.disclaimer}>
          ⚠️ Educational simulation only. Not legal advice.
        </p>
      </div>
    </div>
  );
}
