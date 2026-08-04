import React from 'react';
import styles from './CourtRecordGrid.module.css';

export default function CourtRecordGrid({ trial }) {
  const caseName = trial.caseTitle || 'The People vs. The Suspect';
  const defendant = trial.accused || 'The Roommate';
  const charge = trial.charge || 'Petty Household Infraction';
  const verdictLabel = trial.verdictLabel || trial.verdict || 'Guilty of Premeditated Snack Appropriation';
  const confidence = trial.confidence || trial.strength || 85;
  const bestQuote = trial.best_quote || 'Spoon proximity alone cannot convict, but it does look bad.';

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Court Record</h2>
        <div className={styles.stampCircle}>
          <div className={styles.stampInner}>
            <span>TINY</span>
            <span>COURT</span>
            <span>CERTIFIED</span>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>CASE</div>
          <div className={styles.cardValue}>{caseName}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>DEFENDANT</div>
          <div className={styles.cardValue}>{defendant}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>CHARGE</div>
          <div className={styles.cardValue}>{charge}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>VERDICT</div>
          <div className={styles.cardValue}>
            {verdictLabel} — {confidence}% fridge-light certainty
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardFull}`}>
          <div className={styles.cardLabel}>BEST QUOTE</div>
          <div className={styles.cardQuote}>“{bestQuote}”</div>
        </div>
      </div>
    </div>
  );
}
