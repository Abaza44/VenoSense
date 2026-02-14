# VeinoTronic 2.0 — Hackathon Battle Plan

## Core Strategy

**Assumption:** Device data is 99% accurate — we focus 100% on software and demo polish.

**Critical decision: NO UNITY.** Nobody on the team has used it, and the learning curve will burn a full day. Instead:

- **AR Overlay →** Web-based (HTML/CSS/JS with animations), or A-Frame + AR.js if time allows
- **Needle Recommender →** Simple web app (HTML + vanilla JS or React)
- **Digital Twin →** Firebase Realtime DB or even a Google Sheet as backend

Everything runs in a browser. One tech stack. Everyone can contribute.

---

## Team Roles

| Role | Person | Focus Area |
|------|--------|------------|
| **AR Lead** | Member A | AR Vein Overlay — the showstopper |
| **AI/Logic Lead** | Member B | Needle Recommender engine + UI |
| **Backend/Data Lead** | Member C | Digital Twin database + API |
| **Demo & Design Lead** | Member D | Pitch deck, UI styling, demo script |
| **Support** | Member E | Asset creation, testing, data entry, errands |

### How to assign people to roles
- **Member A** should be whoever is most comfortable with front-end visuals (CSS animations, canvas, or willing to learn A-Frame quickly).
- **Member B** should be whoever is strongest in logic/programming — even basic Python or JS is enough.
- **Member C** should be whoever has touched any database or API before (Firebase, Google Sheets API, or even JSON files).
- **Member D** should be the best communicator/designer — they own the story and the pitch.
- **Member E** picks up whatever is needed — finding images, testing features, entering mock data, getting coffee.

---

## Day 1: Build the Core (8–10 hours)

### Morning Block (Hours 1–4): Foundation

**ALL TEAM (30 min) — Kickoff:**
- Align on this plan, confirm roles
- Set up a shared GitHub repo (or even a shared Google Drive folder for files)
- Create a group chat for quick coordination
- Agree on a color scheme and visual style (Member D decides)

**Member A — AR Overlay (start immediately):**
1. **Hour 1–2:** Choose your approach:
   - **Option 1 (Recommended — Easiest):** A fullscreen web page showing a realistic arm image/video with animated vein lines overlaid using CSS animations or HTML5 Canvas. This is a "simulated AR view" — like what the device screen would show.
   - **Option 2 (Stretch):** Use A-Frame + AR.js with a printed marker. Point a phone camera at the marker, veins appear overlaid. Looks amazing but riskier.
   - **Decision rule:** Try Option 2 for 90 minutes. If it's not working, switch to Option 1 immediately. No sunk-cost thinking.
2. **Hour 2–4:** Build the base overlay. Get veins showing on screen — even if ugly. Functionality first, polish later.

**Member B — Needle Recommender:**
1. **Hour 1–2:** Define the decision logic on paper first. Example decision tree:
   - Vein depth < 3mm → Small needle (25G)
   - Vein depth 3–5mm AND diameter > 3mm → Medium needle (22G)
   - Vein depth > 5mm OR patient age > 70 → Large needle (21G) + flag for senior nurse
   - Prior failed attempts > 1 → Recommend ultrasound-guided approach
   - Add 3–5 more rules to make it feel smart
2. **Hour 2–4:** Build a simple web form — input fields for vein depth, vein diameter, patient age, and a "Get Recommendation" button. Output shows the suggested needle with a confidence level and brief reasoning.

**Member C — Digital Twin Backend:**
1. **Hour 1–2:** Set up Firebase project (free tier) OR a Google Sheet with Apps Script as a lightweight API. Create the data schema:
   - `patient_id`, `name`, `age`, `arm` (left/right)
   - `vein_map`: array of veins with `depth`, `diameter`, `location`, `quality_score`
   - `visit_history`: array of past procedures with `date`, `needle_used`, `success`, `notes`
2. **Hour 2–4:** Populate 5–8 mock patient profiles with realistic data. Build basic read/write functions. Create a simple patient lookup page (search by name or ID → show their vein profile).

