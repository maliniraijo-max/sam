/*
 DAILY MATH GYM — MANUAL CONTENT
 Today: Equivalent Fractions
 This version teaches through a visual story before asking questions.
*/
const GYM={
 date:"2026-10-07",
 title:"Equivalent Fractions",
 intro:"We are going to discover a fraction pattern by watching the same amount get split into smaller equal pieces.",
 stages:[
  {kicker:"STORY 1 • SEE IT",title:"Meet one half",instruction:"Imagine a chocolate bar. One half is shaded. It is one piece out of two.",kind:"visual",num:1,den:2,action:"Split each piece"},
  {kicker:"STORY 2 • SPLIT IT",title:"Watch the numbers change",instruction:"Split every piece into two equal pieces. Watch BOTH numbers.",kind:"split",num:1,den:2,action:"Split each piece"},
  {kicker:"STORY 3 • NOTICE",title:"Same amount. More pieces.",instruction:"Look at the three fractions together. The bar has not gained chocolate — we only made smaller equal pieces.",kind:"notice",num:4,den:8,action:null},
  {kicker:"BUILD 1 • YOU TRY",title:"Build 1/2 → ?",instruction:"If BOTH numbers are doubled, what fraction do we make?",kind:"input",fromNum:1,fromDen:2,answerNum:2,answerDen:4},
  {kicker:"BUILD 2 • YOU TRY AGAIN",title:"Build 2/4 → ?",instruction:"Double BOTH numbers again. What fraction comes next?",kind:"input",fromNum:2,fromDen:4,answerNum:4,answerDen:8},
  {kicker:"BUILD 3 • GENERATE",title:"Make your own equivalent fraction",instruction:"Start with 3/5. Double the numerator and double the denominator.",kind:"input",fromNum:3,fromDen:5,answerNum:6,answerDen:10}
 ],
 discovery:{
  text:"Now say the pattern in your own words.",
  prompts:[
   {q:"When we split every piece into TWO, what happens to the numerator?",answers:["It doubles","It stays the same"],correct:0},
   {q:"When we split every piece into TWO, what happens to the denominator?",answers:["It doubles","It becomes smaller"],correct:0},
   {q:"If 1/2 becomes 2/4, what happened to the amount shaded?",answers:["It stayed the same","It became twice as much"],correct:0}
  ]
 }
};
const $=id=>document.getElementById(id);
let stageIndex=0,discoveryIndex=0;
function fraction(n,d){return '<span class="fraction-stack"><span class="num">'+n+'</span><span class="den">'+d+'</span></span>';}
function pieces(n,d){
 let html='<div class="fraction-visual" aria-label="'+n+' shaded pieces out of '+d+'">';
 for(let i=0;i<d;i++) html+='<span class="piece '+(i<n?'shaded':'')+'"></span>';
 return html+'</div>';
}
function renderProgress(){
 $("gymProgress").innerHTML=GYM.stages.map((_,i)=>'<span class="gym-progress-dot '+(i<stageIndex?"done":i===stageIndex?"active":"")+'"></span>').join("");
}
function header(s){
 return '<div class="gym-stage-head"><div><p class="gym-stage-kicker">'+s.kicker+'</p><h2>'+s.title+'</h2><p class="gym-instruction">'+s.instruction+'</p></div><span class="gym-counter">'+(stageIndex+1)+' / '+GYM.stages.length+'</span></div>';
}
function nextButton(){return '<div class="gym-next-wrap"><button id="nextStage" class="gym-next hidden">Next →</button></div>';}
function renderStage(){
 renderProgress();
 const s=GYM.stages[stageIndex];
 let html=header(s);
 if(s.kind==="visual"){
  html+='<div class="story-visual">'+pieces(s.num,s.den)+'<div class="big-fraction">'+fraction(s.num,s.den)+'</div><div class="same-amount">ONE HALF OF THE BAR IS SHADED</div></div>';
  html+='<button id="splitBtn" class="split-action">✂️ '+s.action+'</button><div id="stageFeedback" class="gym-feedback"></div>';
 }else if(s.kind==="split"){
  html+='<div class="story-visual">'+pieces(s.num,s.den)+'<div class="big-fraction">'+fraction(s.num,s.den)+'</div><div class="same-amount">Watch the pieces — then split them.</div></div>';
  html+='<button id="splitBtn" class="split-action">✂️ '+s.action+'</button><div id="stageFeedback" class="gym-feedback"></div>';
 }else if(s.kind==="notice"){
  html+='<div class="comparison-story"><div>'+pieces(1,2)+'<strong>1 / 2</strong></div><div class="story-arrow">→</div><div>'+pieces(2,4)+'<strong>2 / 4</strong></div><div class="story-arrow">→</div><div>'+pieces(4,8)+'<strong>4 / 8</strong></div></div>';
  html+='<div class="notice-callout">👀 <b>1/2 → 2/4 → 4/8</b><br>Each time, the top number doubles AND the bottom number doubles.</div><div class="gym-feedback good">The amount shaded stayed the same. We changed how many equal pieces we used to describe it.</div>';
 }else if(s.kind==="input"){
  html+='<div class="build-visual">'+pieces(s.fromNum,s.fromDen)+'<div class="build-equation">'+fraction(s.fromNum,s.fromDen)+' <span>→</span> <b>double BOTH numbers</b> <span>→</span> <span class="question-fraction">?</span></div></div>';
  html+='<div class="gym-question"><h3>Build the new fraction yourself.</h3><div class="gym-input-row"><input id="numInput" class="gym-input" inputmode="numeric" aria-label="numerator" placeholder="numerator"><span class="equal-sign">/</span><input id="denInput" class="gym-input" inputmode="numeric" aria-label="denominator" placeholder="denominator"><button id="inputCheck" class="gym-check">Check my fraction</button></div><div id="stageFeedback" class="gym-feedback"></div></div>';
 }
 html+=nextButton();
 $("gymStage").innerHTML=html;
 const next=$("nextStage");
 if(next){
   next.textContent = stageIndex===GYM.stages.length-1 ? "Finish →" : "Next slide →";
   if(s.kind==="notice") next.classList.remove("hidden");
 }

 if(s.kind==="visual"||s.kind==="split") attachSplit(s);
 if(s.kind==="input") attachInput(s);
 $("nextStage").onclick=()=>{stageIndex++; if(stageIndex<GYM.stages.length)renderStage(); else finishStory();};
}
function attachSplit(s){
 $("splitBtn").onclick=()=>{
  const fb=$("stageFeedback");
  let nextN=s.num*2,nextD=s.den*2;
  $("gymStage").classList.add("gym-reveal");
  const visual=document.querySelector(".story-visual");
  visual.innerHTML=pieces(nextN,nextD)+'<div class="big-fraction">'+fraction(nextN,nextD)+'</div><div class="same-amount">The shaded pieces AND all pieces doubled.</div>';
  $("splitBtn").disabled=true;
  fb.innerHTML='🔎 Look: <b>'+s.num+' → '+nextN+'</b> and <b>'+s.den+' → '+nextD+'</b>. Both numbers doubled, but the shaded amount stayed the same.';
  fb.className="gym-feedback good";
  $("nextStage").classList.remove("hidden");
 };
}
function attachInput(s){
 $("inputCheck").onclick=()=>{
  const n=Number($("numInput").value),d=Number($("denInput").value),fb=$("stageFeedback");
  if(n===s.answerNum&&d===s.answerDen){
   fb.innerHTML='✓ You generated it! '+s.fromNum+' → '+n+' and '+s.fromDen+' → '+d+'. <b>Both doubled.</b>';
   fb.className="gym-feedback good"; $("inputCheck").disabled=true; $("nextStage").classList.remove("hidden");
  }else{
   fb.innerHTML='👀 Go back to the pattern: <b>double the top AND double the bottom</b>. Then try again.';
   fb.className="gym-feedback try";
  }
 };
}
function finishStory(){
 renderProgress();
 $("gymStage").innerHTML='<div class="gym-complete"><div class="big">🧠✨</div><h2>Now you generate it.</h2><p>You watched the pieces split, noticed both numbers doubling, and then made the next fraction yourself.</p><button id="discoveryBtn" class="gym-next">Show me the 3-question check →</button></div>';
 $("gymDiscovery").classList.remove("hidden");
 $("discoveryBtn").onclick=()=>renderDiscovery();
}
function renderDiscovery(){
 const d=GYM.discovery,p=d.prompts[discoveryIndex];
 $("discoveryText").textContent=d.text;
 $("discoveryChoices").innerHTML='<div class="story-question"><strong>Question '+(discoveryIndex+1)+' of '+d.prompts.length+'</strong><h3>'+p.q+'</h3><div class="discovery-choices">'+p.answers.map((x,i)=>'<button class="discovery-choice" data-i="'+i+'">'+x+'</button>').join("")+'</div><div id="discoveryFeedback" class="gym-feedback"></div></div>';
 [...document.querySelectorAll(".discovery-choice")].forEach((b,i)=>b.onclick=()=>{
  if(i===p.correct){
   b.classList.add("correct");$("discoveryFeedback").innerHTML='✓ You noticed it. <b>'+p.answers[p.correct]+'.</b>';
   $("discoveryFeedback").className="gym-feedback good";
   setTimeout(()=>{discoveryIndex++; if(discoveryIndex<d.prompts.length)renderDiscovery(); else finishDiscovery();},500);
  }else{
   b.classList.add("wrong");$("discoveryFeedback").innerHTML='Look at the picture again. Watch what happens to both numbers when every piece is split into two.';
   $("discoveryFeedback").className="gym-feedback try";
   setTimeout(()=>b.classList.remove("wrong"),600);
  }
 });
}
function finishDiscovery(){
 $("discoveryText").textContent="You found the rule by watching the pattern.";
 $("discoveryChoices").innerHTML='<div class="final-rule"><div class="rule-visual">'+fraction(1,2)+' <span>→</span> '+fraction(2,4)+' <span>→</span> '+fraction(4,8)+'</div><h2>Same amount. More equal pieces.</h2><p>To generate an equivalent fraction, multiply the numerator and denominator by the same number. Today we used ×2.</p><div class="rule-memory">🧠 1/2 → double top + double bottom → 2/4 → 4/8</div></div>';
 $("discoveryFeedback").textContent="Pattern workout complete.";
 $("discoveryFeedback").className="gym-feedback good";
}
function boot(){
 const dt=new Date(GYM.date+"T12:00:00");
 $("gymDate").textContent=new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",year:"numeric"}).format(dt);
 $("gymTitle").textContent=GYM.title;$("gymIntro").textContent=GYM.intro;$("gymFooterTopic").textContent="Today: "+GYM.title;
 renderStage();
}
boot();
