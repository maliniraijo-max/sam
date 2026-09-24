(async function(){
  const params=new URLSearchParams(location.search);
  const book=params.get("book")||"ruth";
  const chapter=Number(params.get("chapter")||1);
  const title=document.getElementById("quizTitle");
  const sub=document.getElementById("quizSubtitle");
  const area=document.getElementById("quizArea");
  const progress=document.getElementById("quizProgress");

  // If an older cached Logos data file was served, reload the current data explicitly.
  if(!window.LOGOS_DEEP_2026?.[book]?.chapters?.[chapter]?.facts || window.LOGOS_DEEP_2026[book].chapters[chapter].facts.length<10){
    await new Promise((resolve,reject)=>{
      const s=document.createElement("script");
      s.src="./logos-data.js?v=20260924-101&fresh="+Date.now();
      s.onload=resolve;
      s.onerror=reject;
      document.head.appendChild(s);
    }).catch(()=>{});
  }

  const info=window.LOGOS_DEEP_2026?.[book];
  const facts=info?.chapters?.[chapter]?.facts||[];
  title.textContent=(info?.label||info?.name||"Bible").replace(/^\S+\s/,"")+" • Chapter "+chapter+" MCQ";
  sub.textContent="10 questions • Choose one of four answers. The correct answer appears immediately.";

  if(!info||facts.length!==10){
    area.innerHTML="<h2>Chapter quiz data is unavailable.</h2><p>Please return to Bible Study and try the Chapter Quiz again.</p><a class='quiz-home' href='./'>Return to Bible Study</a>";
    return;
  }

  const otherChapterFacts=Object.entries(info.chapters||{})
    .filter(([n])=>Number(n)!==chapter)
    .flatMap(([,x])=>Array.isArray(x.facts)?x.facts:[]);
  const questions=facts.slice(0,10).map(answer=>{
    const distractors=otherChapterFacts.sort(()=>Math.random()-.5).slice(0,3);
    return {
      q:"Which statement is specifically associated with "+(info.label||info.name)+" Chapter "+chapter+"?",
      answer,
      options:[answer,...distractors].sort(()=>Math.random()-.5)
    };
  });

  let index=0,score=0;
  function esc(s){
    return String(s).replace(/[&<>"']/g,m=>{
      if(m==="&")return "&amp;";
      if(m==="<")return "&lt;";
      if(m===">")return "&gt;";
      if(m===`"`)return "&quot;";
      return "&#39;";
    });
  }
  function show(){
    progress.textContent="Question "+(index+1)+" of "+questions.length;
    const q=questions[index];
    area.innerHTML='<div class="mcq-question"><div class="mcq-number">QUESTION '+(index+1)+' OF '+questions.length+'</div><h2>'+esc(q.q)+'</h2><div class="mcq-options">'+q.options.map((x,i)=>'<button class="mcq-option" data-i="'+i+'"><span>'+String.fromCharCode(65+i)+'</span><b>'+esc(x)+'</b></button>').join("")+'</div><div id="feedback" class="mcq-feedback hidden"></div><button id="nextQuestion" class="primary hidden">Next Question →</button></div>';
    area.querySelectorAll(".mcq-option").forEach((b,i)=>b.onclick=()=>answerQuestion(i));
  }
  function answerQuestion(i){
    const q=questions[index];
    const buttons=[...area.querySelectorAll(".mcq-option")];
    const correct=q.options.indexOf(q.answer);
    const feedback=document.getElementById("feedback");
    buttons.forEach(b=>b.disabled=true);
    if(i===correct){
      score++;
      buttons[i].classList.add("correct");
      feedback.innerHTML="<strong>✓ Correct!</strong><br>"+esc(q.answer);
      feedback.className="mcq-feedback correct-feedback";
    }else{
      buttons[i].classList.add("wrong");
      buttons[correct].classList.add("correct");
      feedback.innerHTML="<strong>✗ Not quite.</strong><br>The correct answer is: <b>"+esc(q.answer)+"</b>";
      feedback.className="mcq-feedback wrong-feedback";
    }
    const next=document.getElementById("nextQuestion");
    next.classList.remove("hidden");
    next.onclick=()=>{index++;index<questions.length?show():finish();};
    feedback.scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  function finish(){
    progress.textContent="Complete";
    area.innerHTML='<div class="mcq-result"><div class="result-icon">🎉</div><h2>Chapter Quiz Complete!</h2><p>Sam scored <strong>'+score+' / '+questions.length+'</strong></p><button class="primary" id="retry">Try Again</button><a class="quiz-home" href="./">← Back to Bible Study</a></div>';
    document.getElementById("retry").onclick=()=>location.reload();
  }
  show();
})();