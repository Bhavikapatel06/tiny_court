/**
 * Smart Detective AI Engine for Mini Court
 * Performs natural NLP fact extraction, deductive reasoning, single-question follow-ups,
 * and maintains investigation notebooks without mechanical echo responses.
 */

// Basic keyword regex patterns for natural fact extraction
const PATTERNS = {
  time: /(afternoon|morning|night|evening|midnight|\d{1,2}\s*(?:am|pm|o'clock)|yesterday|today|last night|lunchtime)/i,
  location: /(kitchen|fridge|refrigerator|room|bedroom|living room|desk|study|classroom|hallway|locker|sink|shelf|couch|bed|car|office)/i,
  evidence: /(crumb|note|receipt|fingerprint|photo|video|cctv|footprint|stain|hair|wrapper|clue|mark|cushion|audio|log|lock)/i,
  noWitness: /(didn't see|nobody|no one|no witness|saw nothing|was alone|wasn't looking|didn't catch|nobody around)/i,
  witness: /(saw|noticed|witness|classmate|roommate|friend|cat|dog|smart fridge|cctv|security|janitor|neighbor)/i
};

/**
 * Parses user message and updates investigation facts state intelligently
 */
export function analyzeUserMessage(currentFacts = {}, userText = "") {
  const text = userText.trim();
  const lower = text.toLowerCase();

  const nextFacts = {
    crime: currentFacts.crime || null,
    item: currentFacts.item || null,
    time: currentFacts.time || null,
    location: currentFacts.location || null,
    suspect: currentFacts.suspect || null,
    witness: currentFacts.witness || null,
    evidence: currentFacts.evidence ? [...currentFacts.evidence] : [],
    noWitness: currentFacts.noWitness || false,
    readyNotified: currentFacts.readyNotified || false,
    history: currentFacts.history ? [...currentFacts.history, text] : [text]
  };

  // 1. Extract Crime / Item if not set
  if (!nextFacts.crime || !nextFacts.item) {
    if (lower.includes("book")) {
      nextFacts.crime = "Literary Heist (Book Theft)";
      nextFacts.item = "Book";
    } else if (lower.includes("snack") || lower.includes("yogurt") || lower.includes("food") || lower.includes("custard")) {
      nextFacts.crime = "Unauthorized Snack Appropriation";
      nextFacts.item = lower.includes("yogurt") ? "Yogurt" : "Snack";
    } else if (lower.includes("dish") || lower.includes("sink")) {
      nextFacts.crime = "Felony Sink Abandonment";
      nextFacts.item = "Unwashed Dishes";
    } else if (lower.includes("noise") || lower.includes("music") || lower.includes("bass") || lower.includes("gaming") || lower.includes("shouting")) {
      nextFacts.crime = "Midnight Decibel Violation";
      nextFacts.item = "Quiet Hours";
    } else if (lower.includes("sock") || lower.includes("clothes") || lower.includes("towel")) {
      nextFacts.crime = "Unlawful Laundry Possession";
      nextFacts.item = "Sock / Apparel";
    } else if (text.length > 5 && !nextFacts.crime) {
      nextFacts.crime = `Alleged Incident (${text.slice(0, 30)}...)`;
      nextFacts.item = "Subject Item";
    }
  }

  // 2. Extract Time
  if (!nextFacts.time) {
    const timeMatch = text.match(PATTERNS.time);
    if (timeMatch) {
      nextFacts.time = timeMatch[0];
    }
  }

  // 3. Extract Location
  if (!nextFacts.location) {
    const locMatch = text.match(PATTERNS.location);
    if (locMatch) {
      nextFacts.location = locMatch[0];
    }
  }

  // 4. Check for No Witness vs Witness
  if (PATTERNS.noWitness.test(text)) {
    nextFacts.noWitness = true;
    nextFacts.witness = "None (No eyewitnesses present)";
  } else if (!nextFacts.witness) {
    const witnessMatch = text.match(PATTERNS.witness);
    if (witnessMatch) {
      nextFacts.witness = witnessMatch[0];
    }
  }

  // 5. Extract Evidence
  const evMatch = text.match(PATTERNS.evidence);
  if (evMatch && !nextFacts.evidence.includes(evMatch[0])) {
    nextFacts.evidence.push(evMatch[0]);
  }

  return nextFacts;
}

/**
 * Formats a clean Detective Notebook Summary
 */
export function formatNotebookSummary(facts) {
  const known = [];
  if (facts.crime) known.push(`• **Crime:** ${facts.crime}`);
  if (facts.time) known.push(`• **Estimated Time:** ${facts.time}`);
  if (facts.location) known.push(`• **Location:** ${facts.location}`);
  if (facts.suspect) known.push(`• **Prime Suspect:** ${facts.suspect}`);
  if (facts.witness) known.push(`• **Eyewitness Status:** ${facts.witness}`);
  if (facts.evidence && facts.evidence.length > 0) known.push(`• **Physical Evidence:** ${facts.evidence.join(', ')}`);

  const missing = [];
  if (!facts.time) missing.push("Time of Incident");
  if (!facts.location) missing.push("Specific Location");
  if (!facts.suspect) missing.push("Prime Suspect");
  if (!facts.witness && !facts.noWitness) missing.push("Eyewitnesses / CCTV");
  if (facts.evidence.length === 0) missing.push("Physical Clues / Evidence");

  return `
🕵️‍♂️ **Detective's Investigation Log:**
${known.length > 0 ? known.join('\n') : '• *Gathering initial statement...*'}

📌 **Still Investigating:** ${missing.length > 0 ? missing.join(', ') : 'All key elements collected!'}`;
}

/**
 * Generates natural Detective responses (No repetition / echoing!)
 * Asks only ONE relevant question at a time.
 */
export function generateDetectiveStepResponse(facts, lastInput, actionType) {
  const lower = (lastInput || "").toLowerCase();

  // If user named a suspect
  if (actionType === 'name_suspect' || (!facts.suspect && (lower.startsWith("i suspect") || lower.startsWith("it was") || lower.includes("roommate") || lower.includes("dave")))) {
    const suspectName = lastInput.replace(/^i suspect|^it was/i, "").trim() || "The Suspect";
    facts.suspect = suspectName;
  }

  // Evaluate missing items
  const missingTime = !facts.time;
  const missingLoc = !facts.location;
  const missingSuspect = !facts.suspect;
  const missingEvidence = facts.evidence.length === 0;

  // Check if case is ready for court
  const isReadyForCourt = (!missingTime || !missingLoc) && (!missingSuspect || !missingEvidence || facts.noWitness);

  let responseBody = "";
  let followUpQuestion = "";

  if (isReadyForCourt) {
    if (facts.readyNotified && lastInput && lastInput.trim().length > 0) {
      responseBody = `Got it! Adding your update to our case notes: "${lastInput.trim()}". This provides additional context to our investigation log.`;
    } else {
      facts.readyNotified = true;
      responseBody = `Ah, excellent work! We have gathered substantial probable cause regarding the **${facts.crime || 'incident'}**.
    
We've established key facts:
- Location: ${facts.location || 'Reported area'}
- Timeframe: ${facts.time || 'Estimated period'}
- Suspect / Evidence: ${facts.suspect ? `Prime suspect ${facts.suspect}` : `Physical evidence logged: ${facts.evidence.join(', ') || 'Circumstantial'}`}`;
    }

    responseBody += `\n\n🔍 **Investigation Status: Complete & Ready for Court!**\nYou have collected enough evidence to present a solid case. Whenever you are ready, click **👨‍⚖️ Ask Judge** to convene the court for final trial and sentencing!`;

    followUpQuestion = "";
  } else {
    // Determine deductive reasoning response based on last input
    if (facts.noWitness && lower.includes("didn't see")) {
      responseBody = `I see—so no direct eyewitnesses were at the scene when the incident took place. That means we must rely on physical proof or circumstantial clues.`;
    } else if (facts.time && lower.includes(facts.time.toLowerCase())) {
      responseBody = `Understood. Establishing the timeframe around **${facts.time}** narrows down our window of opportunity significantly.`;
    } else if (facts.location && lower.includes(facts.location.toLowerCase())) {
      responseBody = `Aha! The **${facts.location}** is key crime scene territory. I'm noting the spatial coordinates of the offense.`;
    } else if (lastInput && lastInput.trim().length > 0) {
      responseBody = `I've logged your detail: "${lastInput.trim()}". I'm analyzing how this connects to our investigation.`;
    } else if (facts.crime) {
      responseBody = `I have formally opened an investigation into **${facts.crime}**. Let's systematically piece together what happened.`;
    } else {
      responseBody = `I'm analyzing your report carefully. Every detail brings us closer to solving this case.`;
    }

    // Ask ONLY ONE single follow-up question
    if (missingTime) {
      followUpQuestion = `Approximately what time did you notice the incident occur?`;
    } else if (missingLoc) {
      followUpQuestion = `Where specifically did this take place?`;
    } else if (missingSuspect) {
      followUpQuestion = `Do you have a specific suspect in mind, or did someone have access to the area?`;
    } else if (missingEvidence) {
      followUpQuestion = `Did the culprit leave behind any physical clues, wrappers, marks, or evidence?`;
    }
  }

  const notebookStr = formatNotebookSummary(facts);

  const fullText = `${responseBody}

${followUpQuestion ? `❓ **Follow-up Question:** ${followUpQuestion}` : ''}

${notebookStr}`;

  return { fullText, facts, isReadyForCourt };
}
