const BANK={
fractions:[
 {q:"Which fraction shows one part out of four equal parts?",o:["1/2","1/3","1/4","4/1"],a:2},
 {q:"Which fraction is equivalent to 1/2?",o:["2/4","1/4","2/3","3/5"],a:0},
 {q:"Which is greater?",o:["1/5","1/2","They are equal","Cannot tell"],a:1},
 {q:"What is 2/5 + 1/5?",o:["3/5","2/10","3/10","1/5"],a:0},
 {q:"Which fraction is a proper fraction?",o:["7/4","5/5","3/8","9/2"],a:2},
 {q:"A pizza is divided into 8 equal slices. Sam eats 3. What fraction is left?",o:["3/8","5/8","8/3","1/8"],a:1}
],
number:[
 {q:"What is the place value of 6 in 4,682?",o:["6","60","600","6000"],a:2},
 {q:"Which number is a factor of 24?",o:["5","7","8","11"],a:2},
 {q:"What comes next: 4, 8, 12, 16, ___?",o:["18","20","22","24"],a:1},
 {q:"Which is the smallest?",o:["305","350","503","530"],a:0},
 {q:"Which number is divisible by 5?",o:["42","63","75","88"],a:2},
 {q:"How many hundreds are in 3,456?",o:["3","4","34","345"],a:0}
],
geometry:[
 {q:"How many sides does a hexagon have?",o:["5","6","7","8"],a:1},
 {q:"An angle smaller than a right angle is called…",o:["acute","obtuse","straight","reflex"],a:0},
 {q:"A square has how many equal sides?",o:["2","3","4","5"],a:2},
 {q:"What is the perimeter of a square with side 5 cm?",o:["10 cm","15 cm","20 cm","25 cm"],a:2},
 {q:"Which shape has no corners?",o:["triangle","circle","rectangle","pentagon"],a:1},
 {q:"A straight angle measures…",o:["45°","90°","180°","360°"],a:2}
],
challenge:[
 {q:"If 3 pencils cost ₹15, what is the cost of 1 pencil?",o:["₹3","₹5","₹6","₹8"],a:1},
 {q:"What is 25% of 100?",o:["10","20","25","50"],a:2},
 {q:"Which number is both even and a multiple of 3?",o:["7","9","12","15"],a:2},
 {q:"What is 3 × 12?",o:["24","30","36","42"],a:2},
 {q:"A rectangle is 8 cm long and 3 cm wide. Its perimeter is…",o:["11 cm","22 cm","24 cm","48 cm"],a:1},
 {q:"If 1/4 of a number is 5, what is the number?",o:["9","15","20","25"],a:2}
]};
const titles={fractions:["Fraction Forest","🐲","🍕"],number:["Number Mountain","🦅","🔢"],geometry:["Shape Castle","🧌","📐"],challenge:["Brain Boss","🤖","⚡"]};
let state=JSON.parse(localStorage.getItem("samMathFunV1")||'{"stars":0,"coins":0,"xp":0,"streak":0,"missions":0}');
let mode="fractions", questions=[], index=0, score=0, answered=false;
const $=id=>document.getElementById(id);
function save(){localStorage.setItem("samMathFunV1",JSON.stringify(state));renderStats()}
function renderStats(){ $("stars").textContent=state.stars;$("coins").textContent=state.coins;$("streak").textContent=state.streak;const lvl=Math.floor(state.xp/100)+1;const inLvl=state.xp%100;$("level").textContent="Level "+lvl;$("xpText").textContent=inLvl+" / 100 XP";$("xpBar").style.width=inLvl+"%";$("rank").textContent=lvl<3?"Starter Explorer":lvl<6?"Math Adventurer":lvl<10?"Math Hero":"Math Master"}
function openGame(m){mode=m;questions=[...BANK[m]].sort(()=>Math.random()-.5).slice(0,5);index=0;score=0;answered=false;$("gameModal").classList.remove("hidden");$("gameModal").setAttribute("aria-hidden","false");$("gameLabel").textContent="MISSION • "+(m==="challenge"?"BOSS BATTLE":"MATH QUEST");$("gameTitle").textContent=titles[m][0];$("enemy").textContent=titles[m][1];renderQuestion()}
function renderQuestion(){const x=questions[index];answered=false;$("questionNumber").textContent="Question "+(index+1)+" of "+questions.length;$("gameProgress").textContent=(index+1)+" / "+questions.length;$("question").textContent=x.q;$("feedback").textContent="";$("energyBar").style.width="100%";$("energyText").textContent="3 / 3";const box=$("options");box.innerHTML="";x.o.forEach((v,i)=>{const b=document.createElement("button");b.className="option";b.textContent=v;b.onclick=()=>answer(i,b);box.appendChild(b)})}
function answer(choice,btn){if(answered)return;answered=true;const x=questions[index];document.querySelectorAll(".option").forEach(b=>b.disabled=true);if(choice===x.a){score++;btn.classList.add("correct");$("feedback").textContent="✨ Great move!";$("feedback").style.color="#32804b"}else{btn.classList.add("wrong");document.querySelectorAll(".option")[x.a].classList.add("correct");$("feedback").textContent="The correct move is highlighted. Keep exploring!";$("feedback").style.color="#7a5a24"}setTimeout(()=>{if(index<questions.length-1){index++;renderQuestion()}else finish()},750)}
function finish(){const earned=Math.max(10,score*8+10);const coins=score*3+5;state.stars+=earned;state.coins+=coins;state.xp+=score*15+20;state.streak=state.streak+1;state.missions++;save();$("gameModal").classList.add("hidden");$("resultModal").classList.remove("hidden");$("earnedStars").textContent=earned;$("earnedCoins").textContent=coins;$("earnedXp").textContent=score*15+20;$("resultTitle").textContent=score===questions.length?"Math Master Move!":"Quest Complete!";$("resultText").textContent=score+" out of "+questions.length+" challenges solved. Your treasure is growing!";$("playAgain").onclick=()=>{ $("resultModal").classList.add("hidden");openGame(mode)}}
document.querySelectorAll(".mission").forEach(b=>b.addEventListener("click",()=>openGame(b.dataset.mode)));
$("closeGame").onclick=()=>{$("gameModal").classList.add("hidden")};window.addEventListener("keydown",e=>{if(e.key==="Escape"){$("gameModal").classList.add("hidden");$("resultModal").classList.add("hidden")}});renderStats();
