/*
  DAILY MATH GYM — MANUAL CONTENT
  --------------------------------
  This file is intentionally NOT automated.
  Mum/teacher can replace GYM.date, GYM.title, GYM.intro and the stages
  whenever a new pattern needs training.
*/

const GYM={
  date:"2026-10-07",
  title:"Equivalent Fractions",
  intro:"Today we are not going to memorise a rule first. We are going to look at fractions, compare them, and let the pattern reveal itself.",
  stages:[
    {
      type:"observe",
      kicker:"ROUND 1 • JUST LOOK",
      title:"These fractions are the same amount.",
      instruction:"Look carefully. What do you notice about the pairs?",
      pairs:[["1/2","2/4"],["1/2","3/6"],["1/2","4/8"],["1/2","5/10"]],
      prompt:"Which statement best describes what you are seeing?",
      options:["The numbers are different, but the amount is the same.","Only the bottom number changes.","The first fraction is always bigger.","The fractions have nothing in common."],
      answer:0
    },
    {
      type:"sequence",
      kicker:"ROUND 2 • SPOT THE NEXT ONE",
      title:"Can you predict the missing fraction?",
      instruction:"Do not calculate yet. Look at how the numbers grow.",
      sequence:["1/2","2/4","3/6","?"],
      options:["3/8","4/8","4/6","5/8"],
      answer:1
    },
    {
      type:"sequence",
      kicker:"ROUND 3 • SAME PATTERN",
      title:"This time the top number starts at 2.",
      instruction:"Watch both numbers. They are changing together.",
      sequence:["2/3","4/6","6/9","?"],
      options:["7/10","8/12","8/9","10/12"],
      answer:1
    },
    {
      type:"compare",
      kicker:"ROUND 4 • MATCH THE SAME AMOUNT",
      title:"Find the fraction that belongs with 3/4.",
      instruction:"Think about the pattern you have already seen.",
      left:"3/4",
      options:["4/8","6/8","6/12","9/16"],
      answer:1
    },
    {
      type:"compare",
      kicker:"ROUND 5 • ANOTHER MATCH",
      title:"Which fraction is the same as 2/5?",
      instruction:"Look for the pair that keeps the same relationship.",
      left:"2/5",
      options:["3/10","4/10","4/15","5/10"],
      answer:1
    },
    {
      type:"sequence",
      kicker:"ROUND 6 • COMPLETE THE FAMILY",
      title:"One fraction family is hiding a pattern.",
      instruction:"Fill the missing member by recognising the sequence.",
      sequence:["3/5","6/10","9/15","?"],
      options:["10/20","12/20","12/15","15/20"],
      answer:1
    },
    {
      type:"input",
      kicker:"ROUND 7 • YOU PREDICT",
      title:"What comes next?",
      instruction:"Write the missing numerator and denominator.",
      sequence:["1/3","2/6","3/9","4/12","?"],
      numerator:5,
      denominator:15
    },
    {
      type:"compare",
      kicker:"ROUND 8 • CAN YOU SEE IT WITHOUT CALCULATING?",
      title:"Which one is the same as 4/6?",
      instruction:"Use the pattern your eyes have been collecting.",
      left:"4/6",
      options:["2/3","3/5","4/8","6/8"],
      answer:0
    },
    {
      type:"sequence",
      kicker:"ROUND 9 • MIXED PATTERN",
      title:"The numerator and denominator grow together.",
      instruction:"Find the missing fraction.",
      sequence:["2/7","4/14","6/21","?"],
      options:["8/24","8/28","10/28","8/21"],
      answer:1
    }
  ],
  discovery:{
    text:"You have seen many different numbers. What pattern do you think is hiding underneath them?",
    options:[
      "The top and bottom numbers can grow together while the fraction keeps the same value.",
      "Only the denominator matters.",
      "A bigger denominator always means a bigger fraction.",
      "Equivalent fractions must always have the same numbers."
    ],
    answer:0
  }
};

const $=id=>document.getElementById(id);
let stageIndex=0;
let stageLocked=false;
let discoveryLocked=false;

