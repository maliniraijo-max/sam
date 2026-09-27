(() => {
  const data = window.SAM_BIBLE_EXAM_100;
  const card = document.getElementById("bibleExamCard");
  if (!data || !card || !Array.isArray(data.questions) || data.questions.length !== 100) return;

  const intro = document.getElementById("bibleExamIntro");
  const app = document.getElementById("bibleExamApp");
  const result = document.getElementById("bibleExamResult");
  const qNumber = document.getElementById("examQuestionNumber");
  const attempted = document.getElementById("examAttempted");
  const progress = document.getElementById("examProgressBar");
  const qBox = document.getElementById("examQuestion");
  const optionsBox = document.getElementById("examOptions");
  const navigator = document.getElementById("examNavigator");
  const prev = document.getElementById("examPrev");
  const next = document.getElementById("examNext");
  const submit = document.getElementById("submitBibleExam");
  const note = document.getElementById("examSubmitNote");
  const score = document.getElementById("examScore");
  const start = document.getElementById("startBibleExam");

  let current = 0;
  const answers = new Array(100).fill(null);
  let submitted = false;

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));

  function updateStatus() {
    const count = answers.filter(v => v !== null).length;
    qNumber.textContent = "Question " + (current + 1) + " of 100";
    attempted.textContent = count + " / 100 answered";
    progress.style.width = count + "%";
    submit.disabled = count !== 100;
    note.textContent = count === 100
      ? "All 100 questions are answered. You can submit the examination."
      : "Answer all 100 questions to unlock Submit Examination.";
    prev.disabled = current === 0;
    next.disabled = current === 99;
  }

  function renderNavigator() {
    navigator.innerHTML = data.questions.map((q, i) =>
      '<button type="button" class="exam-nav-dot '+(i===current?'active ':'')+(answers[i]!==null?'answered':'')+'" data-index="'+i+'">'+(i+1)+'</button>'
    ).join("");
    navigator.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        current = Number(btn.dataset.index);
        renderQuestion();
      });
    });
  }

  function renderQuestion() {
    const q = data.questions[current];
    qBox.innerHTML =
      '<div class="exam-question-meta">'+esc(q.book)+' • Chapter '+esc(q.chapter)+'</div>' +
      '<h3>'+esc(q.question)+'</h3>';
    optionsBox.innerHTML = q.options.map((opt, i) =>
      '<button type="button" class="exam-option '+(answers[current]===i?'selected':'')+'" data-index="'+i+'">' +
      '<span class="exam-option-letter">'+String.fromCharCode(65+i)+'</span><span>'+esc(opt)+'</span></button>'
    ).join("");
    optionsBox.querySelectorAll(".exam-option").forEach(btn => {
      btn.addEventListener("click", () => {
        answers[current] = Number(btn.dataset.index);
        renderQuestion();
      });
    });
    renderNavigator();
    updateStatus();
  }

  function startExam() {
    intro.classList.add("hidden");
    app.classList.remove("hidden");
    current = 0;
    renderQuestion();
  }

  start.addEventListener("click", startExam);
  prev.addEventListener("click", () => {
    if (current > 0) { current--; renderQuestion(); }
  });
  next.addEventListener("click", () => {
    if (current < 99) { current++; renderQuestion(); }
  });

  submit.addEventListener("click", () => {
    if (submitted || answers.some(v => v === null)) return;
    submitted = true;
    const total = data.questions.reduce((sum, q, i) => sum + (answers[i] === q.answerIndex ? 1 : 0), 0);
    app.classList.add("hidden");
    result.classList.remove("hidden");
    score.textContent = total + " / 100";
    card.scrollIntoView({behavior:"smooth",block:"start"});
  });
})();