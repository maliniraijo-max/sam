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
  let answers = new Array(100).fill(null);
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
      ? "All 100 questions are answered. Submit when you are ready."
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
    result.classList.add("hidden");
    app.classList.remove("hidden");
    current = 0;
    answers = new Array(100).fill(null);
    submitted = false;
    renderQuestion();
  }

  function showResults() {
    const wrong = [];
    let total = 0;
    data.questions.forEach((q, i) => {
      if (answers[i] === q.answerIndex) total++;
      else wrong.push({
        number: i + 1,
        book: q.book,
        chapter: q.chapter,
        question: q.question,
        selected: q.options[answers[i]],
        correct: q.options[q.answerIndex]
      });
    });

    score.textContent = total + " / 100";

    const resultDetails = document.getElementById("examWrongAnswers");
    const wrongCount = document.getElementById("examWrongCount");
    if (wrongCount) wrongCount.textContent = wrong.length + " wrong";
    if (wrong.length === 0) {
      resultDetails.innerHTML =
        '<div class="exam-perfect"><div class="exam-perfect-icon">🌟</div><h3>Perfect Score!</h3><p>Every answer was correct.</p></div>';
    } else {
      resultDetails.innerHTML =
        '<div class="exam-mistakes-head"><h3>📚 Questions to Revise</h3><p>'+wrong.length+' question'+(wrong.length===1?'':'s')+' answered incorrectly. Review the correct answers below.</p></div>' +
        '<div class="exam-mistakes-list">' +
        wrong.map(w =>
          '<article class="exam-mistake">' +
          '<div class="exam-mistake-number">Q'+w.number+'</div>' +
          '<div class="exam-mistake-body">' +
          '<div class="exam-mistake-source">'+esc(w.book)+' • Chapter '+esc(w.chapter)+'</div>' +
          '<h4>'+esc(w.question)+'</h4>' +
          '<p class="exam-your-answer"><span>Your answer:</span> '+esc(w.selected || "Not answered")+'</p>' +
          '<p class="exam-correct-answer"><span>✓ Correct answer:</span> '+esc(w.correct)+'</p>' +
          '</div></article>'
        ).join("") +
        '</div>';
    }

    try {
      localStorage.setItem("sam_last_bible_exam", JSON.stringify({
        score: total, wrong, completedAt: new Date().toISOString()
      }));
    } catch (_) {}

    app.classList.add("hidden");
    result.classList.remove("hidden");
    submitted = true;
    card.scrollIntoView({behavior:"smooth",block:"start"});
  }

  start.addEventListener("click", startExam);
  const another = document.getElementById("startAnotherBibleExam");
  if (another) another.addEventListener("click", startExam);
  prev.addEventListener("click", () => {
    if (current > 0) { current--; renderQuestion(); }
  });
  next.addEventListener("click", () => {
    if (current < 99) { current++; renderQuestion(); }
  });
  submit.addEventListener("click", () => {
    if (!submitted && answers.every(v => v !== null)) showResults();
  });
})();