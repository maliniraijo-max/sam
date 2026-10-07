/*
 DAILY MATH GYM — MANUAL TOPIC LIBRARY
 Equivalent Fractions is preserved as a saved simulation.
 Adding Like Fractions is today's second pattern-training simulation.
*/
const TOPICS={
 equivalent:{
  label:"Equivalent Fractions",icon:"🟨",date:"2026-10-07",
  intro:"Watch the same amount get split into smaller equal pieces. Then use the pattern to generate equivalent fractions.",
  stages:[
   {k:"STORY 1 • SEE IT",title:"Meet one half",instruction:"Imagine a chocolate bar. One half is shaded. It is one piece out of two.",kind:"split",n:1,d:2},
   {k:"STORY 2 • SPLIT IT",title:"Watch the numbers change",instruction:"Split every piece into two equal pieces. Watch BOTH numbers.",kind:"split",n:1,d:2},
   {k:"STORY 3 • NOTICE",title:"Same amount. More pieces.",instruction:"Look at the three fractions together. We have not added chocolate. We only made smaller equal pieces.",kind:"notice"},
   {k:"BUILD 1 • YOU TRY",title:"Build 1/2 → ?",instruction:"If BOTH numbers are doubled, what fraction do we make?",kind:"input",fn:1,fd:2,an:2,ad:4},
   {k:"BUILD 2 • YOU TRY AGAIN",title:"Build 2/4 → ?",instruction:"Double BOTH numbers again. What fraction comes next?",kind:"input",fn:2,fd:4,an:4,ad:8},
   {k:"BUILD 3 • GENERATE",title:"Make your own equivalent fraction",instruction:"Start with 3/5. Double the numerator and double the denominator.",kind:"input",fn:3,fd:5,an:6,ad:10}
  ],
  discovery:{
   text:"Now say the pattern you discovered.",
   prompts:[
    ["When every piece is split into TWO, what happens to the numerator?",["It doubles","It stays the same"],0],
    ["When every piece is split into TWO, what happens to the denominator?",["It doubles","It becomes smaller"],0],
    ["If 1/2 becomes 2/4, what happened to the amount shaded?",["It stayed the same","It became twice as much"],0]
   ],
   final:"Same amount. More equal pieces. To generate an equivalent fraction, multiply the numerator and denominator by the same number."
  }
 },
 adding:{
  label:"Adding Like Fractions",icon:"🍕",date:"2026-10-07",
  intro:"Two friends share pizza. Watch what happens when we combine pieces that are the same size.",
  stages:[
   {k:"STORY 1 • SEE IT",title:"One quarter of a pizza",instruction:"A pizza is cut into 4 equal pieces. One piece is shaded.",kind:"pizza",a:1,b:4},
   {k:"STORY 2 • ADD IT",title:"A friend brings two more quarters",instruction:"The pieces are the SAME SIZE. We can count them together.",kind:"add",a:1,b:4,c:2},
   {k:"STORY 3 • NOTICE",title:"Count the pieces — keep the bottom",instruction:"We now have three quarter-pieces. The denominator stays 4 because the pieces are still quarters.",kind:"noticeAdd"},
   {k:"BUILD 1 • YOU TRY",title:"1/4 + 2/4 = ?",instruction:"Count the same-sized pieces. Add the top numbers.",kind:"inputAdd",a:1,b:2,d:4,an:3},
   {k:"BUILD 2 • YOU TRY AGAIN",title:"2/5 + 1/5 = ?",instruction:"These are fifths. Count how many fifths you have altogether.",kind:"inputAdd",a:2,b:1,d:5,an:3},
   {k:"BUILD 3 • GENERATE",title:"4/7 + 2/7 = ?",instruction:"The pieces are sevenths. Add the numerators and keep the denominator.",kind:"inputAdd",a:4,b:2,d:7,an:6}
  ],
  discovery:{
   text:"Now explain the pattern in your own words.",
   prompts:[
    ["When we add like fractions, what happens to the numerator?",["We add the numerators","We add the denominators"],0],
    ["In 1/4 + 2/4, why does the 4 stay?",["The pieces are still fourths","Because 1 + 2 = 4"],0],
    ["What is 3/4 in the pizza story?",["Three quarter-sized pieces","Three whole pizzas"],0]
   ],
   final:"For like fractions, the pieces have the same size. Add the numerators and keep the denominator: 1/4 + 2/4 = 3/4."
  }
 } ,
 compare:{
  label:"Comparing Fractions",icon:"⚖️",date:"2026-10-07",
  intro:"Watch two fractions made from the same-sized pieces. Compare how many pieces are shaded, then decide which fraction is greater.",
  stages:[
   {k:"STORY 1 • SEE IT",title:"Which pizza has more?",instruction:"Both pizzas are cut into 4 equal pieces. Look at the shaded pieces.",kind:"compareVisual",a:1,b:4,c:3,e:4},
   {k:"STORY 2 • COUNT IT",title:"Same-sized pieces",instruction:"The pieces are the same size. So we can simply compare how many pieces are shaded.",kind:"compareVisual",a:2,b:5,c:4,e:5},
   {k:"STORY 3 • NOTICE",title:"The denominator tells the piece size",instruction:"When the denominators are the same, the fraction with more shaded pieces is greater.",kind:"compareNotice"},
   {k:"BUILD 1 • YOU TRY",title:"Which is greater: 2/6 or 5/6?",instruction:"The pieces are sixths. Compare the number of shaded pieces.",kind:"compareInput",leftN:2,rightN:5,d:6,answer:"right"},
   {k:"BUILD 2 • YOU TRY",title:"Which is greater: 4/7 or 1/7?",instruction:"Count the sevenths.",kind:"compareInput",leftN:4,rightN:1,d:7,answer:"left"},
   {k:"BUILD 3 • GENERATE",title:"Put them in order",instruction:"Arrange these from smallest to largest: 1/8, 5/8, 3/8.",kind:"orderInput",answer:"1/8, 3/8, 5/8"}
  ],
  discovery:{
   text:"Now explain what your eyes discovered.",
   prompts:[
    ["If the denominators are the same, what do we compare?",["The numerators","The denominators"],0],
    ["Which is greater: 3/7 or 6/7?",["6/7","3/7"],0],
    ["Why is 5/8 greater than 2/8?",["It has more eighth-sized pieces","Its denominator is bigger"],0]
   ],
   final:"When fractions have the same denominator, compare the numerators. More equal pieces means the greater fraction."
  },
  quiz:[
   ["Which is greater?",["2/5","4/5","They are equal","Cannot tell"],1],
   ["Which is smaller?",["6/8","1/8","5/8","7/8"],1],
   ["Complete: 3/7 __ 5/7",["<",">","=","+"],0],
   ["Which is greatest?",["2/9","8/9","4/9","1/9"],1],
   ["Put these from smallest to largest.",["2/6, 5/6, 1/6","1/6, 2/6, 5/6","5/6, 2/6, 1/6","1/6, 5/6, 2/6"],1]
  ]
 }
};

