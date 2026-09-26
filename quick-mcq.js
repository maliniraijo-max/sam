(() => {
  const left = document.getElementById("quickMcqRail");
  const right = document.getElementById("quickMcqRailRight");
  if ((!left && !right) || !window.LOGOS_400_QA?.items) return;

  const configs = [
    { key:"Ruth", icon:"🌾", title:"Ruth", subtitle:"Ruth 1–4", target:"left" },
    { key:"1 Samuel", icon:"👑", title:"1 Samuel", subtitle:"1 Samuel 1–7", target:"left" },
    { key:"Ecclesiastes", icon:"📜", title:"Ecclesiastes", subtitle:"Ecclesiastes 1–6", target:"left" },
    { key:"John", icon:"✝️", title:"John", subtitle:"John 1–12", target:"right" },
    { key:"Galatians", icon:"✉️", title:"Galatians", subtitle:"Galatians 1–6", target:"right" }
  ];

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
  const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
  const shuffle = arr => {
    const copy = arr.slice();
    for (let i=copy.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [copy[i],copy[j]]=[copy[j],copy[i]];
    }
    return copy;
  };

  const byBook = {};
  window.LOGOS_400_QA.items.forEach(item => {
    const q = cleanQuestion(item.question), a = cleanAnswer(item.answer);
    if (!q || !a) return;
    (byBook[item.book] ||= []).push({...item, cleanQ:q, cleanA:a});
  });

  const makeCard = (cfg, index) =>
    '<section class="quick-mcq-card" data-mcq-index="'+index+'">' +
      '<div class="quick-mcq-head"><div class="quick-mcq-book"><span class="quick-mcq-icon">'+cfg.icon+'</span><div><strong>'+cfg.title+'</strong><small>'+cfg.subtitle+' • '+(byBook[cfg.key]?.length || 0)+' Q</small></div></div><span class="quick-mcq-label">MCQ</span></div>' +
      '<div class="quick-mcq-body"></div></section>';

  configs.forEach((cfg, i) => {
    const host = cfg.target === "right" ? right : left;
    if (host) host.insertAdjacentHTML("beforeend", makeCard(cfg, i));
  });

  configs.forEach((cfg, i) => {
    const host = cfg.target === "right" ? right : left;
    const card = host?.querySelector('[data-mcq-index="'+i+'"]');
    if (!card) return;
    const body = card.querySelector(".quick-mcq-body");
    const pool = byBook[cfg.key] || [];
    let questions = shuffle(pool), position = 0;

    function render() {
      if (!questions.length) {
        body.innerHTML = '<p class="quick-mcq-empty">Questions unavailable.</p>';
        return;
      }
      const item = questions[position % questions.length];
      const distractors = shuffle(pool.filter(x => x.id !== item.id && x.cleanA !== item.cleanA))
        .slice(0,3).map(x => x.cleanA);
      const options = shuffle([item.cleanA, ...distractors]);

      body.innerHTML =
        '<div class="quick-mcq-count">'+cfg.title+' • Question '+(position+1)+' of '+questions.length+'</div>' +
        '<h3>'+escapeHtml(item.cleanQ)+'</h3>' +
        '<div class="quick-mcq-options">'+options.map((option,n) =>
          '<button type="button" class="quick-mcq-option" data-correct="'+(option===item.cleanA?'1':'0')+'"><span>'+String.fromCharCode(65+n)+'</span>'+escapeHtml(option)+'</button>'
        ).join("")+'</div>' +
        '<div class="quick-mcq-feedback" aria-live="polite"></div>' +
        '<button type="button" class="quick-mcq-next hidden">Next question →</button>';

      const buttons=body.querySelectorAll(".quick-mcq-option");
      const feedback=body.querySelector(".quick-mcq-feedback");
      const next=body.querySelector(".quick-mcq-next");
      buttons.forEach(btn=>btn.addEventListener("click",()=>{
        buttons.forEach(b=>b.disabled=true);
        const correct=btn.dataset.correct==="1";
        btn.classList.add(correct?"correct":"wrong");
        buttons.forEach(b=>{if(b.dataset.correct==="1")b.classList.add("correct");});
        feedback.textContent=correct?"✓ Correct! Great job!":"Not quite — the answer is "+item.cleanA+".";
        feedback.className="quick-mcq-feedback "+(correct?"is-correct":"is-wrong");
        next.classList.remove("hidden");
      }));
      next.addEventListener("click",()=>{
        position++;
        if(position>=questions.length){questions=shuffle(pool);position=0;}
        render();
      });
    }
    render();
  });
})();