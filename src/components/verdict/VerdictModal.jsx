import React, { useState } from 'react';
import CourtRecordGrid from './CourtRecordGrid.jsx';
import ActionBar from './ActionBar.jsx';
import styles from './VerdictModal.module.css';

export default function VerdictModal({ trial, onNewCase, onServedToggle, onClose }) {
  const [cardStep, setCardStep] = useState(1);

  const verdictTitle = trial.verdictLabel || (trial.verdict === 'GUILTY' ? 'Guilty of Premeditated Snack Appropriation' : 'Acquitted of All Charges');
  const confidence = trial.confidence || trial.strength || 85;
  const meters = trial.meters || { suspicion: 46, evidence: 40, severity: 25, dignity: 82, mercy: 0, patience: 88 };
  
  const defaultReasons = [
    'The snack existed, was loved, and is now demonstrably gone.',
    'The accused had access, motive, and suspiciously good calcium levels.',
    'The defense leaned heavily on gravity.'
  ];
  const reasons = (trial.reasons && trial.reasons.length > 0) ? trial.reasons : defaultReasons;
  const courtMood = trial.courtMood || 'Gravely unserious';
  const category = trial.caseType ? `Petty ${trial.caseType} Infraction` : 'Petty but Emotionally Significant';
  const sentence = trial.sentence || "The accused must replace the snack, label it 'Evidence Custard,' and endure one passive-aggressive fridge note for 48 hours. The court reminds all parties: a labeled snack is a loved snack.";

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContent} id="verdict-card-container">
        
        <div className={styles.modalHeader}>
          <div className={styles.stepBadges}>
            <span className={`${styles.badge} ${cardStep === 1 ? styles.badgeActive : ''}`} onClick={() => setCardStep(1)}>
              Card 1: Verdict Ruling
            </span>
            <span className={styles.badgeSep}>➔</span>
            <span className={`${styles.badge} ${cardStep === 2 ? styles.badgeActive : ''}`} onClick={() => setCardStep(2)}>
              Card 2: Court Record
            </span>
          </div>

          <button className={styles.closeBtn} onClick={onClose} title="Close Popup">×</button>
        </div>

        {cardStep === 1 && (
          <div className={styles.cardStepWrapper}>
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
              Filed under: {category}. Court mood: {courtMood}.
            </div>

            <div className={styles.orderBox}>
              <div className={styles.orderTitle}>ORDER OF THE COURT</div>
              <div className={styles.orderText}>{sentence}</div>
            </div>

            <div className={styles.card1Footer}>
              <button className={styles.acceptBtn} onClick={() => setCardStep(2)}>
                Accept Ruling & View Court Record ➔
              </button>
            </div>
          </div>
        )}

        {cardStep === 2 && (
          <div className={styles.cardStepWrapper}>
            <CourtRecordGrid trial={trial} />

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

            <div className={styles.orderBox}>
              <div className={styles.orderTitle}>ORDER OF THE COURT</div>
              <div className={styles.orderText}>{sentence}</div>
            </div>

            <ActionBar
              trial={trial}
              onNewCase={onNewCase}
              onServedToggle={onServedToggle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
