let DATA=null;
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]));
async function boot(){
 try{const r=await fetch("daily-quiz.json?"+Date.now(),{cache:"no-store"});DATA=await r.json();$("quizDate").textContent=DATA.displayDate;renderHub();}
 catch(e){$("quizGrid").innerHTML='<div class="quiz-topic-card"><h2>Quiz is loading…</h2><p>Please refresh in a moment.</p></div>';}
}
function renderHub(){
 const entries=Object.entries(DATA.categories);
 $("quizGrid").innerHTML=entries.map(([key,c])=>{
   if(key==="science") return '<div class="quiz-topic-card quiz-science-card"><span class="quiz-topic-icon">'+esc(c.icon)+'</span><h2>'+esc(c.title)+'</h2><p>'+esc(c.description)+'</p><div class="science-subtopics">'+c.subtopics.map(s=>'<a class="science-subtopic" href="quiz-play.html?topic=science&subtopic='+encodeURIComponent(s.title)+'">'+esc(s.icon)+' '+esc(s.title)+' <b>→</b></a>').join("")+'</div><span class="quiz-topic-cta">Choose a science quiz →</span></div>';
   return '<a class="quiz-topic-card" href="quiz-play.html?topic='+esc(key)+'"><span class="quiz-topic-icon">'+esc(c.icon)+'</span><h2>'+esc(c.title)+'</h2><p>'+esc(c.description)+'</p><span class="quiz-topic-cta">Start today’s quiz →</span></a>';
 }).join("");
}
boot();