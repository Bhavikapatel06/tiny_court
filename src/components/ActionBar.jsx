import React, { useState } from 'react';
import styles from './ActionBar.module.css';

export default function ActionBar({ trial, onNewCase, onServedToggle }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isServed = trial.completedSentence;

  // 1. Copy Verdict Summary to Clipboard
  const handleCopy = () => {
    const text = `⚖️ TINY COURT RECORD ⚖️
Case: ${trial.caseTitle || 'The People vs. The Suspect'}
Defendant: ${trial.accused || 'The Roommate'}
Charge: ${trial.charge || 'Unauthorized Dairy Appropriation'}
Verdict: ${trial.verdictLabel || trial.verdict || 'GUILTY'}
Order of the Court: ${trial.sentence || 'No Sentence Assigned'}
--
Settle petty household crimes with Tiny Court!`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // 2. Export Card as High-Res PNG Image (Zero dependency SVG -> Canvas rasterizer)
  const handleSaveImage = async () => {
    setIsSaving(true);
    try {
      const cardElem = document.getElementById('verdict-card-container');
      if (!cardElem) {
        alert('Verdict Card element not found!');
        setIsSaving(false);
        return;
      }

      // Clone element HTML and inline computed styles
      const width = cardElem.offsetWidth || 800;
      const height = cardElem.offsetHeight || 900;

      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: system-ui, sans-serif;">
              ${cardElem.outerHTML}
            </div>
          </foreignObject>
        </svg>
      `;

      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URLObj = window.URL || window.webkitURL || window;
      const svgUrl = URLObj.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * 2; // 2x high dpi scale
        canvas.height = height * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);

        URLObj.revokeObjectURL(svgUrl);
        const pngUrl = canvas.toDataURL('image/png');

        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `tiny_court_${(trial.caseTitle || 'verdict').toLowerCase().replace(/\s+/g, '_')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setIsSaving(false);
      };
      img.onerror = () => {
        // Fallback print/save prompt
        window.print();
        setIsSaving(false);
      };
      img.src = svgUrl;
    } catch (err) {
      console.error('Save image error:', err);
      setIsSaving(false);
    }
  };

  // 3. Share URL / Native Share API
  const handleShare = () => {
    const shareData = {
      title: 'Tiny Court Verdict',
      text: `Tiny Court Verdict: ${trial.caseTitle || 'Case'} — ${trial.verdictLabel || 'GUILTY'}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  return (
    <div className={styles.bar}>
      <button className={`${styles.btn} ${styles.btnCopy}`} onClick={handleCopy}>
        {copied ? '✓ Copied!' : 'Copy'}
      </button>

      <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleSaveImage} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Image'}
      </button>

      <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleShare}>
        {shared ? '✓ Link Copied!' : 'Share'}
      </button>

      <button
        className={`${styles.btn} ${isServed ? styles.btnServedActive : styles.btnSecondary}`}
        onClick={onServedToggle}
      >
        {isServed ? '✓ Served' : 'Served'}
      </button>

      <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onNewCase}>
        New Case
      </button>
    </div>
  );
}
