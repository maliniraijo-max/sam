let pdfDoc=null,currentPage=1,pages=[];
const $=id=>document.getElementById(id);
const e={input:$("pdfInput"),drop:$("dropzone"),info:$("fileInfo"),create:$("createLesson"),status:$("status"),lesson:$("lessonSection"),title:$("slideTitle"),visual:$("visual"),flow:$("flow"),points:$("keyPoints"),discovery:$("discoveryText"),memory:$("memoryText"),progress:$("progress"),pageCount:$("pageCount"),counter:$("counter")};

function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function cleanText(text){
  return String(text||"").replace(/\s+/g," ").replace(/\b(STORY TIME|SAM'S DISCOVERY|KEY IDEAS|REMEMBER IT!?|PAGE \d+|CHAPTER \d+)\b/gi," ").replace(/\s+/g," ").trim();
}
function sentences(text){
  const t=cleanText(text);
  return t.split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(x=>x.length>18);
}
function conceptInfo(text){
  const t=cleanText(text).toLowerCase();
  if(/stamen|carpel|anther|filament|stigma|style|ovary/.test(t)) return {kind:"flower-parts",name:"Stamen & Carpel",visualTitle:"Parts of a Flower"};
  if(/pollinat/.test(t)) return {kind:"pollination",name:"Pollination",visualTitle:"How pollen moves"};
  if(/fertil/.test(t) && /flower|ovule|pollen/.test(t)) return {kind:"fertilization",name:"Fertilization",visualTitle:"From pollen to seed"};
  if(/fruit|ovary.*fruit|fruit.*ovary/.test(t)) return {kind:"fruit",name:"Fruit formation",visualTitle:"Flower becomes fruit"};
  if(/seed dispers|dispersal/.test(t)) return {kind:"seed-dispersal",name:"Seed dispersal",visualTitle:"How seeds travel"};
  if(/germinat|sprout|seedling/.test(t)) return {kind:"germination",name:"Seed germination",visualTitle:"Seed begins to grow"};
  if(/water cycle|evaporation|condensation|rainfall/.test(t)) return {kind:"water-cycle",name:"Water Cycle",visualTitle:"The water cycle"};
  if(/butterfly|caterpillar|pupa/.test(t)) return {kind:"butterfly",name:"Butterfly Life Cycle",visualTitle:"Butterfly life cycle"};
  if(/frog|tadpole/.test(t)) return {kind:"frog",name:"Frog Life Cycle",visualTitle:"Frog life cycle"};
  if(/food chain|producer|consumer|predator/.test(t)) return {kind:"food-chain",name:"Food Chain",visualTitle:"Who eats whom?"};
  if(/earth|planet|orbit|sun/.test(t)) return {kind:"earth-sun",name:"Earth & Sun",visualTitle:"Earth moves around the Sun"};
  if(/volcano|eruption|lava/.test(t)) return {kind:"volcano",name:"Volcano",visualTitle:"Inside a volcano"};
  if(/tree|forest|sapling/.test(t)) return {kind:"tree",name:"Tree growth",visualTitle:"From seed to tree"};
  return {kind:"general",name:"Lesson idea",visualTitle:"Let's understand it"};
}
function svgWrap(title,body){
  const defs='<defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="arrow-head"/></marker></defs>';
  return '<div class="diagram-title">'+esc(title)+'</div><svg class="science-svg" viewBox="0 0 700 390" role="img" aria-label="'+esc(title)+'">'+defs+body+'</svg>';
}
const txt=(x,y,s,cls="label")=>'<text x="'+x+'" y="'+y+'" class="'+cls+'">'+esc(s)+'</text>';
const line=(x1,y1,x2,y2,cls="line")=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" class="'+cls+'"/>';
const circle=(cx,cy,r,cls="shape")=>'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" class="'+cls+'"/>';
const arrow=(x1,y1,x2,y2)=>line(x1,y1,x2,y2,"arrow-line");

function flowerSvg(){
  let b='';
  b+='<defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="arrow-head"/></marker></defs>';
  b+='<path d="M345 325 C345 260 345 215 350 160" class="stem"/>';
  b+='<ellipse cx="300" cy="275" rx="62" ry="25" class="leaf" transform="rotate(-25 300 275)"/><ellipse cx="400" cy="250" rx="62" ry="25" class="leaf" transform="rotate(25 400 250)"/>';
  b+='<ellipse cx="350" cy="105" rx="55" ry="78" class="petal"/><ellipse cx="275" cy="150" rx="55" ry="78" class="petal" transform="rotate(-58 275 150)"/><ellipse cx="425" cy="150" rx="55" ry="78" class="petal" transform="rotate(58 425 150)"/><ellipse cx="350" cy="170" rx="50" ry="70" class="petal"/>';
  b+='<path d="M350 105 C338 135 340 170 350 205 C360 170 362 135 350 105Z" class="carpel"/><circle cx="350" cy="100" r="12" class="stigma"/>';
  b+='<line x1="300" y1="115" x2="285" y2="80" class="filament"/><circle cx="282" cy="75" r="10" class="anther"/>';
  b+='<line x1="325" y1="105" x2="315" y2="68" class="filament"/><circle cx="312" cy="63" r="10" class="anther"/>';
  b+='<line x1="400" y1="115" x2="415" y2="80" class="filament"/><circle cx="418" cy="75" r="10" class="anther"/>';
  b+=arrow(180,70,270,76)+txt(70,65,"Anther","callout")+txt(70,88,"makes pollen","small-label");
  b+=arrow(180,130,275,118)+txt(55,130,"Filament","callout");
  b+=arrow(520,75,365,100)+txt(525,70,"Stigma","callout");
  b+=arrow(535,145,375,150)+txt(540,140,"Style","callout");
  b+=arrow(535,215,365,205)+txt(540,210,"Ovary","callout");
  b+=txt(245,365,"STAMEN = male part","tag")+txt(410,365,"CARPEL = female part","tag");
  return svgWrap("Parts of a Flower",b);
}
function simpleCycle(items,title){
  const xs=[85,220,355,490,625],n=items.length;
  let b="";
  items.forEach((it,i)=>{const x=xs[Math.min(i,4)];b+=circle(x,170,48,"cycle-circle")+txt(x,178,it,"cycle-label");if(i<n-1)b+=arrow(x+50,170,xs[i+1]-50,170);});
  b+=txt(350,70,title,"diagram-heading");
  return svgWrap(title,b);
}
function diagramFor(kind){
  if(kind==="flower-parts")return flowerSvg();
  if(kind==="pollination")return simpleCycle(["Anther","Pollen","Pollinator","Stigma"],"Pollen moves from anther to stigma");
  if(kind==="fertilization")return simpleCycle(["Pollen","Pollen tube","Ovule","Seed"],"Fertilization happens inside the flower");
  if(kind==="fruit")return simpleCycle(["Flower","Ovary","Growing fruit","Fruit"],"The ovary develops into the fruit");
  if(kind==="seed-dispersal")return simpleCycle(["Seed","Wind","Water","New place"],"Seeds travel to new places");
  if(kind==="germination")return simpleCycle(["Seed","Root","Shoot","Seedling","Plant"],"A seed starts a new plant");
  if(kind==="water-cycle")return simpleCycle(["Evaporation","Clouds","Rain","Collection"],"Water keeps moving in a cycle");
  if(kind==="butterfly")return simpleCycle(["Egg","Caterpillar","Pupa","Butterfly"],"Four stages of a butterfly");
  if(kind==="frog")return simpleCycle(["Eggs","Tadpole","Young frog","Adult frog"],"Stages of a frog");
  if(kind==="food-chain")return simpleCycle(["Plant","Insect","Frog","Snake","Eagle"],"Energy moves along the food chain");
  if(kind==="earth-sun")return simpleCycle(["Sun","Earth","Orbit","Year"],"Earth travels around the Sun");
  if(kind==="volcano")return simpleCycle(["Heat","Magma","Pressure","Eruption"],"A volcano can erupt when pressure builds");
  if(kind==="tree")return simpleCycle(["Seed","Sprout","Sapling","Tree","Fruit"],"A tree grows step by step");
  return simpleCycle(["Read","Look","Connect","Explain"],"See the idea step by step");
}
function keyIdeas(text,info){
  const s=sentences(text).filter(x=>!/^sam\b|^basic science\b|^chapter\b/i.test(x));
  if(info.kind==="flower-parts")return["Stamen is the male reproductive part of a flower.","The anther makes pollen; the filament supports the anther.","Carpel is the female reproductive part: stigma, style and ovary."];
  if(info.kind==="pollination")return["Pollination is the transfer of pollen from anther to stigma.","Wind, insects and other agents can carry pollen."];
  if(info.kind==="fertilization")return["A pollen grain reaches the stigma and grows a pollen tube.","The male cell joins the female cell in the ovule."];
  if(info.kind==="fruit")return["After fertilization, the ovary can develop into a fruit.","The ovules inside can develop into seeds."];
  if(info.kind==="germination")return["A seed needs suitable conditions such as water, air and warmth.","The root grows down and the shoot grows upward."];
  return s.slice(0,3).map(x=>x.length>145?x.slice(0,142)+"…":x);
}
function discoveryFor(info){
  const d={"flower-parts":"A flower has two important reproductive parts: stamen and carpel.","pollination":"Pollen must reach the stigma before fertilization can begin.","fertilization":"The ovule is where the male and female cells join.","fruit":"The flower does not simply disappear — its ovary can become the fruit.","germination":"The tiny seed contains a baby plant ready to begin growing.","seed-dispersal":"Moving away from the parent plant gives seeds space to grow.","water-cycle":"The same water keeps moving between Earth and the atmosphere.","butterfly":"The caterpillar and butterfly look different, but they are stages of one life cycle.","frog":"A tadpole changes its body as it develops into an adult frog.","food-chain":"Plants start the chain by making food using sunlight.","earth-sun":"Earth's movement around the Sun gives us a year.","volcano":"Heat and pressure inside Earth can lead to a volcanic eruption.","tree":"A tree changes through stages as it grows."};
  return d[info.kind]||"Look at the diagram and explain the idea in your own words.";
}
function memoryFor(info){
  const m={"flower-parts":"STAMEN → pollen.  CARPEL → stigma + style + ovary.","pollination":"POLLEN: ANTHER → STIGMA","fertilization":"POLLEN → OVULE → SEED","fruit":"OVARY → FRUIT   •   OVULE → SEED","germination":"WATER + AIR + WARMTH → GROWING SEED","seed-dispersal":"SEEDS TRAVEL → NEW PLACES → NEW PLANTS","water-cycle":"EVAPORATION → CONDENSATION → RAINFALL → COLLECTION","butterfly":"EGG → CATERPILLAR → PUPA → BUTTERFLY","frog":"EGG → TADPOLE → YOUNG FROG → ADULT","food-chain":"PLANT → HERBIVORE → CARNIVORE","earth-sun":"EARTH → ORBITS SUN → ONE YEAR","volcano":"MAGMA + PRESSURE → ERUPTION","tree":"SEED → SPROUT → SAPLING → TREE"};
  return m[info.kind]||"LOOK → UNDERSTAND → EXPLAIN";
}
function slide(i,text){
  const info=conceptInfo(text),p=keyIdeas(text,info);
  const title=info.kind==="general"?(cleanText(text).split(/[.!?]/)[0]||("Lesson page "+i)).slice(0,75):info.name;
  return{title,info,diagram:diagramFor(info.kind),points:p,discovery:discoveryFor(info),memory:memoryFor(info)};
}
function render(){
  const s=pages[currentPage-1];if(!s)return;
  e.title.textContent=s.title;e.visual.innerHTML=s.diagram;e.flow.textContent=s.info.visualTitle;
  e.points.innerHTML=s.points.map(p=>"<li>"+esc(p)+"</li>").join("");
  e.discovery.textContent=s.discovery;e.memory.textContent=s.memory;
  e.counter.textContent=currentPage+" / "+pages.length;e.pageCount.textContent="Page "+currentPage+" of "+pages.length;
  e.progress.style.width=(currentPage/pages.length*100)+"%";
}
async function readPdf(file){
  if(!window.pdfjsLib){e.status.textContent="The PDF reader is still loading. Please try again.";return;}
  try{
    e.status.textContent="Reading your PDF…";const b=await file.arrayBuffer();
    pdfDoc=await window.pdfjsLib.getDocument(new Uint8Array(b)).promise;pages=[];
    for(let i=1;i<=pdfDoc.numPages;i++){
      e.status.textContent="Reading page "+i+" of "+pdfDoc.numPages+"…";
      const p=await pdfDoc.getPage(i),tc=await p.getTextContent(),text=tc.items.map(x=>x.str).join(" ");
      pages.push(slide(i,text));
    }
    currentPage=1;render();e.lesson.classList.remove("hidden");
    e.status.textContent="Done — "+pages.length+" visual slides are ready.";
  }catch(err){e.status.textContent="PDF error: "+(err&&err.message?err.message:"Unknown error")+". Please try again.";console.error("PDF ERROR",err);}
}
e.drop.addEventListener("click",()=>e.input.click());
e.drop.addEventListener("keydown",x=>{if(x.key==="Enter"||x.key===" "){x.preventDefault();e.input.click();}});
e.input.addEventListener("change",x=>{const f=x.target.files[0];if(!f)return;if(f.type!=="application/pdf"){e.status.textContent="Please choose a PDF file.";return}e.info.textContent="📄 "+f.name;e.info.classList.remove("hidden");e.create.classList.remove("hidden");e.create.onclick=()=>readPdf(f);});
["dragenter","dragover"].forEach(ev=>e.drop.addEventListener(ev,x=>{x.preventDefault();e.drop.classList.add("drag")}));
["dragleave","drop"].forEach(ev=>e.drop.addEventListener(ev,x=>{x.preventDefault();e.drop.classList.remove("drag")}));
e.drop.addEventListener("drop",x=>{const f=x.dataTransfer.files[0];if(f){e.input.files=x.dataTransfer.files;e.input.dispatchEvent(new Event("change"));}});
$("prevBtn").onclick=()=>{if(currentPage>1){currentPage--;render()}};$("nextBtn").onclick=()=>{if(currentPage<pages.length){currentPage++;render()}};
$("firstBtn").onclick=()=>{currentPage=1;render()};$("lastBtn").onclick=()=>{currentPage=pages.length;render()};
$("focusBtn").onclick=()=>{document.body.classList.toggle("focus-mode");$("focusBtn").textContent=document.body.classList.contains("focus-mode")?"↩ Exit Focus":"🎯 Focus Mode"};
$("readBtn").onclick=()=>{if("speechSynthesis"in window){speechSynthesis.cancel();const s=pages[currentPage-1];speechSynthesis.speak(new SpeechSynthesisUtterance(s.title+". "+s.points.join(". ")));}};
document.addEventListener("keydown",x=>{if(x.key==="ArrowRight")$("nextBtn").click();if(x.key==="ArrowLeft")$("prevBtn").click()});
function simSteps(t){
  t=t.toLowerCase();
  if(t.includes("seed")||t.includes("plant"))return["🌰 Seed","💧 Water","🌱 Sprout","🌿 Young plant","🌳 Growing plant"];
  if(t.includes("tree")||t.includes("forest"))return["🌱 Seed","🌿 Sapling","🌳 Young tree","🌳 Tall tree","🍎 Tree gives fruit"];
  if(t.includes("frog"))return["🥚 Eggs","🐸 Tadpole","🦵 Young frog","🐸 Adult frog"];
  if(t.includes("human")||t.includes("baby"))return["👶 Baby","🧒 Child","🧑 Teenager","👩 Adult"];
  if(t.includes("water cycle"))return["☀️ Evaporation","☁️ Condensation","🌧️ Rainfall","🌊 Collection"];
  if(t.includes("butterfly"))return["🥚 Egg","🐛 Caterpillar","🟢 Pupa","🦋 Butterfly"];
  if(t.includes("earth")&&t.includes("sun"))return["☀️ Sun","🌍 Earth","🔄 Orbit","🌌 Space"];
  if(t.includes("food chain"))return["🌱 Plant","🐛 Insect","🐸 Frog","🐍 Snake","🦅 Eagle"];
  if(t.includes("volcano"))return["🌋 Volcano","🔥 Heat","💨 Eruption","🌋 Lava"];
  return["💭 Idea","🔎 Explore","🧩 Connect","💡 Understand"];
}
function simulate(){
  const text=$("simInput").value.trim();if(!text)return;const a=simSteps(text);
  let html='<div class="sim-title">✨ '+esc(text)+'</div><div class="sim-steps">';
  a.forEach((x,i)=>{const z=x.split(" "),emoji=z.shift();html+='<div class="sim-step" style="animation-delay:'+(i*90)+'ms"><span class="emoji">'+emoji+"</span>"+esc(z.join(" "))+"</div>";if(i<a.length-1)html+='<span class="arrow">→</span>';});
  html+="</div>";$("simulation").innerHTML=html;$("simulation").classList.remove("hidden");
}
document.querySelectorAll(".examples button").forEach(b=>b.onclick=()=>{$("simInput").value=b.dataset.example;simulate()});
$("simulateBtn").onclick=simulate;