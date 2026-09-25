(async function(){
  const params=new URLSearchParams(location.search);
  const requestedBook=params.get("book")||"ruth";
  const chapter=Number(params.get("chapter")||1);
  const title=document.getElementById("quizTitle");
  const sub=document.getElementById("quizSubtitle");
  const area=document.getElementById("quizArea");
  const progress=document.getElementById("quizProgress");

  const DATA=window.LOGOS_400_QA||{};
  const canonBook={ruth:"Ruth",samuel:"1 Samuel",1samuel:"1 Samuel","1 samuel":"1 Samuel",ecclesiastes:"Ecclesiastes",john:"John","gospel according to john":"John",galatians:"Galatians"};
  const wantedBook=String(requestedBook).trim().toLowerCase();
  const bookName=canonBook[wantedBook]||requestedBook;
  const all=Array.isArray(DATA.items)?DATA.items:[];
  const sourceQuestions=all.filter(x=>x.book===bookName&&Number(x.chapter)===chapter);

  function cleanAnswer(a){
    return String(a||"").replace(/\s*\((?:Ruth|Ecclesiastes|John|Galatians|1 Samuel)\s+\d+:[^)]+\)\s*$/i,"").trim();
  }
  function esc(s){return String(s).replace(/[&<>"']/g,m=>m==="&"?"&amp;":m==="<"?"&lt;":m===">"?"&gt;":m==='"'?"&quot;":"&#39;");}
  function stableShuffle(arr,seed){
    const a=arr.slice(); let x=(seed*9301+49297)%233280;
    for(let i=a.length-1;i>0;i--){x=(x*9301+49297)%233280;const j=Math.floor(x/233280*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }

  title.textContent=(bookName||"Bible")+" • Chapter "+chapter+" Quiz";
  sub.textContent=sourceQuestions.length+" source questions • One question at a time • Choose one answer";

  if(!sourceQuestions.length){
    area.innerHTML="<h2>Chapter questions are unavailable.</h2><p>The hard-coded Logos question bank could not find this chapter.</p><a class='quiz-home' href='./'>Return to Bible Study</a>";
    return;
  }

  const pool=sourceQuestions.map(x=>cleanAnswer(x.answer)).filter(Boolean);
  const questions=sourceQuestions.map((item,idx)=>{
    const answer=cleanAnswer(item.answer);
    const candidates=pool.filter((x,i)=>i!==idx && x!==answer);
    const distractors=stableShuffle(candidates,idx+chapter*17).slice(0,3);
    return {id:item.id,question:item.question,answer,options:stableShuffle([answer,...distractors],idx+chapter*101)};
  });

  let index=0;
  const selections={};

  function show(){
    const q=questions[index];
    progress.textContent="Question "+(index+1)+" of "+questions.length;
    const chosen=selections[q.id];
    area.innerHTML='<div class="mcq-question"><div class="mcq-number">QUESTION '+(index+1)+' OF '+questions.length+' · SOURCE Q'+q.id+'</div><h2>'+esc(q.question)+'</h2><div class="mcq-options">'+q.options.map((x,i)=>'<button class="mcq-option '+(chosen===x?'selected':'')+'" data-i="'+i+'"><span>'+String.fromCharCode(65+i)+'</span><b>'+esc(x)+'</b></button>').join("")+'</div><div id="feedback" class="mcq-feedback hidden"></div><div class="mcq-nav"><button id="prevQuestion" class="nav-btn" '+(index===0?'disabled':'')+'>← Previous</button><span class="mcq-nav-count">'+(index+1)+' / '+questions.length+'</span><button id="nextQuestion" class="primary" '+(chosen===undefined?'disabled':'')+'>'+(index===questions.length-1?'Finish Quiz':'Next Question →')+'</button></div></div>';
    area.querySelectorAll(".mcq-option").forEach((b,i)=>b.onclick=()=>choose(i));
    document.getElementById("prevQuestion").onclick=()=>{if(index>0){index--;show();}};
    document.getElementById("nextQuestion").onclick=()=>{if(chosen!==undefined){if(index<questions.length-1){index++;show();}else finish();}};
    if(chosen!==undefined) showFeedback(chosen);
  }

  function choose(i){
    const q=questions[index];
    selections[q.id]=q.options[i];
    show();
  }

  function showFeedback(chosen){
    const q=questions[index];
    const feedback=document.getElementById("feedback");
    const correct=chosen===q.answer;
    feedback.innerHTML=correct?"<strong>✓ Correct!</strong><br>"+esc(q.answer):"<strong>Not quite.</strong><br>The correct answer is: <b>"+esc(q.answer)+"</b>";
    feedback.className="mcq-feedback "+(correct?"correct-feedback":"wrong-feedback");
    area.querySelectorAll(".mcq-option").forEach((b,i)=>{
      const value=q.options[i];
      b.disabled=true;
      if(value===q.answer)b.classList.add("correct");
      if(value===chosen&&chosen!==q.answer)b.classList.add("wrong");
    });
  }

  function finish(){
    let score=0;
    questions.forEach(q=>{if(selections[q.id]===q.answer)score++;});
    progress.textContent="Complete";
    area.innerHTML='<div class="mcq-result"><div class="result-icon">🎉</div><h2>Chapter Quiz Complete!</h2><p>Sam scored <strong>'+score+' / '+questions.length+'</strong></p><p class="mcq-result-note">You can go back and review any question before trying again.</p><button class="primary" id="retry">Try Again</button><a class="quiz-home" href="./">← Back to Bible Study</a></div>';
    document.getElementById("retry").onclick=()=>{index=0;for(const k of Object.keys(selections))delete selections[k];show();};
  }

  show();
})();