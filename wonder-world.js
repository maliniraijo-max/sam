(() => {
"use strict";
const $ = (id) => document.getElementById(id);
const setFeedback = (el, text, kind="") => { el.textContent=text; el.className="feedback"+(kind?" "+kind:""); };
const tabs=[...document.querySelectorAll(".wonder-tab")];
const panels=[...document.querySelectorAll(".wonder-panel")];
tabs.forEach(tab=>tab.addEventListener("click",()=>{
  tabs.forEach(t=>{const active=t===tab;t.classList.toggle("active",active);t.setAttribute("aria-pressed",String(active));});
  panels.forEach(panel=>{const active=panel.id==="panel-"+tab.dataset.panel;panel.hidden=!active;panel.classList.toggle("active",active);});
}));

// Word World: every letter is a separate selectable tile, including repeated letters.
const words=[
 {word:"CAT",emoji:"🐱",clue:"A pet that says “meow”",tiles:["T","A","C","M","O"]},
 {word:"SUN",emoji:"☀️",clue:"It shines in the daytime sky",tiles:["N","S","U","P","A"]},
 {word:"FISH",emoji:"🐟",clue:"An animal that swims with fins",tiles:["H","F","I","S","T"]},
 {word:"BIRD",emoji:"🐦",clue:"An animal with feathers and wings",tiles:["D","B","R","I","A"]},
 {word:"FROG",emoji:"🐸",clue:"A green animal that can hop",tiles:["G","F","O","R","T"]}
];
let wordIndex=0, picked=[];
function renderWord(){
 const w=words[wordIndex];$("wordPicture").textContent=w.emoji;$("wordClue").textContent=w.clue;
 $("letterBank").replaceChildren();$("wordSlots").replaceChildren();picked=[];
 w.tiles.forEach((letter,index)=>{const b=document.createElement("button");b.type="button";b.textContent=letter;b.setAttribute("aria-label","Choose letter "+letter);b.addEventListener("click",()=>{if(b.disabled)return;picked.push({letter,index});b.disabled=true;renderSlots();setFeedback($("wordFeedback"),"Good exploring! Add another letter or check your word.");});$("letterBank").append(b);});
 renderSlots();setFeedback($("wordFeedback"),"Build the word one letter at a time.");
}
function renderSlots(){const box=$("wordSlots");box.replaceChildren();for(let i=0;i<words[wordIndex].word.length;i++){const slot=document.createElement("span");slot.className="word-slot";slot.textContent=picked[i]?.letter||"·";box.append(slot);}}
$("wordUndo").addEventListener("click",()=>{const last=picked.pop();if(last){$("letterBank").children[last.index].disabled=false;renderSlots();setFeedback($("wordFeedback"),"One letter removed. Keep going.");}});
$("wordReset").addEventListener("click",renderWord);
$("wordCheck").addEventListener("click",()=>{const answer=picked.map(x=>x.letter).join("");if(answer===words[wordIndex].word)setFeedback($("wordFeedback"),"Brilliant! "+answer+" is correct. 🌟","good");else setFeedback($("wordFeedback"),answer.length<words[wordIndex].word.length?"Add "+(words[wordIndex].word.length-answer.length)+" more letter(s), then check again.":"Not quite. Try moving or changing a letter.","try");});
$("wordNext").addEventListener("click",()=>{wordIndex=(wordIndex+1)%words.length;renderWord();});

// Maths Playground: fractions are generated from data, and the correct answer is computed.
const pairs=[{a:2,b:3,d:4},{a:1,b:3,d:5},{a:4,b:2,d:6},{a:3,b:3,d:7},{a:1,b:4,d:8}];
let pairIndex=0,mathAnswered=false;
function fractionBar(id,n,d){const bar=$(id);bar.replaceChildren();for(let i=0;i<d;i++){const p=document.createElement("span");p.className="fraction-piece"+(i<n?" filled":"");bar.append(p);}bar.setAttribute("aria-label",n+" of "+d+" pieces shaded");}
function renderPair(){const p=pairs[pairIndex];$("fracA-num").textContent=p.a;$("fracA-den").textContent=p.d;$("fracB-num").textContent=p.b;$("fracB-den").textContent=p.d;fractionBar("fracA-bar",p.a,p.d);fractionBar("fracB-bar",p.b,p.d);mathAnswered=false;document.querySelectorAll("#fractionChoices button").forEach(b=>b.disabled=false);setFeedback($("mathFeedback"),"Study the shaded pieces, then choose.");}
document.querySelectorAll("#fractionChoices button").forEach(button=>button.addEventListener("click",()=>{if(mathAnswered)return;mathAnswered=true;document.querySelectorAll("#fractionChoices button").forEach(b=>b.disabled=true);const p=pairs[pairIndex],actual=p.a===p.b?"equal":p.a>p.b?"left":"right";if(button.dataset.answer===actual)setFeedback($("mathFeedback"),"Yes! "+p.a+"/"+p.d+(actual==="equal"?" is equal to ":actual==="left"?" is greater than ":" is less than ")+p.b+"/"+p.d+". Same denominator: compare the top numbers. ⭐","good");else setFeedback($("mathFeedback"),"Look at the shaded pieces. The correct answer is: "+(actual==="equal"?"They are equal.":actual==="left"?"Left is greater.":"Right is greater.")+" The denominator is the same, so compare the numerators.","try");}));
$("mathNext").addEventListener("click",()=>{pairIndex=(pairIndex+1)%pairs.length;renderPair();});

// Story Adventures: answer feedback comes from each story's own comprehension key.
const stories=[
 {art:"🐦🌳☀️",label:"THE LITTLE HELPER",title:"A Safe Place",text:"After a windy night, Mina found a tiny bird sitting beneath a tree. She watched quietly from a distance while its parent returned with food. Mina smiled because the little bird was safe.",question:"Why did Mina smile?",options:["She saw the bird's parent return.","She found a new toy.","It began to rain."],correct:0},
 {art:"🐢🍃💧",label:"A SLOW AND STEADY DAY",title:"Toby Finds the Pond",text:"Toby the tortoise wanted to reach the pond before sunset. He walked steadily, stopping to drink water and rest in the shade. At last, he reached the pond and saw his friends waiting.",question:"How did Toby reach the pond?",options:["He rushed without stopping.","He walked steadily and took rests.","His friends carried him."],correct:1},
 {art:"🌱☀️🪴",label:"A TINY BEGINNING",title:"Nila's Seed",text:"Nila planted a bean seed in a pot. She gave it water and placed the pot where sunlight could reach it. After some days, a small green shoot appeared above the soil.",question:"What helped Nila's seed grow?",options:["Water and sunlight.","Paint and paper.","A cold dark cupboard."],correct:0}
];
let storyIndex=0,storyDone=false;
function renderStory(){const s=stories[storyIndex];$("storyArt").textContent=s.art;$("storyLabel").textContent=s.label;$("storyTitle").textContent=s.title;$("storyText").textContent=s.text;$("storyQuestion").textContent=s.question;$("storyOptions").replaceChildren();storyDone=false;s.options.forEach((option,i)=>{const b=document.createElement("button");b.type="button";b.textContent=option;b.addEventListener("click",()=>{if(storyDone)return;storyDone=true;[...$("storyOptions").children].forEach(x=>x.disabled=true);if(i===s.correct){b.classList.add("correct");setFeedback($("storyFeedback"),"That's right! You used a clue from the story. 🌟","good");}else{[...$("storyOptions").children][s.correct].classList.add("correct");setFeedback($("storyFeedback"),"Good try. The story tells us: "+s.options[s.correct],"try");}});$("storyOptions").append(b);});setFeedback($("storyFeedback"),"Choose the answer that matches the story.");}
$("storyNext").addEventListener("click",()=>{storyIndex=(storyIndex+1)%stories.length;renderStory();});

// Discovery Lab: stage order is a simple guided sequence with corrective feedback.
const stages=[
 {emoji:"🌰",title:"A seed",description:"A seed contains a tiny baby plant.",question:"What happens when the seed gets water, air and warmth?",options:["A seed begins to sprout","A flower appears straight away","The seed becomes a stone"],correct:0},
 {emoji:"🌱",title:"A sprout",description:"A tiny root and shoot begin to grow.",question:"What grows as the young plant gets bigger?",options:["A shell","Leaves and a stem","Feathers"],correct:1},
 {emoji:"🪴",title:"A young plant",description:"Roots take in water and leaves use sunlight.",question:"What may a healthy mature plant grow?",options:["Wheels","Clouds","Flowers"],correct:2},
 {emoji:"🌼",title:"A flowering plant",description:"Flowers can help the plant make seeds for a new life cycle.",question:"What can a flower help the plant make?",options:["New seeds","Pebbles","Raindrops"],correct:0}
];
let stageIndex=0,stageAnswered=false;
function renderStage(){const s=stages[stageIndex];$("stageEmoji").textContent=s.emoji;$("stageTitle").textContent=s.title;$("stageDescription").textContent=s.description;$("stageCount").textContent=stageIndex+1;$("stageQuestion").textContent=s.question;$("stageOptions").replaceChildren();stageAnswered=false;$("stageNext").disabled=true;$("stageNext").textContent=stageIndex===stages.length-1?"Finish cycle ✓":"Continue →";s.options.forEach((option,i)=>{const b=document.createElement("button");b.type="button";b.textContent=option;b.addEventListener("click",()=>{if(stageAnswered)return;stageAnswered=true;[...$("stageOptions").children].forEach(x=>x.disabled=true);if(i===s.correct){b.classList.add("correct");setFeedback($("discoveryFeedback"),"Correct! "+s.description,"good");$("stageNext").disabled=false;}else{[...$("stageOptions").children][s.correct].classList.add("correct");setFeedback($("discoveryFeedback"),"Not quite. "+s.options[s.correct]+". Notice how the plant changes at each stage.","try");$("stageNext").disabled=false;}});$("stageOptions").append(b);});setFeedback($("discoveryFeedback"),"Choose the next stage.");}
$("stageNext").addEventListener("click",()=>{if(!stageAnswered)return;if(stageIndex<stages.length-1){stageIndex++;renderStage();}else{stageIndex=0;renderStage();setFeedback($("discoveryFeedback"),"You completed the plant life cycle! Start again to practise. 🌱","good");}});
$("stageRestart").addEventListener("click",()=>{stageIndex=0;renderStage();});

// Creative Studio: pointer events support mouse, stylus and touch; export uses a real PNG.
const canvas=$("artCanvas"),ctx=canvas.getContext("2d");let drawing=false,lastPoint=null,eraser=false;
ctx.lineCap="round";ctx.lineJoin="round";ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);
function pointFromEvent(event){const r=canvas.getBoundingClientRect();return {x:(event.clientX-r.left)*(canvas.width/r.width),y:(event.clientY-r.top)*(canvas.height/r.height)};}
canvas.addEventListener("pointerdown",event=>{drawing=true;lastPoint=pointFromEvent(event);canvas.setPointerCapture(event.pointerId);ctx.beginPath();ctx.arc(lastPoint.x,lastPoint.y,Number($("brushSize").value)/2,0,Math.PI*2);ctx.fillStyle=eraser?"#ffffff":$("paintColour").value;ctx.fill();event.preventDefault();});
canvas.addEventListener("pointermove",event=>{if(!drawing||!lastPoint)return;const p=pointFromEvent(event);ctx.beginPath();ctx.moveTo(lastPoint.x,lastPoint.y);ctx.lineTo(p.x,p.y);ctx.strokeStyle=eraser?"#ffffff":$("paintColour").value;ctx.lineWidth=Number($("brushSize").value);ctx.stroke();lastPoint=p;event.preventDefault();});
function stopDrawing(){drawing=false;lastPoint=null;}canvas.addEventListener("pointerup",stopDrawing);canvas.addEventListener("pointercancel",stopDrawing);canvas.addEventListener("lostpointercapture",stopDrawing);
$("brushSize").addEventListener("input",()=>{$("brushValue").textContent=$("brushSize").value+" px";});
$("eraserBtn").addEventListener("click",()=>{eraser=!eraser;$("eraserBtn").setAttribute("aria-pressed",String(eraser));$("eraserBtn").textContent=eraser?"Eraser on ✓":"Eraser";setFeedback($("artFeedback"),eraser?"Eraser selected. Draw over marks to erase them.":"Pen selected. Choose a colour and draw.");});
$("clearArt").addEventListener("click",()=>{ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);setFeedback($("artFeedback"),"Canvas cleared. Start a new picture!");});
$("saveArt").addEventListener("click",()=>{try{const link=document.createElement("a");link.download="sams-wonder-world-art.png";link.href=canvas.toDataURL("image/png");link.click();setFeedback($("artFeedback"),"Your picture was prepared as a PNG. Check your downloads. 🌟","good");}catch(error){setFeedback($("artFeedback"),"This browser could not save the picture. Try a different browser or device.","try");}});

renderWord();renderPair();renderStory();renderStage();
tabs.forEach(t=>t.setAttribute("aria-pressed",String(t.classList.contains("active"))));
})();