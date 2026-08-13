import React, { useState, useEffect } from 'react';
import styles from './WelcomeScreen.module.css';

export default function WelcomeScreen({ onStart, isModeSim, toggleMode }) {
  const [complaint, setComplaint] = useState('');
  const [caseType, setCaseType] = useState('Theft');
  const [mongoCases, setMongoCases] = useState([]);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'funny'

  useEffect(() => {
    fetchMongoCases();
  }, []);

  const fetchMongoCases = async () => {
    setIsLoadingCases(true);
    try {
      const res = await fetch('/api/cases');
      const data = await res.json();
      if (data.success && data.cases) {
        setMongoCases(data.cases);
        setDbConnected(true);
      }
    } catch (err) {
      console.warn('Failed to load cases:', err);
      setDbConnected(false);
    } finally {
      setIsLoadingCases(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!complaint.trim()) return;
    onStart({ caseType, complaint: complaint.trim() });
  };

  const handleSelectFunnyCase = (item, instantStart = false) => {
    setCaseType(item.caseType || 'Theft');
    setComplaint(item.complaint);
    if (instantStart) {
      onStart({ caseType: item.caseType || 'Theft', complaint: item.complaint });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Main Header */}
        <div className={styles.headerBox}>
          <div className={styles.gavelBadge}>⚖️</div>
          <h1 className={styles.title}>Mini Court</h1>
          <p className={styles.subtitle}>AI-Powered Household & Petty Dispute Simulator</p>
          
          <div className={styles.dbStatusBadge}>
            <span className={styles.dbDot}></span>
            Case Database Status: <strong style={{ color: '#4ade80', marginLeft: '4px' }}>Online & Ready</strong>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'new' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('new')}
          >
            ✍️ Open New Case
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'funny' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('funny')}
          >
            🔥 Featured Cases ({mongoCases.length})
          </button>
        </div>

        {/* TAB 1: New Case Form */}
        {activeTab === 'new' && (
          <div className={styles.card}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Select Incident Category:</label>
                <div className={styles.categories}>
                  {['Theft', 'Property Damage', 'Chores', 'Noise', 'Pet Shenanigans'].map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      className={`${styles.catBtn} ${caseType === cat ? styles.catBtnActive : ''}`}
                      onClick={() => setCaseType(cat)}
                    >
                      {cat === 'Theft' ? '🥪 Theft' :
                       cat === 'Property Damage' ? '🛋️ Damage' :
                       cat === 'Chores' ? '🧽 Chores' :
                       cat === 'Noise' ? '🎧 Noise' : '🐾 Pet'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>State Your Complaint / Accusation:</label>
                <textarea
                  className={styles.textarea}
                  placeholder="e.g. Someone stole my favorite strawberry yogurt from the fridge at 2:00 PM..."
                  rows={4}
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={!complaint.trim()}>
                🕵️‍♂️ Open Investigation
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Featured Cases Gallery */}
        {activeTab === 'funny' && (
          <div className={styles.funnyContainer}>
            <div className={styles.funnyHeader}>
              <h3>🏛️ Featured Courtroom Case Archives</h3>
              <p>Explore top household dispute cases or try any case instantly in court!</p>
            </div>

            {isLoadingCases ? (
              <div className={styles.loadingState}>⏳ Loading featured cases...</div>
            ) : mongoCases.length === 0 ? (
              <div className={styles.emptyState}>No cases found. Click "✍️ Open New Case" to create one!</div>
            ) : (
              <div className={styles.casesGrid}>
                {mongoCases.map((c, idx) => (
                  <div key={c._id || idx} className={styles.caseCard}>
                    <div className={styles.caseTop}>
                      <span className={styles.caseIcon}>{c.icon || '⚖️'}</span>
                      <span className={styles.caseTag}>{c.caseType}</span>
                    </div>

                    <h4 className={styles.caseTitle}>{c.caseTitle}</h4>
                    <p className={styles.caseComplaint}>"{c.complaint}"</p>

                    <div className={styles.caseMeta}>
                      <div>👤 <strong>Accused:</strong> {c.accused}</div>
                      <div>⚖️ <strong>Verdict:</strong> <span className={styles.verdictPill}>{c.verdict}</span></div>
                      <div>📜 <strong>Sentence:</strong> {c.sentence}</div>
                    </div>

                    {c.tags && c.tags.length > 0 && (
                      <div className={styles.tagsRow}>
                        {c.tags.map((t, ti) => (
                          <span key={ti} className={styles.miniTag}>#{t}</span>
                        ))}
                      </div>
                    )}

                    <div className={styles.cardActions}>
                      <button 
                        className={styles.useCaseBtn}
                        onClick={() => {
                          handleSelectFunnyCase(c, false);
                          setActiveTab('new');
                        }}
                      >
                        📝 Fill Form
                      </button>
                      <button 
                        className={styles.launchCaseBtn}
                        onClick={() => handleSelectFunnyCase(c, true)}
                      >
                        ⚡ Try Case
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