**Member D — Design & Pitch Foundation:**
1. **Hour 1–2:** Design the overall UI shell/dashboard layout. Think: a single-page app with tabs or sections for each feature. Sketch it on paper, then start building the HTML/CSS frame.
2. **Hour 2–4:** Start the pitch deck (Google Slides). Write the story:
   - Slide 1: The problem (failed IV insertions, patient pain, nurse frustration)
   - Slide 2: VeinoTronic 1.0 (the hardware — 99% accuracy)
   - Slide 3: VeinoTronic 2.0 (the software layer — our hackathon work)
   - Slides 4–6: Each feature with a screenshot placeholder
   - Slide 7: Architecture diagram
   - Slide 8: Future vision

**Member E — Support:**
- Find or create a realistic arm image (royalty-free) for the AR overlay
- Find vein diagram references for accurate positioning
- Help Member C enter mock patient data
- Test each feature as it becomes available — be the first user

### Afternoon Block (Hours 5–8): Feature Completion

**Member A — AR Overlay:**
- Veins should now be visible on screen. Add interactivity:
  - Tap/hover on a vein → show tooltip with depth and diameter
  - Color coding: green = good for injection, yellow = caution, red = avoid
  - If time allows: add a subtle pulsing animation to simulate blood flow

**Member B — Needle Recommender:**
- Core logic should be working. Now:
  - Add visual polish: show the recommended needle with an icon/image
  - Add a "Why this recommendation?" expandable section explaining the reasoning
  - Connect it to the mock patient data (when you select a patient, auto-fill their vein measurements)

**Member C — Digital Twin:**
- Database should be queryable. Now:
  - Build a patient profile view: show vein map data as a simple visual (even a table is fine)
  - Add a "Record New Visit" form that writes to the database
  - Create a comparison view: "Last visit vs. This visit" showing changes

**Member D — Design & Pitch:**
- Apply consistent styling to all three features as they come in
- Build the dashboard shell that ties them together
- Continue refining the pitch deck

**Member E:**
- Test everything aggressively — try breaking inputs, try weird data
- Document any bugs found
- Help Member D with styling or asset placement

### End of Day 1 Checkpoint
By end of Day 1, you should have:
- ✅ AR overlay showing veins on an arm (even if basic)
- ✅ Needle recommender taking inputs and giving recommendations
- ✅ Patient database with mock data, readable via a simple UI
- ✅ Pitch deck at 70% complete
- ⚠️ Features don't need to be connected yet — that's Day 2 morning

---

## Day 2: Integrate, Polish, Rehearse (8–10 hours)

### Morning Block (Hours 1–4): Integration & Polish

**Members A + B + C together (Hours 1–3): Connect everything.**

This is the critical integration phase. The three features should flow like one product:

1. **Dashboard → Patient Select:** User picks a patient from the Digital Twin database
2. **Patient data loads →** Vein map appears in the AR Overlay view, vein measurements auto-populate the Needle Recommender
3. **Needle Recommender runs →** Recommendation appears alongside the AR view
4. **After procedure →** User records outcome back to Digital Twin (visit log)

This is the "wow" moment in the demo — showing all three features working as one system.

**Member D (Hours 1–3):**
- Finalize the pitch deck with real screenshots from the working product
- Write the 3-minute demo script (who says what, when to switch screens)
- Create a simple architecture diagram for the pitch

**Member E (Hours 1–3):**
- Full end-to-end testing of the integrated flow
- Note any visual glitches or confusing UI moments
- Prepare the demo environment (which browser, which device, bookmark URLs)

### Afternoon Block (Hours 5–8): Demo Prep & Rehearsal

**ALL TEAM (Hour 5): Feature freeze.**
- **STOP building new things.** Everything from here is polish and rehearsal.
- Fix only critical bugs. If it's cosmetic and non-blocking, leave it.

