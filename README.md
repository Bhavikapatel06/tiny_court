# ⚖️ Mini Court — AI Courtroom Simulator

An interactive, AI-powered theatrical courtroom simulator built with React and Vite, inspired by the Hugging Face "Tiny Court of Everyday Crimes" concept. Settle petty household disputes, roommate yogurt thefts, sibling arguments, and pet shenanigans with dramatic fairness.

---

## 🛑 Solving the "MIME type of 'text/jsx'" Error

### Why does this error happen?
If you try to run this project using a simple static file server (such as VS Code's **Live Server** extension, `python -m http.server`, or by double-clicking the `index.html` file), the browser will request `/src/main.jsx`. 
Because standard web browsers do not natively support JSX files and static servers do not compile them, the server sends the raw file as `"text/jsx"`. The browser then blocks it due to strict MIME type checks.

### How to solve it:
To compile JSX files on-the-fly and serve them correctly, you **must run the project using the Vite development server** (`npm run dev`) instead of a generic static server. Follow the instructions below to run the project.

---

## 🚀 Running the Project from the Terminal

Follow these step-by-step instructions to get the application up and running:

### 1. Open the Terminal
Navigate to the project root directory (`tiny_court`) in your terminal or command prompt.

### 2. Install Dependencies
Install all the required npm packages. Run the following command:
```bash
npm install
```

### 3. Start the Development Server
Run the Vite development server using:
```bash
npm run dev
```

Once started, the terminal will output a local URL (usually `http://localhost:5173`). Open this link in your browser to view the application.

---

## 🎮 Game Play Modes

To solve Google Gemini API rate limits and quota blocks (`limit: 0` error on free tier), Mini Court features two modes:

### 1. 📴 Offline Simulation Mode (Default)
- **Zero API quota required.** Works 100% offline.
- Runs a deterministic local engine that mimics the Judge, Prosecutor, Defense, and Witnesses.
- Employs contextual humor tailored to your selected Case Type (Theft, Property Damage, Chores, etc.).
- Keeps all metrics, action buttons, timeline phases, and revised rulings fully active.

### 2. 🤖 Gemini AI Mode
- Connects to Google's Generative Language endpoints (`gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-2.5-flash`).
- Requires a Gemini API Key. Click the settings gear (`⚙️`) in the header to enter your key.
- Orchestrates deep-context prompts containing historical trial dialogue, active courtroom meters, and exhibit logs so the AI responds dynamically to trial changes.

---

## 🏛️ Courtroom Mechanics

* **Courtroom Dashboard:** Tracks real-time values for **Suspicion**, **Evidence Weight**, **Dignity**, and **Judge's Patience** (decreases with objections/chatter).
* **Trial Lengths:**
  - **⚡ Quick Trial:** Moves straight from case arguments to the final verdict.
  - **📜 Full Trial:** Summons witnesses (like *The Smart Fridge*, *The House Cat*, *The Spoon*), triggers cross-examinations, handles objections, and unleashes surprise twist complications.
* **Affordance Buttons:** Respond in character or trigger actions like **Objection!**, **Add Twist**, **Call Witness**, and **Ask the Judge**.
* **Appeals & Sentences:** Appeal a verdict under Leniency (raises mercy), Evidence, or Innocence, yielding a revised verdict card and a humorous, household-friendly final sentence.