const $=id=>document.getElementById(id);
let topicKey="equivalent",stageIndex=0,discoveryIndex=0;

function active(){return TOPICS[topicKey]}
function fraction(n,d){return '<span class="fraction-stack"><span class="num">'+n+'</span><span class="den">'+d+'</span></span>'}
function pieces(n,d,extra=""){
 let h='<div class="fraction-visual" style="--piece-count:'+d+'" aria-label="'+n+' shaded pieces out of '+d+'">';
 for(let i=0;i<d;i++)h+='<span class="piece '+(i<n?"shaded ":"")+'"></span>';
 return h+'</div>'
}
function renderTopics(){
 $("gymTopics").innerHTML=Object.entries(TOPICS).map(([key,t])=>'<button type="button" class="gym-topic '+(key===topicKey?"selected":"")+'" data-topic="'+key+'">'+t.icon+' '+t.label+'</button>').join("");
 [...document.querySelectorAll(".gym-topic")].forEach(b=>b.onclick=()=>{
  if(b.dataset.topic===topicKey)return;
  topicKey=b.dataset.topic;stageIndex=0;discoveryIndex=0;
  $("gymDiscovery").classList.add("hidden");
  renderAll();
 });
}
function renderProgress(){
 const t=active();
 $("gymProgress").innerHTML=t.stages.map((_,i)=>'<span class="gym-progress-dot '+(i<stageIndex?"done":i===stageIndex?"active":"")+'"></span>').join("");
}
function header(s){
 return '<div class="gym-stage-head"><div><p class="gym-stage-kicker">'+s.k+'</p><h2>'+s.title+'</h2><p class="gym-instruction">'+s.instruction+'</p></div><span class="gym-counter">'+(stageIndex+1)+' / '+active().stages.length+'</span></div>'
}
function nextButton(){return '<div class="gym-next-wrap"><button type="button" id="nextStage" class="gym-next hidden">Next slide →</button></div>'}
function renderStage(){
 const s=active().stages[stageIndex]; renderProgress(); let h=header(s);
 if(s.kind==="split"){
  h+='<div class="story-visual">'+pieces(s.n,s.d)+'<div class="big-fraction">'+fraction(s.n,s.d)+'</div><div class="same-amount">Watch the pieces — then split every piece into two.</div></div><button type="button" id="splitBtn" class="split-action">✂️ Split each piece</button><div id="stageFeedback" class="gym-feedback"></div>';
 }else if(s.kind==="notice"){
  h+='<div class="comparison-story"><div>'+pieces(1,2)+'<strong>1 / 2</strong></div><div class="story-arrow">→</div><div>'+pieces(2,4)+'<strong>2 / 4</strong></div><div class="story-arrow">→</div><div>'+pieces(4,8)+'<strong>4 / 8</strong></div></div><div class="notice-callout">👀 <b>1/2 → 2/4 → 4/8</b><br>Both the top and bottom numbers double.</div><div class="gym-feedback good">Same amount. More equal pieces.</div>';
 }else if(s.kind==="input"){
  h+='<div class="build-visual">'+pieces(s.fn,s.fd)+'<div class="build-equation">'+fraction(s.fn,s.fd)+' <span>→</span> <b>double BOTH numbers</b> <span>→</span> <span class="question-fraction">?</span></div></div><div class="gym-question"><h3>Build the new fraction yourself.</h3><div class="gym-input-row"><input id="numInput" class="gym-input" inputmode="numeric" placeholder="numerator" aria-label="numerator"><span class="equal-sign">/</span><input id="denInput" class="gym-input" inputmode="numeric" placeholder="denominator" aria-label="denominator"><button type="button" id="inputCheck" class="gym-check">Check my fraction</button></div><div id="stageFeedback" class="gym-feedback"></div></div>';
 }else if(s.kind==="pizza"){
  h+='<div class="pizza-story">'+pieces(1,4)+'<div class="big-fraction">'+fraction(1,4)+'</div><div class="same-amount">🍕 One quarter = one piece out of four</div></div>';
 }else if(s.kind==="add"){
  h+='<div class="addition-story"><div class="add-side"><span>Friend A</span>'+pieces(1,4)+'<b>1/4</b></div><div class="plus">+</div><div class="add-side"><span>Friend B</span>'+pieces(2,4)+'<b>2/4</b></div></div><div class="combine-arrow">↓ Combine the same-sized pieces ↓</div><div id="combinedPizza" class="combined-pizza">'+pieces(0,4)+'</div><button type="button" id="combineBtn" class="split-action">🍕 Combine the pieces</button><div id="stageFeedback" class="gym-feedback"></div>';
 }else if(s.kind==="noticeAdd"){
  h+='<div class="addition-equation">'+fraction(1,4)+' <b>+</b> '+fraction(2,4)+' <b>=</b> '+fraction(3,4)+'</div><div class="notice-callout">👀 We counted <b>1 quarter + 2 quarters = 3 quarters.</b><br>The bottom stays 4 because the pieces are still quarters.</div><div class="pizza-count">'+pieces(3,4)+'</div><div class="gym-feedback good">Like-sized pieces can be counted together.</div>';
 }else if(s.kind==="compareVisual"){
  h+='<div class="comparison-visual-pair"><div class="compare-card"><span>A</span>'+pieces(s.a,s.b)+'<strong>'+s.a+'/'+s.b+'</strong></div><div class="compare-symbol">?</div><div class="compare-card"><span>B</span>'+pieces(s.c,s.e)+'<strong>'+s.c+'/'+s.e+'</strong></div></div>';
 }else if(s.kind==="compareNotice"){
  h+='<div class="comparison-visual-pair"><div class="compare-card">'+pieces(2,6)+'<strong>2/6</strong></div><div class="compare-symbol">&lt;</div><div class="compare-card">'+pieces(5,6)+'<strong>5/6</strong></div></div><div class="notice-callout">👀 Same denominator = same-sized pieces.<br>More shaded pieces means the greater fraction.</div>';
 }else if(s.kind==="compareInput"){
  h+='<div class="comparison-equation">'+fraction(s.leftN,s.d)+' <b>?</b> '+fraction(s.rightN,s.d)+'</div><div class="answer-options compare-choice-row"><button type="button" class="answer-btn" data-cmp="left">'+s.leftN+'/'+s.d+' is greater</button><button type="button" class="answer-btn" data-cmp="right">'+s.rightN+'/'+s.d+' is greater</button></div><div id="stageFeedback" class="gym-feedback"></div>';
 }else if(s.kind==="orderInput"){
  h+='<div class="comparison-equation"><span>1/8</span> • <span>5/8</span> • <span>3/8</span></div><div class="gym-question"><h3>Type the order from smallest to largest.</h3><input id="orderInput" class="gym-input order-field" placeholder="e.g. 1/8, 3/8, 5/8" aria-label="fraction order"><button type="button" id="orderCheck" class="gym-check">Check order</button><div id="stageFeedback" class="gym-feedback"></div></div>';
 }else if(s.kind==="inputAdd"){
  h+='<div class="addition-equation">'+fraction(s.a,s.d)+' <b>+</b> '+fraction(s.b,s.d)+' <b>=</b> <span class="question-fraction">?</span></div><div class="gym-question"><h3>How many '+s.d+'ths do you have?</h3><div class="gym-input-row"><input id="numInput" class="gym-input" inputmode="numeric" placeholder="numerator" aria-label="answer numerator"><span class="equal-sign">/</span><span class="gym-fixed-den">'+s.d+'</span><button type="button" id="inputCheck" class="gym-check">Check</button></div><div id="stageFeedback" class="gym-feedback"></div></div>';
 }
 h+=nextButton(); $("gymStage").innerHTML=h;
 $("nextStage").onclick=()=>{stageIndex++;if(stageIndex<active().stages.length)renderStage();else finishStory()};
 if(s.kind==="notice"||s.kind==="noticeAdd"||s.kind==="pizza"||s.kind==="compareNotice") $("nextStage").classList.remove("hidden"); if(s.kind==="split")attachSplit(s); if(s.kind==="input")attachInput(s); if(s.kind==="add")attachAdd(s); if(s.kind==="inputAdd")attachAddInput(s); if(s.kind==="compareVisual") $("nextStage").classList.remove("hidden"); if(s.kind==="compareInput")attachCompareInput(s); if(s.kind==="orderInput")attachOrderInput(s);
}
function attachSplit(s){
 $("splitBtn").onclick=()=>{const nn=s.n*2,nd=s.d*2;document.querySelector(".story-visual").innerHTML=pieces(nn,nd)+'<div class="big-fraction">'+fraction(nn,nd)+'</div><div class="same-amount"><b>'+s.n+' → '+nn+'</b> and <b>'+s.d+' → '+nd+'</b>. Both doubled.</div>';$("splitBtn").disabled=true;$("stageFeedback").innerHTML='🔎 Look at BOTH numbers: they doubled together. The amount did not change.';$("stageFeedback").className="gym-feedback good";$("nextStage").classList.remove("hidden")};
}
function attachInput(s){
 $("inputCheck").onclick=()=>{const n=Number($("numInput").value),d=Number($("denInput").value);if(n===s.an&&d===s.ad){$("stageFeedback").innerHTML='✓ You generated it. Both numbers doubled.';$("stageFeedback").className="gym-feedback good";$("inputCheck").disabled=true;$("nextStage").classList.remove("hidden")}else{$("stageFeedback").innerHTML='👀 Look at the pattern: double the top AND double the bottom.';$("stageFeedback").className="gym-feedback try"}}
}
function attachAdd(s){
 $("combineBtn").onclick=()=>{ $("combinedPizza").innerHTML=pieces(s.a+s.c,s.b);$("combineBtn").disabled=true;$("nextStage").classList.remove("hidden");$("stageFeedback").innerHTML='🔎 Count them: 1 quarter + 2 quarters = 3 quarters. We counted pieces of the same size.';$("stageFeedback").className="gym-feedback good";}
}
function attachAddInput(s){
 $("inputCheck").onclick=()=>{const n=Number($("numInput").value);if(n===s.an){$("stageFeedback").innerHTML='✓ You counted the pieces correctly: '+s.a+' + '+s.b+' = '+n+' '+s.d+'ths.';$("stageFeedback").className="gym-feedback good";$("inputCheck").disabled=true;$("nextStage").classList.remove("hidden")}else{$("stageFeedback").innerHTML='👀 Count the same-sized pieces. Add the top numbers and keep '+s.d+' on the bottom.';$("stageFeedback").className="gym-feedback try"}}
}