**Hours 5–6: Final polish**
- Member A: Ensure AR overlay looks clean and impressive at demo resolution
- Member B: Verify all recommendation paths work with demo patient data
- Member C: Pre-load the database with the exact patients you'll use in the demo
- Member D: Finalize every slide, add transitions
- Member E: Prepare a backup plan (screenshots, video recording of the working demo in case live demo fails)

**Hours 6–7: Rehearse the pitch (at least 3 full run-throughs)**
- Run-through 1: Full walkthrough, anyone can stop and suggest changes
- Run-through 2: Timed — hit the time limit exactly
- Run-through 3: Final dress rehearsal — no stopping, simulate real conditions
- Decide: Who presents? (Ideally Member D + one technical member)

**Hour 8: Final prep**
- Charge all devices
- Test the internet connection in the presentation room if possible
- Have offline backups ready (screen recordings, screenshots)
- Everyone rests — you're ready

---

## Emergency Contingency Plans

| If this goes wrong... | Do this instead... |
|---|---|
| AR overlay isn't working | Use a pre-recorded video or animated GIF of the overlay. Narrate over it: "Here's what the nurse would see..." |
| Firebase is down or flaky | Switch to a local JSON file. It's a demo — nobody will check if it's truly cloud-hosted. |
| Integration between features fails | Demo each feature standalone. Still impressive, just less "wow" factor. |
| Running out of time on Day 1 | Cut Digital Twin down to a static page showing one patient's data. Focus all energy on AR + Recommender. |
| Live demo crashes during pitch | Switch to the pre-recorded backup video immediately. Don't debug on stage. |

---

## Tech Stack Summary

| Component | Technology | Why |
|---|---|---|
| AR Overlay | HTML5 Canvas + CSS Animations (or A-Frame + AR.js) | No install, runs in browser, visual impact |
| Needle Recommender | Vanilla JS or React | Simple decision tree, clean UI |
| Digital Twin | Firebase Realtime DB (or Google Sheets API) | Free, fast setup, real-time updates |
| Dashboard | HTML/CSS/JS single-page app | Ties everything together |
| Pitch Deck | Google Slides | Collaborative, easy to share |
| Version Control | GitHub or shared folder | Keep everyone's work in sync |

---

## Demo Script Outline (3–5 minutes)

1. **Open with the problem** (30 sec): "Every year, X million IV insertions fail on the first attempt. Patients suffer, nurses are stressed, hospitals lose time and money."
2. **Introduce VeinoTronic** (30 sec): "VeinoTronic is a near-infrared device that detects veins with 99% accuracy. But accurate detection alone isn't enough — nurses still need to make decisions."
3. **Reveal 2.0** (15 sec): "That's why we built VeinoTronic 2.0 — a smart software layer that turns detection into decision support."
4. **Live demo — AR Overlay** (60 sec): Show veins appearing on the arm, tap for details, color coding.
5. **Live demo — Needle Recommender** (45 sec): Select a patient, show auto-populated data, get recommendation with reasoning.
6. **Live demo — Digital Twin** (45 sec): Show patient history, compare visits, record new outcome.
7. **Architecture + Future Vision** (30 sec): Quick tech diagram, mention scalability, ML potential, hospital integration.
8. **Close** (15 sec): "VeinoTronic 2.0 — from detection to decision."

---

## Final Tips

1. **The demo is the product.** At a hackathon, perception matters more than underlying complexity. A beautiful, smooth demo of a simple feature beats a complex backend nobody can see.
2. **Mock data is your friend.** Pre-load everything. Don't type or search during the demo. Every click should show something impressive instantly.
3. **Have a backup for everything.** Screen recordings, screenshots, offline mode. Murphy's Law is real at hackathons.
4. **Sleep.** Seriously. A rested team gives a better pitch than an exhausted team with one extra feature.
5. **Tell a story, not a feature list.** "Meet Sarah, a 72-year-old patient who's had 3 failed IV attempts this year. Here's how VeinoTronic 2.0 helps her nurse get it right the first time."
