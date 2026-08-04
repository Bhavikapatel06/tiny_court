import React from 'react';
import styles from './MetersDashboard.module.css';

export default function MetersDashboard({ meters, trialLength }) {
  const {
    suspicion = 30,
    evidence = 40,
    severity = 25,
    dignity = 100,
    patience = 100,
    mercy = 0,
    means = 30,
    motive = 30,
    opportunity = 30
  } = meters || {};

  const getMeterColor = (val, type) => {
    if (type === 'good') {
      return val >= 70 ? '#52d68a' : val >= 40 ? '#e0a052' : '#e05252';
    }
    if (type === 'bad') {
      return val >= 70 ? '#e05252' : val >= 40 ? '#e0a052' : '#52d68a';
    }
    return 'var(--gold)';
  };

  return (
    <div className={styles.dashboard}>
      <h3 className={styles.title}>🏛️ Courtroom Dashboard</h3>
      
      <div className={styles.grid}>
        {/* Suspicion */}
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.label}>🔍 Suspicion (Guilt vibes)</span>
            <span className={styles.value} style={{ color: getMeterColor(suspicion, 'bad') }}>{suspicion}%</span>
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${suspicion}%`, background: getMeterColor(suspicion, 'bad') }} />
          </div>
        </div>

        {/* Evidence Weight */}
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.label}>🔬 Evidence Weight</span>
            <span className={styles.value} style={{ color: getMeterColor(evidence, 'good') }}>{evidence}%</span>
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${evidence}%`, background: getMeterColor(evidence, 'good') }} />
          </div>
        </div>

        {/* Court Dignity */}
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.label}>💅 Courtroom Dignity</span>
            <span className={styles.value} style={{ color: getMeterColor(dignity, 'good') }}>{dignity}%</span>
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${dignity}%`, background: getMeterColor(dignity, 'good') }} />
          </div>
        </div>

        {/* Judge's Patience */}
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.label}>⏳ Judge's Patience</span>
            <span className={styles.value} style={{ color: getMeterColor(patience, 'good') }}>{patience}%</span>
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${patience}%`, background: getMeterColor(patience, 'good') }} />
          </div>
        </div>

        {/* Severity */}
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.label}>🌶️ Petty Severity</span>
            <span className={styles.value}>{severity}%</span>
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${severity}%`, background: '#e0a052' }} />
          </div>
        </div>

        {/* Mercy */}
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.label}>💖 Court Mercy</span>
            <span className={styles.value} style={{ color: getMeterColor(mercy, 'good') }}>{mercy}%</span>
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${mercy}%`, background: getMeterColor(mercy, 'good') }} />
          </div>
        </div>
      </div>

      {/* Case File breakdown for Full Trials */}
      {trialLength === 'full' && (
        <div className={styles.caseFile}>
          <h4 className={styles.subTitle}>📂 Case File Breakdown</h4>
          <div className={styles.subGrid}>
            <div className={styles.subCard}>
              <span className={styles.subLabel}>🪓 Means</span>
              <span className={styles.subValue}>{means}%</span>
            </div>
            <div className={styles.subCard}>
              <span className={styles.subLabel}>💡 Motive</span>
              <span className={styles.subValue}>{motive}%</span>
            </div>
            <div className={styles.subCard}>
              <span className={styles.subLabel}>🚪 Opportunity</span>
              <span className={styles.subValue}>{opportunity}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