function attachCompareInput(s){document.querySelectorAll("[data-cmp]").forEach(b=>b.onclick=()=>{const ok=b.dataset.cmp===s.answer;if(ok){b.classList.add("correct");$("stageFeedback").textContent="✓ More same-sized pieces means the greater fraction.";$("stageFeedback").className="gym-feedback good";document.querySelectorAll("[data-cmp]").forEach(x=>x.disabled=true);$("nextStage").classList.remove("hidden")}else{b.classList.add("wrong");$("stageFeedback").textContent="👀 Compare the number of shaded pieces. The pieces are the same size.";$("stageFeedback").className="gym-feedback try";setTimeout(()=>b.classList.remove("wrong"),600)}})}
function attachOrderInput(s){$("orderCheck").onclick=()=>{const v=$("orderInput").value.trim().replace(/\\s+/g," ");if(v==="1/8, 3/8, 5/8"||v==="1/8,3/8,5/8"){ $("stageFeedback").textContent="✓ You ordered the fractions from fewest eighths to most eighths.";$("stageFeedback").className="gym-feedback good";$("orderCheck").disabled=true;$("nextStage").classList.remove("hidden")}else{$("stageFeedback").textContent="👀 Start with the fraction with the fewest eighths."; $("stageFeedback").className="gym-feedback try"}}}

