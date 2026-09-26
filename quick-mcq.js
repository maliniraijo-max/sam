(() => {
  const root = document.getElementById("quickMcqRail");
  if (!root || !window.LOGOS_400_QA?.items) return;

  const config = {
    key: "John",
    icon: "✝️",
    title: "John",
    subtitle: "John 1–12 • 217 questions"
  };

  const cleanQuestion = value => {
    let q = String(value || "").replace(/^\s*\d+\.\s*/, "").trim();
    const m = q.match(/^(.*?)\s+\d+\.\s+\1$/i);
    if (m) q = m[1].trim();
    return q;
  };

  const cleanAnswer = value => String(value || "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/^[\"“]|[\"”]$/g, "")
    .trim();

  const pool = window.LOGOS_400_QA.items
    .filter(item => item.book === config.key)
    .map(item => ({
      ...item,
      cleanQ: cleanQuestion(item.question),
      cleanA: cleanAnswer(item.answer)
    }))
    .filter(item => item.cleanQ && item.cleanA);

  const shuffle = arr => {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  root.innerHTML =
    '<section class="quick-mcq-card" data-mcq-index="0">' +
      '<div class="quick-mcq-head">' +
        '<div class="quick-mcq-book"><span class="quick-mcq-icon">' + config.icon + '</span><div><strong>' + config.title + '</strong><small>' + config.subtitle + '</small></div></div>' +
        '<span class="quick-mcq-label">MCQ</span>' +
      '</div>' +
      '<div class="quick-mcq-body"></div>' +
    '</section>';

  const body = root.querySelector(".quick-mcq-body");
  let questions = shuffle(pool);
  let position = 0;

  function render() {
    if (!questions.length) {
      body.innerHTML = '<p class="quick-mcq-empty">John questions unavailable.</p>';
      return;
    }

    const item = questions[position % questions.length];
    const distractors = shuffle(
      pool.filter(x => x.id !== item.id && x.cleanA !== item.cleanA)
    ).slice(0, 3).map(x => x.cleanA);
    const options = shuffle([item.cleanA, ...distractors]);

    body.innerHTML =
      '<div class="quick-mcq-count">John • Question ' + (position + 1) + ' of ' + questions.length + '</div>' +
      '<h3>' + escapeHtml(item.cleanQ) + '</h3>' +
      '<div class="quick-mcq-options">' +
        options.map((option, n) =>
          '<button type="button" class="quick-mcq-option" data-correct="' + (option === item.cleanA ? '1' : '0') + '">' +
            '<span>' + String.fromCharCode(65 + n) + '</span>' + escapeHtml(option) +
          '</button>'
        ).join("") +
      '</div>' +
      '<div class="quick-mcq-feedback" aria-live="polite"></div>' +
      '<button type="button" class="quick-mcq-next hidden">Next question →</button>';

    const optionButtons = body.querySelectorAll(".quick-mcq-option");
    const feedback = body.querySelector(".quick-mcq-feedback");
    const next = body.querySelector(".quick-mcq-next");

    optionButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        optionButtons.forEach(b => b.disabled = true);
        const correct = btn.dataset.correct === "1";
        btn.classList.add(correct ? "correct" : "wrong");
        optionButtons.forEach(b => {
          if (b.dataset.correct === "1") b.classList.add("correct");
        });
        feedback.textContent = correct
          ? "✓ Correct! Great job!"
          : "Not quite — the answer is " + item.cleanA + ".";
        feedback.className = "quick-mcq-feedback " + (correct ? "is-correct" : "is-wrong");
        next.classList.remove("hidden");
      });
    });

    next.addEventListener("click", () => {
      position++;
      if (position >= questions.length) {
        questions = shuffle(pool);
        position = 0;
      }
      render();
    });
  }

  render();

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[ch]));
  }
})();