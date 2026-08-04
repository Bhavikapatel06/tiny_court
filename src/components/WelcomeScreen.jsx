import React, { useState } from 'react';
import styles from './WelcomeScreen.module.css';

const CASE_TYPES = [
  { icon: '🛒', label: 'Theft', desc: 'Stolen food, objects, or charging cables' },
  { icon: '🏠', label: 'Property Damage', desc: 'Spills, breakages, or unmade beds' },
  { icon: '👨‍👩‍👧', label: 'Family Dispute', desc: 'Thermostat wars, chores, remote hogging' },
  { icon: '💬', label: 'Chatbot (Other)', desc: 'Friendly conversation or advice' }
];

const SAMPLE_CASES = {
  Theft: [
    { title: "🍕 Leftover Pizza Caper", complaint: "Someone ate my last slice of leftover pepperoni pizza overnight. It had my initials on the box!" },
    { title: "🔌 Missing Charging Cable", complaint: "My phone charging cable vanished from my study desk, and now my roommate's phone is fully charged." }
  ],
  PropertyDamage: [
    { title: "🐕 Chewed Slipper Incident", complaint: "My favorite leather slipper was chewed up and left in the backyard. I suspect the puppy." },
    { title: "☕ Coffee Rug Spill", complaint: "A full mug of coffee was spilled on our brand new white living room rug, and nobody is admitting it." }
  ],
  FamilyDispute: [
    { title: "❄️ Thermostat Warfare", complaint: "The thermostat was secretly locked at a freezing 64 degrees. Dad denies touching it." },
    { title: "📺 Remote Control Hegemony", complaint: "My sibling sat on the TV remote for three hours refuse to fold laundry or share the screen." }
  ],
  'Chatbot (Other)': [
    { title: "⚖️ What is Mini Court?", complaint: "Explain what you can do and how I can use this courtroom simulation." },
    { title: "🦖 Share a funny story", complaint: "Tell me a funny hypothetical case about a dinosaur stealing lawnmowers." }
  ]
};

export default function WelcomeScreen({ onStart, isModeSim, toggleMode }) {
  const [selectedType, setSelectedType] = useState('Theft');
  const [complaint, setComplaint] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!complaint.trim()) return;
    onStart({
      caseType: selectedType,
      complaint: complaint.trim()
    });
  };

  const handleSampleClick = (text) => {
    setComplaint(text);
  };

  const isChatbotSelected = selectedType === 'Chatbot (Other)';

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.scales}>⚖️</div>
        <h2 className={styles.heading}>Tiny Court Room</h2>
        <p className={styles.subheading}>
          Settle petty everyday grievances, or chat with our courtroom assistant.
        </p>
      </div>

      <div className={styles.modeIndicator}>
        <span>Active Engine: <strong>{isModeSim ? 'Offline Simulation' : 'Gemini AI Mode'}</strong></span>
        <button onClick={toggleMode} className={styles.toggleBtn}>
          Switch to {isModeSim ? 'Gemini AI' : 'Offline Simulation'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Case Type Grid */}
        <div className={styles.section}>
          <label className={styles.label}>1. Select Case Type / Mode</label>
          <div className={styles.grid}>
            {CASE_TYPES.map((c) => (
              <button
                key={c.label}
                type="button"
                className={`${styles.card} ${selectedType === c.label ? styles.activeCard : ''}`}
                onClick={() => {
                  setSelectedType(c.label);
                  setComplaint(''); // Clear complaint on type change
                }}
              >
                <span className={styles.cardIcon}>{c.icon}</span>
                <span className={styles.cardLabel}>{c.label}</span>
                <span className={styles.cardDesc}>{c.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            {isChatbotSelected ? '2. What would you like to discuss?' : '2. Tell me what happened.'}
          </label>
          <textarea
            className={styles.textarea}
            placeholder={isChatbotSelected ? "Ask for general advice or type a message..." : "Someone stole my book from my classroom."}
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            required
            rows={3}
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={!complaint.trim()}>
          {isChatbotSelected ? '💬 Start Chatting' : '🕵️‍♂️ Start Investigation'}
        </button>
      </form>

      {/* Dynamic Samples Section */}
      <div className={styles.samplesSection}>
        <h3 className={styles.samplesTitle}>💡 Sample Prompts</h3>
        <div className={styles.samplesGrid}>
          {SAMPLE_CASES[selectedType].map((s, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.sampleCard}
              onClick={() => handleSampleClick(s.complaint)}
            >
              <strong>{s.title}</strong>
              <p>{s.complaint}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