function finishStory(){
 $("gymDiscovery").classList.remove("hidden");discoveryIndex=0;renderDiscovery();window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
}
function renderDiscovery(){
 const d=active().discovery,p=d.prompts[discoveryIndex];
 $("discoveryText").textContent=d.text;
 $("discoveryChoices").innerHTML='<div class="story-question"><strong>UNDERSTANDING • '+(discoveryIndex+1)+' / '+d.prompts.length+'</strong><h3>'+p[0]+'</h3><div class="discovery-choices">'+p[1].map((x,i)=>'<button type="button" class="discovery-choice" data-i="'+i+'">'+x+'</button>').join("")+'</div><div id="discoveryFeedback" class="gym-feedback"></div></div>';
 [...document.querySelectorAll(".discovery-choice")].forEach((b,i)=>b.onclick=()=>{if(i===p[2]){b.classList.add("correct");$("discoveryFeedback").textContent="✓ You found the pattern.";$("discoveryFeedback").className="gym-feedback good";setTimeout(()=>{discoveryIndex++;if(discoveryIndex<d.prompts.length)renderDiscovery();else finishDiscovery()},450)}else{b.classList.add("wrong");$("discoveryFeedback").textContent=topicKey==="adding"?"Look at the pizza pieces again. They are the same size.":"Look at both numbers in the picture again.";$("discoveryFeedback").className="gym-feedback try";setTimeout(()=>b.classList.remove("wrong"),600)}});
}
function finishQuiz(){const q=active().quiz;let qi=0,score=0;function show(){const x=q[qi];$("discoveryText").textContent="Quiz • "+(qi+1)+" of "+q.length;$("discoveryChoices").innerHTML='<div class="story-question"><strong>FINAL QUIZ</strong><h3>'+x[0]+'</h3><div class="discovery-choices">'+x[1].map((o,i)=>'<button type="button" class="discovery-choice" data-q="'+i+'">'+o+'</button>').join("")+'</div><div id="discoveryFeedback" class="gym-feedback"></div></div>' ;document.querySelectorAll("[data-q]").forEach((b,i)=>b.onclick=()=>{if(i===x[1].indexOf(x[1][x[2]??0])){} const correctIndex=[1,1,0,1,1][qi]; if(i===correctIndex){score++;b.classList.add("correct");$("discoveryFeedback").textContent="✓ Correct";$("discoveryFeedback").className="gym-feedback good"}else{b.classList.add("wrong");$("discoveryFeedback").textContent="Look back at the visual pattern and try again.";$("discoveryFeedback").className="gym-feedback try"}document.querySelectorAll("[data-q]").forEach(z=>z.disabled=true);setTimeout(()=>{qi++;if(qi<q.length)show();else{$("discoveryText").textContent="Quiz complete";$("discoveryChoices").innerHTML='<div class="final-rule"><h2>🏆 '+score+' / '+q.length+'</h2><p>You compared same-sized pieces and used the pattern to compare fractions.</p></div>'}},550)})}show()}
function finishDiscovery(){
 const d=active().discovery;
 $("discoveryText").textContent="Now you can explain the idea.";
 $("discoveryChoices").innerHTML='<div class="final-rule"><div class="rule-visual">'+d.final+'</div><p>This is the part to remember — because you discovered it before seeing the rule.</p></div>';
 $("discoveryFeedback").textContent="Understanding check complete.";
 $("discoveryFeedback").className="gym-feedback good";
 if(active().quiz){setTimeout(finishQuiz,700)}
}
function renderAll(){
 const t=active(),dt=new Date(t.date+"T12:00:00");
 $("gymTitle").textContent=t.label;$("gymIntro").textContent=t.intro;$("gymFooterTopic").textContent="Today: "+t.label;
 $("gymDate").textContent=new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",year:"numeric"}).format(dt);
 renderTopics();renderProgress();renderStage();
}
renderAll();
