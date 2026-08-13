import { analyzeUserMessage, generateDetectiveStepResponse } from './investigatorEngine.js';

const MOCK_WITNESSES = [
  { name: "Rahul (Study Buddy)", testimony: "I was sitting near the desk, yes, but I was busy studying. However, I did see a shadow reach into the bag when you went to get water." },
  { name: "The Classroom Desk", testimony: "I felt a sudden shift in weight around 2:00 PM. A hand brushed past my drawer, removing a book. It felt suspiciously quick." },
  { name: "The Hallway CCTV", testimony: "My lens captured a blurred figure in a red hoodie walking hurriedly away from room 103 at 2:05 PM, holding what looked like a textbook." },
  { name: "The Smart Fridge", testimony: "Internal sensors logged door opening at 02:14 AM. Door held open for 42 seconds. Weight drop detected on Shelf 2: -150g (Yogurt)." },
  { name: "The House Cat", testimony: "Meow. I saw everything from atop the refrigerator. The accused offered me zero bribes, so I am testifying against them." }
];

const MOCK_TWISTS = [
  "A surprise CCTV clip has surfaced showing the accused hiding the missing item under a stack of test papers!",
  "A witness has stepped forward claiming they saw the accused trading the missing item for a blueberry muffin in the cafeteria!",
  "The missing item was actually found inside the teacher's locker with the accused's initials scribbled on it!"
];

const MOCK_OBJECTIONS = [
  { text: "Objection! The prosecution is speculating on my client's late-night gaming habits!", ruling: "SUSTAINED. Keep the focus on the classroom/dispute." },
  { text: "Objection! Scurrilous accusations based purely on the accused looking suspicious!", ruling: "OVERRULED. The accused's nervous fidgeting is relevant alibi material." }
];

const CASE_PROFILES = {
  Theft: {
    title: "The People vs. The Snack Vanisher",
    charge: "Unauthorized Dairy & Snack Appropriation",
    verdictLabel: "Guilty of Premeditated Snack Appropriation",
    stamp: "LESSER PETTINESS",
    reasons: [
      "The snack existed, was loved, and is now demonstrably gone.",
      "The accused had access, motive, and suspiciously good calcium levels.",
      "The defense leaned heavily on gravity."
    ],
    acquittalReasons: [
      "No physical evidence placed the accused at the refrigerator.",
      "Spoon proximity alone is insufficient proof for conviction.",
      "Complainant failed to produce CCTV or fingerprint evidence."
    ],
    best_quote: "Spoon proximity alone cannot convict, but it does look bad.",
    sentence: "The accused must replace the snack, label it 'Evidence Custard,' and endure one passive-aggressive fridge note for 48 hours. A labeled snack is a loved snack.",
    acquittalSentence: "The accused is cleared of all theft charges. Complainant must offer a verbal apology and restock their own snacks.",
    courtMood: "Gravely unserious"
  },
  "Property Damage": {
    title: "The People vs. The Chair Scrubber",
    charge: "Aggravated Furniture Negligence",
    verdictLabel: "Guilty of Reckless Property Disregard",
    stamp: "MAXIMUM ABSURDITY",
    reasons: [
      "The structural integrity of the cushion was compromised without authorization.",
      "Scuff marks match the sole geometry of the accused's sneakers.",
      "The defense claimed the coffee cup jumped by itself."
    ],
    acquittalReasons: [
      "The stain pattern is consistent with accidental thermal spill expansion.",
      "The cushion flip was deemed a reasonable temporary cosmetic adjustment.",
      "Insufficient proof of malice or structural negligence."
    ],
    best_quote: "Stains speak louder than words in this jurisdiction.",
    sentence: "The accused shall perform 2 hours of furniture restoration and buy the complainant their beverage of choice for 3 consecutive days.",
    acquittalSentence: "The accused is acquitted of property damage. Complainant is advised to use coaster trays in the living room.",
    courtMood: "Slightly exasperated"
  },
  Chores: {
    title: "The People vs. The Dish Stacker",
    charge: "Felony Sink Abandonment & Dish Procrastination",
    verdictLabel: "Guilty of Dish-Stack Escalation",
    stamp: "FELONY PETTINESS",
    reasons: [
      "The sink tower reached critical mass at 14.5 inches high.",
      "A 72-hour soak period exceeds all reasonable culinary statutes.",
      "Crusted cheese was found in the second degree."
    ],
    acquittalReasons: [
      "The 72-hour soak period is protected under traditional roommate precedent.",
      "Sink stack height measurement failed certified judicial calibration.",
      "No written or signed dish washing schedule was presented in court."
    ],
    best_quote: "Soaking for three days is not a cleaning strategy, it's a biohazard.",
    sentence: "The accused is assigned mandatory dish duty for one full week without listening to podcasts or music.",
    acquittalSentence: "The accused is acquitted of sink abandonment. Complainant must assist with the current dish cycle.",
    courtMood: "Judicially stern"
  },
  Noise: {
    title: "The People vs. The Midnight Bassist",
    charge: "Loud Decibel Pollution & Sleep Deprivation",
    verdictLabel: "Guilty of Midnight Decibel Overload",
    stamp: "HIGH VOLTAGE",
    reasons: [
      "Decibel readings surpassed acceptable residential limits past midnight.",
      "Headphones were found sitting unused 3 inches away from the audio jack.",
      "Subwoofer vibrations disturbed adjacent sleeping occupants."
    ],
    acquittalReasons: [
      "Decibel levels did not exceed municipal residential noise thresholds.",
      "Headphone connection status was ambiguous at the alleged timestamp.",
      "Complainant's sleep deprivation claims lacked third-party corroboration."
    ],
    best_quote: "Your bass drop dropped the court's patience to zero.",
    sentence: "The accused must enforce a strict 10 PM headphone rule and make morning coffee for the complainant for 4 days.",
    acquittalSentence: "The accused is acquitted of decibel violations. Complainant is advised to wear earplugs during late hours.",
    courtMood: "Sleep-deprived"
  },
  "Pet Shenanigans": {
    title: "The People vs. The Sock Thief",
    charge: "Grand Theft Canine Sock Concealment",
    verdictLabel: "Guilty of Unlawful Laundry Possession",
    stamp: "VERY GOOD BOY?",
    reasons: [
      "The missing left sock was discovered under the pet bed.",
      "Tail-wagging frequency spiked when confronted with the evidence.",
      "Paws matched the damp footprint trail leading to the laundry basket."
    ],
    acquittalReasons: [
      "The accused is a pet and legally lacks criminal intent (mens rea).",
      "The sock was retrieved in good faith under chew-toy customary law.",
      "Defendant displayed immediate remorse via enthusiasm and tail wags."
    ],
    best_quote: "Tail wags do not constitute a legal defense in this court.",
    sentence: "The accused must surrender all hoarded socks immediately and accept 5 compulsory belly rubs as punishment.",
    acquittalSentence: "The accused is acquitted of all charges with zero penalty. Defendant receives one complimentary treat.",
    courtMood: "Pawsitively amused"
  }
};

