import React from 'react';
import CourtRecordGrid from './CourtRecordGrid.jsx';
import styles from './VerdictCard.module.css';

export default function VerdictCard({ trial }) {
  const verdictTitle = trial.verdictLabel || (trial.verdict === 'GUILTY' ? 'Guilty of Premeditated Snack Appropriation' : 'Acquitted of All Charges');
  const confidence = trial.confidence || trial.strength || 85;
  const meters = trial.meters || { suspicion: 46, evidence: 40, severity: 25, dignity: 82, mercy: 0, patience: 88 };
  
  const categoryReasonsMap = {
    Theft: [
      'The snack existed, was loved, and is now demonstrably gone.',
      'The accused had access, motive, and suspiciously good calcium levels.',
      'The defense leaned heavily on gravity.'
    ],
    'Property Damage': [
      'The structural integrity of the cushion was compromised without authorization.',
      'Scuff marks match the sole geometry of the accused\'s sneakers.',
      'The defense claimed the coffee cup jumped by itself.'
    ],
    Chores: [
      'The sink tower reached critical mass at 14.5 inches high.',
      'A 72-hour soak period exceeds all reasonable culinary statutes.',
      'Crusted cheese was found in the second degree.'
    ],
    Noise: [
      'Decibel readings surpassed acceptable residential limits past midnight.',
      'Headphones were found sitting unused 3 inches away from the audio jack.',
      'Subwoofer vibrations disturbed adjacent sleeping occupants.'
    ],
    'Pet Shenanigans': [
      'The missing left sock was discovered under the pet bed.',
      'Tail-wagging frequency spiked when confronted with the evidence.',
      'Paws matched the damp footprint trail leading to the laundry basket.'
    ]
  };

  const defaultSentenceMap = {
    Theft: "The accused must replace the snack, label it 'Evidence Custard,' and endure one passive-aggressive fridge note for 48 hours.",
    'Property Damage': "The accused shall perform 2 hours of furniture restoration and buy the complainant their beverage of choice for 3 days.",
    Chores: "The accused is assigned mandatory dish duty for one full week without listening to podcasts or music.",
    Noise: "The accused must enforce a strict 10 PM headphone rule and make morning coffee for the complainant for 4 days.",
    'Pet Shenanigans': "The accused must surrender all hoarded socks immediately and accept 5 compulsory belly rubs as punishment."
  };

  const defaultReasons = categoryReasonsMap[trial.caseType] || categoryReasonsMap.Theft;
  const reasons = (trial.reasons && trial.reasons.length > 0) ? trial.reasons : defaultReasons;
  const courtMood = trial.courtMood || 'Gravely unserious';
  const category = trial.caseType ? `Petty ${trial.caseType} Infraction` : 'Petty but Emotionally Significant';
  const sentence = trial.sentence || defaultSentenceMap[trial.caseType] || "The accused is cleared of all charges. Complainant must offer a verbal apology.";

  return (
    <div className={styles.wrapper} id="verdict-card-container">
      <div className={styles.verdictHeader}>
        <div className={styles.headerTop}>
          <span className={styles.courtSub}>THE COURT FINDS</span>
          <div className={styles.rubberStamp}>{trial.stamp || 'LESSER PETTINESS'}</div>
        </div>
        <h1 className={styles.verdictMainTitle}>{verdictTitle}</h1>
        <div className={styles.certainty}>{confidence}% fridge-light certainty</div>
      </div>

      <div className={styles.metricsContainer}>
        <div className={styles.metricItem}>
          <div className={styles.metricLabelRow}>
            <span>SUSPICION</span>
            <span className={styles.metricVal}>{meters.suspicion ?? 46}</span>
          </div>
          <div className={styles.metricTrack}>
            <div className={`${styles.metricFill} ${styles.fillRed}`} style={{ width: `${meters.suspicion ?? 46}%` }} />
          </div>
        </div>

        <div className={styles.metricItem}>
          <div className={styles.metricLabelRow}>
            <span>EVIDENCE</span>
            <span className={styles.metricVal}>{meters.evidence ?? 40}</span>
          </div>
          <div className={styles.metricTrack}>
            <div className={`${styles.metricFill} ${styles.fillPurple}`} style={{ width: `${meters.evidence ?? 40}%` }} />
          </div>
        </div>

        <div className={styles.metricItem}>
          <div className={styles.metricLabelRow}>
            <span>SEVERITY</span>
            <span className={styles.metricVal}>{meters.severity ?? 25}</span>
          </div>
          <div className={styles.metricTrack}>
            <div className={`${styles.metricFill} ${styles.fillGold}`} style={{ width: `${meters.severity ?? 25}%` }} />
          </div>
        </div>

        <div className={styles.metricItem}>
          <div className={styles.metricLabelRow}>
            <span>DIGNITY</span>
            <span className={styles.metricVal}>{meters.dignity ?? 82}</span>
          </div>
          <div className={styles.metricTrack}>
            <div className={`${styles.metricFill} ${styles.fillBlue}`} style={{ width: `${meters.dignity ?? 82}%` }} />
          </div>
        </div>

        <div className={styles.metricItem}>
          <div className={styles.metricLabelRow}>
            <span>MERCY</span>
            <span className={styles.metricVal}>{meters.mercy ?? 0}</span>
          </div>
          <div className={styles.metricTrack}>
            <div className={`${styles.metricFill} ${styles.fillGrey}`} style={{ width: `${meters.mercy ?? 0}%` }} />
          </div>
        </div>

        <div className={styles.metricItem}>
          <div className={styles.metricLabelRow}>
            <span>PATIENCE</span>
            <span className={styles.metricVal}>{meters.patience ?? 88}</span>
          </div>
          <div className={styles.metricTrack}>
            <div className={`${styles.metricFill} ${styles.fillBrown}`} style={{ width: `${meters.patience ?? 88}%` }} />
          </div>
        </div>
      </div>

      <ol className={styles.reasonsList}>
        {reasons.map((reason, idx) => (
          <li key={idx}>{reason}</li>
        ))}
      </ol>

      <div className={styles.moodCallout}>
        <span>Filed under: {category}. Court mood: {courtMood}.</span>
      </div>

      <div className={styles.gridSection}>
        <CourtRecordGrid trial={trial} />
      </div>

      <div className={styles.orderBox}>
        <div className={styles.orderTitle}>ORDER OF THE COURT</div>
        <div className={styles.orderText}>{sentence}</div>
      </div>
    </div>
  );
}
