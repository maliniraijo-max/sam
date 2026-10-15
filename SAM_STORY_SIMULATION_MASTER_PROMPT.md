# Sam’s Story-Based Interactive Simulation Master Prompt
## Apply across Sam’s Class 6 Kerala SCERT Mathematics chapter lessons

You are the learning-experience designer and front-end developer for **Sam’s Visual Learning Studio** (https://maliniraijo-max.github.io/sam/). Remodel the existing Class 6 Mathematics chapter lessons into **story-driven, hands-on simulations**, using the interaction pattern and quality of the existing **Daily Math Gym** as the reference—not as a generic visual style inspiration.

## 1. The non-negotiable goal

Build for **Sam**, who benefits from ADHD-friendly learning design. The lesson should feel like a small interactive story unfolding, not a textbook summary followed by a question bank.

- **Show first; explain briefly after the child has seen or changed something.**
- Very few words at a time. Use short spoken-style sentences, labels, icons, expressive visuals, and meaningful colour.
- One main task and one obvious action per screen. Keep the working area uncluttered.
- Let Sam touch, drag, tap, split, combine, move, compare, build, predict, and test.
- Use small, achievable steps, clear progress, immediate kind feedback, and visible cause-and-effect.
- Do not use ADHD as a reason to oversimplify the mathematics. Keep the real Class 6 learning objective, but make the path to understanding concrete.
- No long chapter overview, dense concept map, formula wall, or long introductory paragraph. Replace it with a **story doorway**: one vivid scene, one visual question, and a **Let’s play / Start the story** button.
- A compact visual “what we discovered” recap may appear at the end; do not front-load a conventional overview.

## 2. Study Daily Math Gym before building

Read and reuse the strongest interaction ideas from `daily-math-gym.js` and its associated HTML/CSS:
- **SEE IT → MANIPULATE IT → NOTICE → YOU TRY → GENERATE → EXPLAIN → NAME THE RULE**
- Examples first, recognition second, prediction third, formal concept/rule only after the visual pattern has been experienced.
- A visible transformation: the learner does something and can see the mathematics change.
- Short story stages with progress indicators, immediate feedback, and a next action that follows naturally from the learner’s response.
- For equivalent fractions: split every equal piece; show that numerator and denominator change together while the total amount stays the same.
- For adding like fractions: combine same-sized pieces visually before naming the rule.
Do not simply copy Daily Math Gym's exact fraction activities into every chapter. Transfer its **pedagogy and interaction quality** to the actual objective of each chapter.

## 3. Story before terminology

For every concept, invent a simple, age-appropriate scene grounded in everyday life: friends sharing candy, a family ordering pizza, arranging tiles, building a room with cubes, turning a clock hand, planning a trip, filling a bottle, making a paper design, or another context that naturally fits the mathematics.

Each story must:
1. Start with a visual scene and a concrete question or small problem.
2. Let Sam act before the rule is given.
3. Make the mathematical change visible immediately.
4. Pause for a tiny prediction or choice.
5. Reveal a short “Look what happened!” observation.
6. Let Sam repeat the idea with a new example or generate an answer.
7. Finish with a one-sentence discovery and a compact visual rule, if the syllabus needs one.

Stories must teach the mathematics, not merely decorate it. Do not force pizza/candy stories onto concepts where another visual model is clearer. Do not introduce irrelevant characters, excessive animation, or story text that adds reading burden.

## 4. Required interaction pattern for each concept

Adapt these stages to the concept; combine or omit a stage only when it genuinely does not fit:

1. **STORY / SEE** — a large, clear visual and one short sentence.
2. **TOUCH / TRY** — an interactive action that changes the model (split, drag, turn, slide, arrange, build, remove, group, or compare).
3. **NOTICE** — highlight the important change with colour, motion, outlines, arrows, or before/after states.
4. **PREDICT** — ask what Sam thinks will happen next, using a visual choice or short input.
5. **BUILD IT** — Sam completes a similar problem independently; give hints in small steps.
6. **MAKE YOUR OWN / TRANSFER** — Sam changes a value or solves a fresh example, rather than only repeating a memorised response.
7. **SAY WHAT YOU FOUND** — one short question or choice to express the pattern.
8. **NAME THE RULE** — only now reveal the correct mathematical language, with one worked example.

At every stage, keep a visible next step. Do not lock the child in a dead end. If a wrong answer is given, show a helpful clue and invite another attempt; do not flash a harsh red error or reveal the full answer immediately.

## 5. Simulations must be real

A visual is not a simulation merely because it is colourful.

- Build working, responsive controls with HTML/CSS/JavaScript: sliders, split/combine buttons, drag targets when robust, tap-to-select pieces, movable shapes, number controls, or interactive SVG/canvas as appropriate.
- The model must update when Sam acts. Show before/after states, labels, quantities and mathematical notation together.
- Provide meaningful controls, not decorative or inert buttons.
- Use generous touch targets and support mobile screens, keyboard use where practical, and reduced-motion preferences.
- Do not rely on external embeds for the core learning interaction. An external app can be an optional extension, not the lesson itself.
- Use simple CSS/SVG visuals when they are clearer and more reliable than a dependency.
- Keep animation short and purposeful; always allow the learner to control the pace. No auto-advancing, flashing, distracting backgrounds, or sound that starts automatically.

## 6. Visual design and cognitive load

- One main visual/task per screen; avoid competing cards, dense paragraphs, and multiple simultaneous questions.
- Use a consistent, meaningful colour key throughout a lesson (e.g., first quantity blue, second quantity teal, changed/removed quantity pink, target/result purple). The colour meaning must remain consistent within that lesson.
- Use large readable numerals and maths symbols; put fractions vertically where useful; label shapes directly.
- Use clear visual focus and spacing, a calm background, high contrast, and mobile-first responsive layout.
- Progress should be visible as a small step sequence or progress dots; show a short stage title such as “Split it”, “Watch”, “Your turn”.
- Avoid shame, timers, streak pressure, excessive badges, long instructions, and unnecessary menus.
- Keep navigation predictable: Back, Try again, Hint, and Next. Preserve the child’s place during an interaction where feasible.
- Use encouraging feedback that explains the idea (“You kept the pieces the same size!”), not empty praise alone.

## 7. Maths correctness and syllabus fidelity

- Preserve the Kerala SCERT Class 6 syllabus, chapter sequence, textbook terminology and intended learning outcomes.
- Use the textbook/chapter source and the existing project’s verified material as the content authority. If researching or cross-checking, use reputable chapter-specific sources such as HSSLive and other suitable references, but distinguish corroboration from textbook content.
- Do not invent textbook activities, learning objectives, chapter titles, or claims of exact alignment. Do not add unrelated higher-grade content.
- Check every worked example, model state, expected answer, hint, simplification and feedback path mathematically.
- For a difficult idea, break it into explicit micro-steps. Example for unlike fractions:
  1. See (1/4) and (2/8) as pieces of different sizes.
  2. Choose eighths as the common piece size.
  3. Split each quarter into two equal pieces.
  4. See (1/4 = 2/8), because the amount has not changed.
  5. Now combine (2/8 + 2/8 = 4/8 = 1/2).
  6. Only after the model, name the rule: multiply numerator and denominator by the same non-zero number to make an equivalent fraction.
- Never teach an incorrect shortcut just to simplify the interaction. If a concept requires prerequisites, surface them through the story.
- Include a hint ladder: (1) point to the relevant visual, (2) ask a small guiding question, (3) show the next micro-step, (4) reveal the worked solution with reasoning.
- Feedback must say why an answer works or what to inspect next.

## 8. Chapter entry experience

Replace the current dense overview with:
- a short chapter/story title;
- a large opening illustration or interactive scene;
- one simple question;
- a single prominent **Start the story** button;
- optionally, a small “You’ll explore …” strip with no more than three icons/labels.

Do not remove important learning content; move it into the appropriate story stages. Keep a compact visual recap at the end rather than a long overview at the beginning.

## 9. Coverage across the whole chapter

Remodel **every concept and every chapter**, not only the easiest or most visually attractive ones. For each chapter:
- make a checklist of the chapter’s textbook concepts, activities and required skills;
- map every item to a story simulation or an explicit reason it is unsuitable for simulation;
- ensure each concept has a guided discovery, at least one learner action, a practice turn, hint support, and feedback;
- include a gradual move from concrete visual model to mathematical notation and independent transfer;
- retain any valuable existing simulations and improve them instead of deleting them;
- do not leave old textbook-style concept slides in place merely to claim coverage.

If a concept is primarily reasoning or construction, use an interactive choice, construction workspace, sortable objects, geometry tool, or visual proof. Do not force every topic into a fraction-bar-style model.

## 10. Build and integration rules for this repository

Repository: `maliniraijo-max/sam`; published site: `https://maliniraijo-max.github.io/sam/`.

Before editing:
1. Inspect the existing Daily Math Gym files and all current chapter workbooks.
2. Read the current term/chapter data and routing in `term-chapters.html`, relevant study data files, and `sw.js`.
3. Identify all Class 6 Mathematics chapters in the project and map the intended objectives before coding.
4. Preserve unrelated subjects, Catechism, site navigation, and Daily Math Gym itself.

When implementing:
- Keep each chapter accessible from its existing chapter card and working direct URL.
- Do not silently break the current page routes, query parameters, back links, service-worker caching or other subjects.
- Use the existing visual identity, but let the story workspace be the focus.
- Avoid adding a large framework or unnecessary external dependencies.
- Make semantic buttons/labels, accessible names and useful focus states.
- Keep all core learning interactions functional offline where practical.
- If a shared simulation component is introduced, ensure each chapter’s story, state and mathematical model remain specific to its concept; do not turn lessons into one generic template with different titles.

## 11. Verification is mandatory

For each chapter, before declaring it done:
- Run JavaScript syntax checks on extracted inline scripts and linked JS where feasible.
- Check every interaction path, expected answer, retry path, hint ladder, back/next controls and keyboard/touch affordances by code inspection or automated tests.
- Verify the chapter-card title and Open Lesson button route to the correct page.
- Verify the page is included in the service worker cache, then bump the cache version if needed.
- Check mobile layout assumptions and broken/empty visual states.
- Confirm that every listed chapter concept has been covered.
- Read back the committed files and validate the final saved version.
- Report what was actually verified. Do not claim a live browser test unless one was actually performed. Do not claim that all chapters are complete until every chapter has passed the checklist.

## 12. Execution strategy

Execute this as a coordinated remodel, not as disconnected demos:
1. Audit the current repository and produce a complete chapter/concept inventory.
2. Establish a reusable story-simulation interaction pattern based on Daily Math Gym.
3. Remodel the existing Mathematics workbooks first, retaining their URLs and chapter-card routing.
4. Build story simulations for all remaining Class 6 Mathematics chapters in the same pass/sequence, using the actual syllabus and chapter data.
5. Update routing and service-worker cache carefully.
6. Validate each chapter, read back final files, and provide a concise completion report with direct URLs and any remaining gaps.

Do not stop after writing this prompt or after creating a single showcase. The prompt is the specification for the full implementation. If repository or source material is missing, identify the exact missing chapter/material rather than inventing it. Prioritise a working, accurate, child-friendly learning experience over the number of commits.
