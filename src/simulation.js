// Immersive story-driven offline simulation engine for Tiny Court

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

// Preset case profiles for varied Verdict Cards
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
    best_quote: "Spoon proximity alone cannot convict, but it does look bad.",
    sentence: "The accused must replace the snack, label it 'Evidence Custard,' and endure one passive-aggressive fridge note for 48 hours. A labeled snack is a loved snack.",
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
    best_quote: "Stains speak louder than words in this jurisdiction.",
    sentence: "The accused shall perform 2 hours of furniture restoration and buy the complainant their beverage of choice for 3 consecutive days.",
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
    best_quote: "Soaking for three days is not a cleaning strategy, it's a biohazard.",
    sentence: "The accused is assigned mandatory dish duty for one full week without listening to podcasts or music.",
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
    best_quote: "Your bass drop dropped the court's patience to zero.",
    sentence: "The accused must enforce a strict 10 PM headphone rule and make morning coffee for the complainant for 4 days.",
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
    best_quote: "Tail wags do not constitute a legal defense in this court.",
    sentence: "The accused must surrender all hoarded socks immediately and accept 5 compulsory belly rubs as punishment.",
    courtMood: "Pawsitively amused"
  }
};

export function runSimulationStep(trial, action, userText = "") {
  const state = JSON.parse(JSON.stringify(trial));
  let role = "Investigator";
  let content = "";
  let timelineUpdate = null;

  const clamp = (val) => Math.min(100, Math.max(0, val));

  if (action === "open_case") {
    state.phase = "trial";
    state.focus = "case";
    state.complaint = userText;
    state.meters.suspicion = 35;
    state.meters.evidence = 25;
    state.strength = 35;
    state.timeline = { complaint: true, evidence: false, witness: false, complete: false };
    
    // Pick preset profile based on caseType
    const profile = CASE_PROFILES[state.caseType] || CASE_PROFILES.Theft;
    state.caseTitle = profile.title;
    state.charge = profile.charge;
    state.courtMood = profile.courtMood;

    role = "Investigator";
    content = `Case formally opened: **"${state.caseTitle}"** under charge of **${state.charge}**.
    
I have initialized the investigation log for complaint: "${userText}". 

What evidence or suspects would you like to present to the court first?`;
  } 

  else if (action === "chatter") {
    role = "Investigator";
    content = `Got it! Logged details: "${userText}".
    
You can submit evidence, name suspects, or call witnesses to build your case strength!`;
  }
  
  else if (action === "submit_evidence") {
    const newEvidenceItem = userText || "Crumpled Note / Fingerprints";
    if (!state.evidence) state.evidence = [];
    state.evidence.push(newEvidenceItem);
    
    state.meters.evidence = clamp(state.meters.evidence + 20);
    state.meters.suspicion = clamp(state.meters.suspicion + 15);
    state.strength = clamp(state.strength + 20);
    state.timeline.evidence = true;

    role = "Investigator";
    content = `Evidence logged: **"${newEvidenceItem}"**. Case strength increased to **${state.strength}%**!`;
    timelineUpdate = { label: "Evidence Logged", status: "success" };
  } 
  
  else if (action === "name_suspect") {
    state.accused = userText || "The Roommate";
    state.meters.suspicion = clamp(state.meters.suspicion + 25);
    state.strength = clamp(state.strength + 15);

    role = "Investigator";
    content = `Prime suspect named: **${state.accused}**. Court suspicion meter raised to **${state.meters.suspicion}%**!`;
  } 
  
  else if (action === "call_witness") {
    const hash = (state.witnesses?.length || 0) + (state.evidence?.length || 0);
    const mockWitness = MOCK_WITNESSES[hash % MOCK_WITNESSES.length];
    
    if (!state.witnesses) state.witnesses = [];
    state.witnesses.push(mockWitness.name);
    
    state.meters.evidence = clamp(state.meters.evidence + 15);
    state.strength = clamp(state.strength + 15);
    state.timeline.witness = true;

    role = `Witness: ${mockWitness.name}`;
    content = `(The Court calls ${mockWitness.name} to the stand)
    
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
    
    const isGuilty = state.strength >= 45;
    state.verdict = isGuilty ? "GUILTY" : "NOT GUILTY";
    state.confidence = state.strength;
    
    // Retrieve profile for this caseType
    const profile = CASE_PROFILES[state.caseType] || CASE_PROFILES.Theft;
    
    state.verdictLabel = isGuilty ? profile.verdictLabel : "Acquitted of All Charges";
    state.stamp = isGuilty ? profile.stamp : "SUMMARY ACQUITTAL";
    state.caseTitle = profile.title;
    state.charge = profile.charge;
    state.reasons = profile.reasons;
    state.best_quote = profile.best_quote;
    state.sentence = isGuilty ? profile.sentence : "The accused is cleared of all charges. Complainant must offer a verbal apology.";
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
