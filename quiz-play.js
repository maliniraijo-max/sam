let DATA=null,topic=null,subtopic=null,questions=[],i=0,score=0,locked=false;
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]));
async function boot(){
 try{const r=await fetch("daily-quiz.json?"+Date.now(),{cache:"no-store"});DATA=await r.json();const params=new URLSearchParams(location.search);topic=params.get("topic")||"animals";subtopic=params.get("subtopic")||"";if(!DATA.categories[topic])topic="animals";questions=DATA.categories[topic].questions.filter(q=>!subtopic||q.subtopic===subtopic);if(!questions.length)questions=DATA.categories[topic].questions;render();}
 catch(e){$("quizApp").innerHTML="<h2>Quiz is loading…</h2><p>Please refresh in a moment.</p>";}
}
function render(){
 const c=DATA.categories[topic],q=questions[i];locked=false;
 $("quizApp").innerHTML='<div class="quiz-q"><div style="font-size:11px;font-weight:950;letter-spacing:.12em;color:#6b818d">'+esc(c.icon)+' '+esc((subtopic?subtopic+" • ":"")+c.title.toUpperCase())+'</div><h2>'+esc(q.q)+'</h2><div class="quiz-options">'+q.options.map((o,n)=>'<button class="quiz-option" data-n="'+n+'">'+esc(o)+'</button>').join("")+'</div><div id="quizFeedback" aria-live="polite"></div></div><div class="quiz-nav"><button id="prevQ" '+(i===0?"disabled":"")+'>&larr; Previous</button><span class="quiz-counter">'+(i+1)+' / '+questions.length+'</span><button id="nextQ" class="primary" disabled>Next &rarr;</button></div>';
 document.querySelectorAll(".quiz-option").forEach(b=>b.onclick=()=>answer(Number(b.dataset.n)));
 $("prevQ").onclick=()=>{if(i>0){i--;render()}};
 $("nextQ").onclick=()=>{if(i<questions.length-1){i++;render()}else{finish()}};
}
function answer(n){
 if(locked)return;locked=true;const q=questions[i],ok=n===q.answer;if(ok)score++;
 document.querySelectorAll(".quiz-option").forEach((b,j)=>{b.disabled=true;if(j===q.answer)b.style.borderColor="#6bb487";if(j===n&&!ok)b.style.borderColor="#d58d84";});
 $("quizFeedback").className="quiz-feedback "+(ok?"correct":"wrong");$("quizFeedback").textContent=ok?"✓ Correct! "+q.why:"✗ Not quite. Correct answer: "+q.options[q.answer]+". "+q.why;
 $("quizApp").querySelector("#nextQ").disabled=false;
}
function finish(){const total=questions.length;$("quizApp").innerHTML='<div class="quiz-score"><div class="score-number">'+score+'</div><h2>Great exploring!</h2><p>Come back tomorrow for a completely fresh '+esc(DATA.categories[topic].title)+' quiz.</p><a class="quiz-back" href="quiz.html">Choose another quiz →</a></div>';}
boot();