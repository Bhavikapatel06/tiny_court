import styles from './TypingIndicator.module.css';

export default function TypingIndicator() {
  return (
    <div className={`${styles.wrap} fade-in`}>
      <div className={styles.avatar}>⚖️</div>
      <div className={styles.bubble}>
        <span className={styles.label}>Mini Court AI is deliberating</span>
        <div className={styles.dots}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
