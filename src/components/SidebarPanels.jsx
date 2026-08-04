import React, { useState } from 'react';
import styles from './SidebarPanels.module.css';

export default function SidebarPanels({ evidence = [], witnesses = [], strength = 30, history = [], onLoadCase }) {
  const [isOpen, setIsOpen] = useState(true);

  const getStrengthColor = (val) => {
    return val >= 75 ? '#52d68a' : val >= 45 ? '#e0a052' : '#e05252';
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? '' : styles.collapsed}`}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.toggleBtn} title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}>
        {isOpen ? '◀ Close Panel' : '📋 Open Panel'}
      </button>

      {isOpen && (
        <div className={styles.inner}>
          {/* Case Strength Meter */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>⚖️ Case Strength</h4>
            <div className={styles.meterWrap}>
              <div className={styles.meterText}>
                <span>Viability Index</span>
                <strong style={{ color: getStrengthColor(strength) }}>{strength}%</strong>
              </div>
              <div className={styles.meterTrack}>
                <div 
                  className={styles.meterFill} 
                  style={{ width: `${strength}%`, backgroundColor: getStrengthColor(strength) }} 
                />
              </div>
            </div>
          </div>

          {/* Evidence Locker */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>🔒 Evidence Locker</h4>
            {evidence.length === 0 ? (
              <p className={styles.emptyText}>No evidence logged yet. Use 'Add Evidence' to gather proof.</p>
            ) : (
              <div className={styles.evidenceGrid}>
                {evidence.map((item, idx) => (
                  <div key={idx} className={styles.evidenceCard}>
                    <span className={styles.evidenceIcon}>🔍</span>
                    <span className={styles.evidenceLabel}>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Witnesses list */}
          {witnesses.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>👥 Witnesses Standing</h4>
              <div className={styles.witnessList}>
                {witnesses.map((name, idx) => (
                  <div key={idx} className={styles.witnessTag}>
                    👤 {name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Case History */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>📜 Case Archive</h4>
            {history.length === 0 ? (
              <p className={styles.emptyText}>No archived investigations found.</p>
            ) : (
              <div className={styles.historyList}>
                {history.map((h) => (
                  <button 
                    key={h.id} 
                    className={styles.historyCard}
                    onClick={() => onLoadCase(h)}
                  >
                    <div className={styles.historyHeader}>
                      <span className={styles.historyTitle}>{h.title || 'Untitled Case'}</span>
                      <span className={styles.historyDate}>{new Date(h.date).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.historySub}>
                      <span>vs {h.accused}</span>
                      <span className={styles.historyVerdict} style={{ color: h.verdict === 'GUILTY' ? '#e05252' : '#52d68a' }}>{h.verdict}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