function fraction(text){
  const [n,d]=String(text).split("/");
  return '<span class="fraction-stack"><span class="num">'+n+'</span><span class="den">'+d+'</span></span>';
}
function shuffleOptions(options,answer){
  // Keep today's pattern choices stable so the manually designed progression stays readable.
  return options.map((text,i)=>({text,correct:i===answer}));
}
function renderProgress(){
  $("gymProgress").innerHTML=GYM.stages.map((_,i)=>{
    const cls=i<stageIndex?"done":i===stageIndex?"active":"";
    return '<span class="gym-progress-dot '+cls+'"></span>';
  }).join("");
}
function stageHeader(s){
  return '<div class="gym-stage-head"><div><p class="gym-stage-kicker">'+s.kicker+'</p><h2>'+s.title+'</h2><p class="gym-instruction">'+s.instruction+'</p></div><span class="gym-counter">'+(stageIndex+1)+' / '+GYM.stages.length+'</span></div>';
}
function optionButtons(s,kind){
  return '<div class="answer-options">'+shuffleOptions(s.options,s.answer).map((o,i)=>
    '<button class="answer-btn" data-answer="'+i+'">'+(kind==="compare"&&i===0&&false?"":o.text)+'</button>'
  ).join("")+'</div>';
}
function attachMCQ(s){
  const buttons=[...document.querySelectorAll(".answer-btn")];
  buttons.forEach((b,i)=>b.onclick=()=>{
    if(stageLocked)return;
    stageLocked=true;
    const ok=i===s.answer;
    b.classList.add(ok?"correct":"wrong");
    buttons.forEach(x=>x.disabled=true);
    const fb=$("stageFeedback");
    if(ok){fb.textContent="✓ Yes. Your pattern is getting stronger.";fb.className="gym-feedback good";showNext();}
    else{fb.textContent="Look again. Compare the top and bottom numbers in the examples above.";fb.className="gym-feedback try";setTimeout(()=>{stageLocked=false;buttons.forEach(x=>{x.disabled=false;x.classList.remove("wrong")});},650);}
  });
}
function showNext(){
  $("nextStage").classList.remove("hidden");
}
function renderStage(){
  stageLocked=false;
  renderProgress();
  const s=GYM.stages[stageIndex];
  let html=stageHeader(s);
  if(s.type==="observe"){
    html+='<div class="pattern-grid">'+s.pairs.map(p=>'<div class="pattern-card"><div class="equal-row">'+fraction(p[0])+'<span class="equal-sign">=</span>'+fraction(p[1])+'</div><small>same amount</small></div>').join("")+'</div>';
    html+='<div class="gym-question"><h3>'+s.prompt+'</h3>'+optionButtons(s,"observe")+'<div id="stageFeedback" class="gym-feedback"></div></div>';
  }else if(s.type==="sequence"){
    html+='<div class="pattern-strip">'+s.sequence.map((x,i)=>(x==="?"?'<span class="strip-frac">?</span>':fraction(x))+(i<s.sequence.length-1?'<span class="strip-arrow">→</span>':"")).join("")+'</div>';
    html+='<div class="gym-question"><h3>Which fraction completes the pattern?</h3>'+optionButtons(s,"sequence")+'<div id="stageFeedback" class="gym-feedback"></div></div>';
  }else if(s.type==="compare"){
    html+='<div class="equal-row"><span class="same-pill">START HERE</span>'+fraction(s.left)+'</div>';
    html+='<div class="gym-question"><h3>'+s.title+'</h3>'+optionButtons(s,"compare")+'<div id="stageFeedback" class="gym-feedback"></div></div>';
  }else if(s.type==="input"){
    html+='<div class="pattern-strip">'+s.sequence.slice(0,-1).map((x,i)=>(i?'<span class="strip-arrow">→</span>':"")+fraction(x)).join("")+'<span class="strip-arrow">→</span><span class="strip-frac">?</span></div>';
    html+='<div class="gym-question"><h3>Fill in the two numbers.</h3><div class="gym-input-row"><input id="numInput" class="gym-input" inputmode="numeric" aria-label="numerator" placeholder="?"><span class="equal-sign">/</span><input id="denInput" class="gym-input" inputmode="numeric" aria-label="denominator" placeholder="?"><button id="inputCheck" class="gym-check">Check</button></div><div id="stageFeedback" class="gym-feedback"></div></div>';
  }
  html+='<div class="gym-next-wrap"><button id="nextStage" class="gym-next hidden">Next pattern →</button></div>';
  $("gymStage").innerHTML=html;
  if(s.type==="input")attachInput(s); else attachMCQ(s);
  $("nextStage").onclick=()=>{stageIndex++; if(stageIndex<GYM.stages.length)renderStage(); else finishGym();};
}
function attachInput(s){
  $("inputCheck").onclick=()=>{
    if(stageLocked)return;
    const n=Number($("numInput").value),d=Number($("denInput").value);
    const fb=$("stageFeedback");
    if(n===s.numerator&&d===s.denominator){
      stageLocked=true;fb.textContent="✓ Yes. You predicted the pattern.";fb.className="gym-feedback good";showNext();
    }else{
      fb.textContent="Not quite. Look at how the numerator and denominator changed in each step.";fb.className="gym-feedback try";
    }
  };
}
function finishGym(){
  renderProgress();
  $("gymStage").innerHTML='<div class="gym-complete"><div class="big">🏆</div><h2>Pattern workout complete!</h2><p>You did not start with a rule. You looked at examples, compared them, predicted what came next, and built the idea from the pattern.</p><button id="discoveryBtn" class="gym-next">Now tell me what you discovered →</button></div>';
  $("discoveryBtn").onclick=()=>{$("gymDiscovery").classList.remove("hidden");$("gymDiscovery").scrollIntoView({behavior:"smooth",block:"start"});};
  $("gymDiscovery").classList.remove("hidden");
}
function attachDiscovery(){
  const d=GYM.discovery;
  $("discoveryText").textContent=d.text;
  $("discoveryChoices").innerHTML=d.options.map((x,i)=>'<button class="discovery-choice" data-discovery="'+i+'">'+x+'</button>').join("");
  [...document.querySelectorAll(".discovery-choice")].forEach((b,i)=>b.onclick=()=>{
    if(discoveryLocked)return;
    if(i===d.answer){
      discoveryLocked=true;b.classList.add("correct");$("discoveryFeedback").textContent="✓ Exactly. You discovered the key idea yourself.";$("discoveryFeedback").className="gym-feedback good";
    }else{
      b.classList.add("wrong");$("discoveryFeedback").textContent="Look back at the fraction families. The pattern is in how both numbers change together.";$("discoveryFeedback").className="gym-feedback try";
      setTimeout(()=>b.classList.remove("wrong"),600);
    }
  });
}
function boot(){
  const dt=new Date(GYM.date+"T12:00:00");
  $("gymDate").textContent=new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",year:"numeric"}).format(dt);
  $("gymTitle").textContent=GYM.title;
  $("gymIntro").textContent=GYM.intro;
  $("gymFooterTopic").textContent="Today: "+GYM.title;
  attachDiscovery();
  renderStage();
}
boot();