export function runSimulationStep(trial, action, userText = "") {
  const state = JSON.parse(JSON.stringify(trial));
  let role = "Investigator";
  let content = "";
  let timelineUpdate = null;

  const clamp = (val) => Math.min(100, Math.max(0, val));

  if (!state.facts) {
    state.facts = { evidence: [] };
  }

  // Update intelligent detective facts
  state.facts = analyzeUserMessage(state.facts, userText);

  // Sync suspect if identified
  if (state.facts.suspect && (!state.accused || state.accused === 'The Suspect')) {
    state.accused = state.facts.suspect;
  }

  // Calculate dynamic case strength and meters based on gathered facts
  let calcStrength = 30;
  if (state.facts.crime) calcStrength += 10;
  if (state.facts.suspect) calcStrength += 20;
  if (state.facts.time) calcStrength += 10;
  if (state.facts.location) calcStrength += 10;
  if (state.facts.evidence && state.facts.evidence.length > 0) calcStrength += (state.facts.evidence.length * 15);
  if (state.witnesses && state.witnesses.length > 0) calcStrength += (state.witnesses.length * 15);
  if (state.twistUsed) calcStrength += 15;

  state.strength = clamp(calcStrength);
  state.meters.suspicion = clamp(30 + (state.facts.suspect ? 25 : 0) + (state.facts.crime ? 15 : 0));
  state.meters.evidence = clamp(20 + ((state.facts.evidence?.length || 0) * 20) + (state.facts.location ? 15 : 0));

  if (action === "open_case") {
    state.phase = "trial";
    state.focus = "case";
    state.complaint = userText;
    state.timeline = { complaint: true, evidence: false, witness: false, complete: false };

    // Auto-detect caseType from crime if available
    if (state.facts.crime) {
      const lc = state.facts.crime.toLowerCase();
      if (lc.includes("noise") || lc.includes("decibel") || lc.includes("music") || lc.includes("shouting")) state.caseType = "Noise";
      else if (lc.includes("dish") || lc.includes("sink") || lc.includes("chores")) state.caseType = "Chores";
      else if (lc.includes("laundry") || lc.includes("sock") || lc.includes("pet")) state.caseType = "Pet Shenanigans";
      else if (lc.includes("damage") || lc.includes("cushion") || lc.includes("stain")) state.caseType = "Property Damage";
      else if (lc.includes("theft") || lc.includes("snack") || lc.includes("yogurt") || lc.includes("book")) state.caseType = "Theft";
    }

    const profile = CASE_PROFILES[state.caseType] || CASE_PROFILES.Theft;
    state.caseTitle = state.facts.crime ? `The People vs. ${state.facts.crime}` : profile.title;
    state.charge = profile.charge;
    state.courtMood = profile.courtMood;

    const detectiveStep = generateDetectiveStepResponse(state.facts, userText, action);
    content = detectiveStep.fullText;
    role = "Investigator";
  }

  else if (action === "chatter" || action === "submit_evidence" || action === "name_suspect") {
    if (action === "submit_evidence") {
      if (!state.evidence) state.evidence = [];
      state.evidence.push(userText);
      state.meters.evidence = clamp(state.meters.evidence + 20);
      state.strength = clamp(state.strength + 15);
      state.timeline.evidence = true;
      timelineUpdate = { label: "Evidence Logged", status: "success" };
    } else if (action === "name_suspect") {
      state.accused = userText;
      state.meters.suspicion = clamp(state.meters.suspicion + 25);
      state.strength = clamp(state.strength + 15);
    }

    const detectiveStep = generateDetectiveStepResponse(state.facts, userText, action);
    content = detectiveStep.fullText;
    role = "Investigator";
  }

  else if (action === "call_witness") {
    const hash = (state.witnesses?.length || 0) + (state.evidence?.length || 0);
    const mockWitness = MOCK_WITNESSES[hash % MOCK_WITNESSES.length];

    if (!state.witnesses) state.witnesses = [];
    state.witnesses.push(mockWitness.name);
    state.facts.witness = mockWitness.name;

    state.meters.evidence = clamp(state.meters.evidence + 15);
    state.strength = clamp(state.strength + 15);
    state.timeline.witness = true;

    role = `Witness: ${mockWitness.name}`;
    content = `(The Court summons ${mockWitness.name} to the witness stand)

"${mockWitness.testimony}"`;

    timelineUpdate = { label: "Witness Testimony", status: "success" };
  }

  else if (action === "object") {
    state.objectionUsed = true;
    state.meters.patience = clamp(state.meters.patience - 15);
    const hash = state.evidence?.length || 0;
    const obj = MOCK_OBJECTIONS[hash % MOCK_OBJECTIONS.length];

    role = "Judge";
    content = `Objection raised by the defense: **${obj.ruling}** (Judge's patience drops to ${state.meters.patience}%)`;
  }

  else if (action === "add_twist") {
    state.twistUsed = true;
    state.strength = clamp(state.strength + 20);
    const hash = state.evidence?.length || 0;
    const twistText = MOCK_TWISTS[hash % MOCK_TWISTS.length];

    role = "Investigator";
    content = `⚠️ **SURPRISE COURTROOM TWIST!**

${twistText}`;
  }

  else if (action === "ask_judge") {
    state.phase = "verdict";
    state.timeline.complete = true;

    // Detect caseType if crime is known
    if (state.facts.crime) {
      const lc = state.facts.crime.toLowerCase();
      if (lc.includes("noise") || lc.includes("decibel") || lc.includes("music") || lc.includes("shouting")) state.caseType = "Noise";
      else if (lc.includes("dish") || lc.includes("sink") || lc.includes("chores")) state.caseType = "Chores";
      else if (lc.includes("laundry") || lc.includes("sock") || lc.includes("pet")) state.caseType = "Pet Shenanigans";
      else if (lc.includes("damage") || lc.includes("cushion") || lc.includes("stain")) state.caseType = "Property Damage";
      else if (lc.includes("theft") || lc.includes("snack") || lc.includes("yogurt") || lc.includes("book")) state.caseType = "Theft";
    }

    const profile = CASE_PROFILES[state.caseType] || CASE_PROFILES.Theft;
    const isGuilty = state.strength >= 45;

    state.verdict = isGuilty ? "GUILTY" : "NOT GUILTY";
    state.confidence = state.strength;

    state.verdictLabel = isGuilty ? (state.facts.crime ? `Guilty of ${state.facts.crime}` : profile.verdictLabel) : "Acquitted of All Charges";
    state.stamp = isGuilty ? profile.stamp : "SUMMARY ACQUITTAL";
    state.caseTitle = state.caseTitle || profile.title;
    state.charge = profile.charge;
    state.reasons = isGuilty ? profile.reasons : profile.acquittalReasons;
    state.best_quote = profile.best_quote;
    state.sentence = isGuilty ? profile.sentence : profile.acquittalSentence;
    state.courtMood = profile.courtMood;

    role = "Judge";
    content = `The Court has deliberated and reached a final verdict.

**Verdict:** ${state.verdictLabel} (${state.confidence}% certainty)
**Order of the Court:** ${state.sentence}`;
  }

  const responseText = `${content}
---
ROLE: ${role}
VERDICT: ${state.verdict || ''}
CONFIDENCE_SCORE: ${state.confidence || ''}
`;

  return { state, responseText, timelineUpdate };
}
