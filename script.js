let pdfDoc=null,currentPage=1,pages=[];
let activeLessonRun=0;
let topicPages=[],topicMiniPage=0;
const AI_API_URL = window.SAM_AI_API_URL || "/api/generate-lesson";
async function analyzeOnePage(page){
  const payload={action:"lesson-page",text:String(page.sourceText||"")};
  if(page.imageData)payload.image=page.imageData;
  let lastError=null;
  for(let attempt=0;attempt<2;attempt++){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),90000);
    try{
      const res=await fetch(AI_API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),signal:controller.signal});
      const data=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(data.error||("AI lesson service failed ("+res.status+")"));
      if(!data.lesson)throw new Error(data.error||"AI lesson response invalid");
      return data.lesson;
    }catch(err){
      lastError=err&&err.name==="AbortError"?new Error("AI request timed out after 90 seconds"):err;
      if(attempt===0&&err?.name!=="AbortError"&&!/quota|429|rate limit/i.test(lastError?.message||""))await new Promise(r=>setTimeout(r,1200));
      else break;
    }finally{clearTimeout(timeout);}
  }
  throw new Error("Page AI request failed: "+(lastError?.message||"network error"));
}
function renderTopicMini(){
  const box=$("topicMini");if(!box||!topicPages.length)return;
  const p=topicPages[topicMiniPage];
  $("topicMiniCount").textContent=(topicMiniPage+1)+" / "+topicPages.length;
  $("topicMiniTitle").textContent=p.title;
  $("topicMiniPoints").innerHTML=p.points.map(x=>"<li>"+esc(x)+"</li>").join("");
  $("topicMiniDiscovery").textContent=p.discovery;
  $("topicMiniMemory").textContent=p.memory;
  const v=$("topicMiniVisual");
  if(p.aiImage)v.innerHTML='<img class="topic-mini-img" src="'+p.aiImage+'" alt="'+esc(p.title)+'">';
  else v.innerHTML='<span>🎨</span><small>Illustration loading…</small>';
  box.classList.remove("hidden");
}
async function bufferTopicIllustrations(runId){
  const queue=topicPages.map((p,i)=>({p,i})).filter(x=>x.p.imagePrompt&&!x.p.aiImage);
  let next=0;
  const worker=async()=>{
    while(true){const job=queue[next++];if(!job)return;try{await generateAIImage(job.p);if(runId===activeLessonRun&&job.i===topicMiniPage)renderTopicMini();}catch(err){console.warn("TOPIC IMAGE",err);}}
  };
  await Promise.all([worker(),worker()]);
}
async function createTopicLesson(){
  const input=$("topicInput"),status=$("topicStatus"),topic=input.value.trim();
  if(!topic){input.focus();status.textContent="Please enter a topic.";return;}
  const runId=++activeLessonRun;
  status.textContent="Creating quick topic lesson…";
  $("topicBtn").disabled=true;
  try{
    const res=await fetch(AI_API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"topic-lesson",topic})});
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(data.error||("Topic lesson failed ("+res.status+")"));
    const lesson=data.lesson;
    if(!lesson||!Array.isArray(lesson.slides)||lesson.slides.length<5)throw new Error("The AI returned an incomplete lesson.");
    topicPages=lesson.slides.map((s,i)=>({title:String(s.title||("Lesson "+(i+1))).trim(),points:Array.isArray(s.keyIdeas)?s.keyIdeas.filter(Boolean).slice(0,3):[],discovery:String(s.discovery||""),memory:String(s.memory||""),imagePrompt:String(s.imagePrompt||""),aiImage:null}));
    topicMiniPage=0;renderTopicMini();
    status.textContent="Ready — "+topicPages.length+" quick topic cards.";
    if(runId===activeLessonRun)bufferTopicIllustrations(runId);
  }catch(err){status.textContent="Topic lesson error: "+(err&&err.message?err.message:"Unknown error");}
  finally{$("topicBtn").disabled=false;}
}
async function generateAIImage(page){
  if(page.aiImage)return page.aiImage;
  if(!page.imagePrompt)return null;
  if(page.imagePromise)return page.imagePromise;
  page.imagePromise=(async()=>{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),45000);
    try{
      const res=await fetch(AI_API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"image",prompt:"Create a clean child-friendly educational illustration for this school concept. Modern premium textbook style, clear composition, accurate content, soft cheerful colours, no paragraphs, no captions, no logos, no watermark, no decorative text. "+page.imagePrompt}),signal:controller.signal});
  const data=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(data.error||("AI illustration failed ("+res.status+")"));
      if(!data.image)throw new Error(data.error||"AI illustration response did not contain an image.");
      page.aiImage=data.image;return page.aiImage;
    }catch(err){
      if(err?.name==="AbortError")throw new Error("Illustration timed out after 45 seconds");
      throw err;
    }finally{clearTimeout(timeout);page.imagePromise=null;}
  })();
  return page.imagePromise;
}
function setNavigationBusy(busy){
  ["firstBtn","prevBtn","nextBtn","lastBtn","readBtn"].forEach(id=>{
    const b=$(id);if(b)b.disabled=busy;
  });
  document.body.classList.toggle("buffering-lesson",busy);
}
async function bufferAllIllustrations(runId){
  if(!pages.length)return;
  setNavigationBusy(true);
  const total=pages.filter(p=>p.imagePrompt).length;
  let completed=pages.filter(p=>p.aiImage).length;
  let next=0;
  const queue=pages.map((p,i)=>({p,i})).filter(x=>x.p.imagePrompt&&!x.p.aiImage);
  queue.sort((a,b)=>Math.abs(a.i-(currentPage-1))-Math.abs(b.i-(currentPage-1)));
  const worker=async()=>{
    while(true){
      const job=queue[next++];
      if(!job)return;
      try{
        await generateAIImage(job.p);
        completed++;
        if(runId===activeLessonRun){
          e.status.textContent="Preparing visual lesson… "+completed+" of "+total+" illustrations ready";
          if(job.i===currentPage-1)render();
        }
      }catch(err){
        console.warn("AI IMAGE BUFFER",err);
        completed++;
      }
    }
  };
  await Promise.all([worker(),worker(),worker()]);
  if(runId===activeLessonRun){
    setNavigationBusy(false);
    e.status.textContent="Visual lesson ready — all slides are buffered.";
    render();
  }
}
async function createAIVisualForCurrentPage(){
  const p=pages[currentPage-1];if(!p||p.aiImage||!p.imagePrompt)return;
  try{
    e.status.textContent="Creating illustration for page "+currentPage+"…";
    await generateAIImage(p);
    render();
  }catch(err){
    console.warn("AI IMAGE",err);
    e.status.textContent="Illustration unavailable: "+(err&&err.message?err.message:"Unknown error");
  }
}

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
  if(kind==="flower-diversity")return simpleCycle(["Colour","Fragrance","Petals","Arrangement"],"Flowers show diversity");
  if(kind==="complete-incomplete")return simpleCycle(["Calyx","Corolla","Androecium","Gynoecium"],"Complete flower has all four groups");
  if(kind==="unisexual-bisexual")return simpleCycle(["Male only","Female only","Both together"],"One or both reproductive parts");
  if(kind==="monoecious-dioecious")return simpleCycle(["Same plant","Male + female","Different plants"],"Where male and female flowers occur");
  if(kind==="pollinators")return simpleCycle(["Insects","Birds","Wind","Water"],"Agents that can help pollination");
  if(kind==="after-fertilization")return simpleCycle(["Zygote","Embryo","Ovule → seed","Ovary → fruit"],"What happens after fertilisation");
  if(kind==="fruit-types")return simpleCycle(["Simple","Aggregate","Multiple","Other types"],"Different ways fruits can form");
  if(kind==="whole-story")return simpleCycle(["Flower","Pollination","Fertilisation","Seed + fruit"],"The whole flowering story");
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
function chapter4Fallback(i){
  const c={
    3:{kind:"flower-diversity",name:"Flower Diversity",visualTitle:"Flowers can look different"},
    4:{kind:"flower-parts",name:"Main Parts of a Flower",visualTitle:"Each flower part has a job"},
    5:{kind:"flower-parts",name:"Stamen & Carpel",visualTitle:"Male and female reproductive parts"},
    6:{kind:"complete-incomplete",name:"Complete & Incomplete Flowers",visualTitle:"Which main parts are present?"},
    7:{kind:"unisexual-bisexual",name:"Unisexual & Bisexual Flowers",visualTitle:"One or both reproductive parts"},
    8:{kind:"monoecious-dioecious",name:"Monoecious & Dioecious Plants",visualTitle:"Where male and female flowers occur"},
    9:{kind:"pollination",name:"Pollination",visualTitle:"Anther → pollen → stigma"},
    10:{kind:"pollinators",name:"Pollinators",visualTitle:"Insects • birds • wind • water"},
    11:{kind:"fertilization",name:"Fertilisation",visualTitle:"Pollen tube → male gamete → egg"},
    12:{kind:"after-fertilization",name:"After Fertilisation",visualTitle:"Zygote → embryo • ovule → seed • ovary → fruit"},
    13:{kind:"fruit-types",name:"Kinds of Fruits",visualTitle:"Simple • aggregate • multiple • other types"},
    14:{kind:"whole-story",name:"The Whole Story",visualTitle:"Flower → pollination → fertilisation → seed → fruit"}
  };
  return c[i]||null;
}
function fallbackContent(kind){
  const data={
    "flower-diversity":{
      points:["Flowers can differ in colour, fragrance and number of petals.","Flowers may occur singly or as an inflorescence.","Inflorescence means many flowers arranged together."],
      discovery:"Flowers are not all alike. Their differences help us identify how they are arranged.",
      memory:"FLOWERS → COLOUR + FRAGRANCE + PETALS + ARRANGEMENT"
    },
    "flower-parts":{
      points:["Pedicel attaches the flower to the stem.","Thalamus supports the other flower parts; calyx protects the bud.","Corolla attracts visitors; androecium and gynoecium are reproductive parts."],
      discovery:"Different flower parts have different jobs — support, protection, attraction and reproduction.",
      memory:"SUPPORT → PROTECTION → ATTRACTION → REPRODUCTION"
    },
    "complete-incomplete":{
      points:["A complete flower has calyx, corolla, androecium and gynoecium.","An incomplete flower is missing one or more of these main parts.","The four groups help us describe the structure of a flower."],
      discovery:"Complete does not mean 'better' — it simply tells us that all four main groups are present.",
      memory:"COMPLETE = CALYX + COROLLA + ANDROECIUM + GYNOECIUM"
    },
    "unisexual-bisexual":{
      points:["A unisexual flower has only one reproductive part.","A bisexual flower has both androecium and gynoecium.","The words describe the reproductive parts present in the same flower."],
      discovery:"Look for the reproductive parts: one group means unisexual; both groups mean bisexual.",
      memory:"UNI = ONE • BI = TWO"
    },
    "monoecious-dioecious":{
      points:["Monoecious plants have male and female flowers on the same plant.","Dioecious plants have male flowers and female flowers on different plants.","These terms describe where the male and female flowers occur."],
      discovery:"Think about the plant, not one flower: same plant = monoecious; different plants = dioecious.",
      memory:"MONO = SAME PLANT • DI = DIFFERENT PLANTS"
    },
    "pollinators":{
      points:["Pollinators or agents help transfer pollen during pollination.","Insects and birds can carry pollen from one flower to another.","Wind and water can also help pollination."],
      discovery:"Pollen does not have to move by itself. Living and non-living agents can help it travel.",
      memory:"POLLINATORS → INSECTS • BIRDS • WIND • WATER"
    },
    "after-fertilization":{
      points:["The zygote develops into an embryo.","The ovule develops into a seed.","The ovary develops into the fruit."],
      discovery:"After fertilisation, three important changes connect the flower to the next generation.",
      memory:"ZYGOTE → EMBRYO • OVULE → SEED • OVARY → FRUIT"
    },
    "fruit-types":{
      points:["Simple fruit develops from one flower with one ovary.","Aggregate fruit develops from one flower with multiple ovaries.","Multiple fruit develops from an inflorescence; the chapter also includes seedless and pseudo fruits."],
      discovery:"Fruit types can be classified by how the flower or group of flowers contributes to the fruit.",
      memory:"SIMPLE • AGGREGATE • MULTIPLE • SEEDLESS • PSEUDO"
    },
    "whole-story":{
      points:["A flower contains parts involved in reproduction.","Pollination moves pollen to the stigma; fertilisation forms a zygote.","After fertilisation, ovules become seeds and the ovary can become fruit."],
      discovery:"The chapter is one connected journey from flower to the next generation.",
      memory:"FLOWER → POLLINATION → FERTILISATION → SEED + FRUIT"
    }
  };
  return data[kind]||null;
}
function slide(i,text){
  let info=conceptInfo(text);
  let fallback=null;
  if(info.kind==="general") fallback=chapter4Fallback(i);
  if(fallback) info=fallback;
  const fc=fallbackContent(info.kind);
  const p=fc?fc.points:keyIdeas(text,info);
  const title=info.kind==="general"?(cleanText(text).split(/[.!?]/)[0]||("Lesson page "+i)).slice(0,75):info.name;
  return{title,info,diagram:diagramFor(info.kind),points:p,discovery:fc?fc.discovery:discoveryFor(info),memory:fc?fc.memory:memoryFor(info)};
}
function render(){
  const s=pages[currentPage-1];if(!s)return;
  e.title.textContent=s.title;
  if(s.aiImage)e.visual.innerHTML='<img class="ai-visual" src="'+s.aiImage+'" alt="'+esc(s.title)+'">';
  else e.visual.innerHTML='<div class="ai-placeholder">🎨 Creating an illustration specifically for this page…</div>';
  e.flow.textContent=s.info.visualTitle||"";
  e.points.innerHTML=s.points.map(p=>"<li>"+esc(p)+"</li>").join("");
  e.discovery.textContent=s.discovery;e.memory.textContent=s.memory;
  e.counter.textContent=currentPage+" / "+pages.length;e.pageCount.textContent="Page "+currentPage+" of "+pages.length;
  e.progress.style.width=(currentPage/pages.length*100)+"%";if(s.imagePrompt&&!s.aiImage&&!document.body.classList.contains("buffering-lesson"))createAIVisualForCurrentPage();
}
async function fileToDataUrl(file){
  // Downscale camera/gallery photos before sending them to AI. Full-resolution
  // phone photos can be several MB each and can lock up the browser/UI.
  const raw=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
  return resizeImageDataUrl(raw,1200,0.62);
}
async function resizeImageDataUrl(dataUrl,maxSide=1200,quality=0.62){
  return await new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const scale=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight));
      const canvas=document.createElement("canvas");
      canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
      const ctx=canvas.getContext("2d");ctx.drawImage(img,0,0,canvas.width,canvas.height);
      resolve(canvas.toDataURL("image/jpeg",quality));
    };
    img.onerror=()=>resolve(dataUrl);img.src=dataUrl;
  });
}
async function analyzePages(items,runId){
  const results=new Array(items.length);
  let next=0,done=0,failed=null;
  const worker=async()=>{
    while(true){
      if(failed)return;
      const i=next++;
      if(i>=items.length)return;
      const item=items[i];
      if(runId===activeLessonRun)e.status.textContent="Understanding pages… "+done+" of "+items.length+" complete";
      try{
        const lesson=await analyzeOnePage(item);
        const aiTitle=String(lesson.title||"").trim();
        const aiPoints=Array.isArray(lesson.keyIdeas)?lesson.keyIdeas.filter(Boolean).map(x=>String(x).trim()).filter(Boolean):[];
        const aiDiscovery=String(lesson.discovery||"").trim();
        const aiMemory=String(lesson.memory||"").trim();
        const aiPrompt=String(lesson.imagePrompt||"").trim();
        if(!aiTitle||aiPoints.length<2||!aiDiscovery||!aiMemory||!aiPrompt) throw new Error("AI returned incomplete content for page "+(i+1));
        // Do NOT retain the uploaded PDF/photo base64 in the slideshow. Keeping dozens of
        // full-page images in memory was making the page look frozen and unresponsive.
        results[i]={title:aiTitle,info:{kind:"ai",name:aiTitle,visualTitle:aiTitle},diagram:"",points:aiPoints,discovery:aiDiscovery,memory:aiMemory,imagePrompt:aiPrompt,aiLesson:true};
        done++;
        if(runId===activeLessonRun)e.status.textContent="Understanding pages… "+done+" of "+items.length+" complete";
      }catch(err){
        failed=new Error("Page "+(i+1)+": "+(err&&err.message?err.message:"AI processing failed"));
        return;
      }
    }
  };
  // Three pages/photos can be understood at the same time.
  await Promise.all([worker(),worker(),worker()]);
  if(failed)throw failed;
  if(runId===activeLessonRun){
    pages=results;
    currentPage=1;
    e.lesson.classList.remove("hidden");
    render();
    e.status.textContent="Lesson understood. Preparing all visuals…";
    bufferAllIllustrations(runId);
  }
  return results;
}
async function readPdf(file){
  if(!window.pdfjsLib){e.status.textContent="The PDF reader is still loading. Please try again.";return;}
  try{
    e.status.textContent="Reading your PDF…";const b=await file.arrayBuffer();
    pdfDoc=await window.pdfjsLib.getDocument(new Uint8Array(b)).promise;const items=[];
    for(let i=1;i<=pdfDoc.numPages;i++){
      e.status.textContent="Reading page "+i+" of "+pdfDoc.numPages+"…";
      const p=await pdfDoc.getPage(i),tc=await p.getTextContent(),text=tc.items.map(x=>x.str).join(" ");
      const base=p.getViewport({scale:1.0});
      const scale=Math.min(1,900/Math.max(base.width,base.height));
      const vp=p.getViewport({scale}),canvas=document.createElement("canvas"),ctx=canvas.getContext("2d");
      canvas.width=vp.width;canvas.height=vp.height;await p.render({canvasContext:ctx,viewport:vp}).promise;
      const imageData=canvas.toDataURL("image/jpeg",0.38);
      items.push({sourceText:text,imageData});
    }
    const runId=++activeLessonRun;await analyzePages(items,runId);
    if(runId===activeLessonRun)e.status.textContent="Done — AI understood the PDF. Illustrations can continue in the background.";
  }catch(err){e.status.textContent="AI/PDF error: "+(err&&err.message?err.message:"Unknown error");console.error("PDF ERROR",err);}
}
async function readImages(files){
  try{
    const items=[];
    for(const file of files){
      e.status.textContent="Reading photo "+(items.length+1)+" of "+files.length+"…";
      items.push({sourceText:"",imageData:await fileToDataUrl(file),sourceName:file.name});
    }
    const runId=++activeLessonRun;await analyzePages(items,runId);
    if(runId===activeLessonRun)e.status.textContent="Done — photos understood. Illustrations can continue in the background.";
  }catch(err){e.status.textContent="AI/image error: "+(err&&err.message?err.message:"Unknown error");console.error("IMAGE ERROR",err);}
}

e.drop.addEventListener("click",()=>e.input.click());
e.drop.addEventListener("keydown",x=>{if(x.key==="Enter"||x.key===" "){x.preventDefault();e.input.click();}});
function chooseFiles(files){
  const list=Array.from(files||[]);if(!list.length)return;
  const hasPdf=list.some(f=>f.type==="application/pdf");
  if(hasPdf&&list.length>1){e.status.textContent="Please choose one PDF, or choose multiple photos.";return;}
  e.info.textContent=list.length===1?"📄 "+list[0].name:"🖼️ "+list.length+" photos selected";
  e.info.classList.remove("hidden");e.create.classList.remove("hidden");
  e.create.onclick=()=>hasPdf?readPdf(list[0]):readImages(list);
}
e.input.addEventListener("change",x=>chooseFiles(x.target.files));
let cameraPages=[];
$("galleryBtn").onclick=()=>e.input.click();
$("cameraBtn").onclick=()=>$("cameraInput").click();
$("cameraInput").addEventListener("change",async x=>{
  const file=x.target.files[0];if(!file)return;
  try{
    cameraPages.push({sourceText:"",imageData:await fileToDataUrl(file),sourceName:file.name});
    e.info.textContent="📷 "+cameraPages.length+" camera photo"+(cameraPages.length===1?"":"s")+" added";
    e.info.classList.remove("hidden");e.create.classList.remove("hidden");
    e.status.textContent="Photo added. Take another photo or tap Create Visual Lesson.";
    e.create.onclick=async()=>{if(!cameraPages.length)return;const runId=++activeLessonRun;await analyzePages(cameraPages,runId);if(runId===activeLessonRun)e.status.textContent="Done — camera photos understood. Illustrations can continue in the background.";};
    x.target.value="";
  }catch(err){e.status.textContent="Camera error: "+(err&&err.message?err.message:"Unknown error");}
});

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
function renderSimulation(text,steps){
  const box=$("simulation");
  let html='<div class="sim-title">✨ '+esc(text)+'</div><div class="sim-steps">';
  steps.forEach((x,i)=>{
    const emoji=x.emoji||"💡";const label=x.label||x.title||"Step "+(i+1);
    html+='<div class="sim-step" style="animation-delay:'+(i*120)+'ms"><span class="emoji">'+esc(emoji)+"</span>"+esc(label)+"</div>";
    if(i<steps.length-1)html+='<span class="arrow">→</span>';
  });
  html+="</div>";box.innerHTML=html;box.classList.remove("hidden");box.scrollIntoView({behavior:"smooth",block:"nearest"});
}

function getLocalSimulation(text){
  const t=text.toLowerCase().replace(/\s+/g," ").trim();
  const has=x=>t.includes(x);

  if(has("ruth") && (has("ruth chapter 1") || /^ruth\s+1$/.test(t))) return [
    {emoji:"👩",label:"Naomi loses her husband and sons"},
    {emoji:"🏠",label:"Naomi decides to return home"},
    {emoji:"👭",label:"Ruth chooses to stay with Naomi"},
    {emoji:"🛤️",label:"They travel to Bethlehem"},
    {emoji:"🌾",label:"They arrive at barley harvest"}
  ];
  if(has("ruth") && (has("ruth chapter 2") || /^ruth\s+2$/.test(t))) return [
    {emoji:"🌾",label:"Ruth gleans in Boaz's field"},
    {emoji:"👀",label:"Boaz notices Ruth"},
    {emoji:"🤝",label:"Boaz protects and welcomes Ruth"},
    {emoji:"🍞",label:"Ruth eats with Boaz's workers"},
    {emoji:"🏠",label:"Ruth tells Naomi about Boaz"}
  ];
  if(has("ruth") && (has("ruth chapter 3") || /^ruth\s+3$/.test(t))) return [
    {emoji:"🌙",label:"Naomi gives Ruth a plan"},
    {emoji:"🌾",label:"Ruth goes to Boaz at night"},
    {emoji:"🧎",label:"Ruth asks Boaz to help"},
    {emoji:"🤝",label:"Boaz agrees to act as redeemer"},
    {emoji:"🌅",label:"Ruth returns safely to Naomi"}
  ];
  if(has("ruth") && (has("ruth chapter 4") || /^ruth\s+4$/.test(t))) return [
    {emoji:"⚖️",label:"Boaz meets the nearer relative"},
    {emoji:"🤝",label:"Boaz receives the right to redeem"},
    {emoji:"💍",label:"Boaz marries Ruth"},
    {emoji:"👶",label:"Ruth and Boaz have a son"},
    {emoji:"🌳",label:"Their family joins David's line"}
  ];

  if(/equivalent fraction|fraction|fractions/.test(t)) return [
    {emoji:"🍫",label:"Start with the fraction"},
    {emoji:"✖️",label:"Multiply top and bottom"},
    {emoji:"🔢",label:"Keep the value equal"},
    {emoji:"✨",label:"Get an equivalent fraction"}
  ];
  if(has("water cycle")) return [
    {emoji:"☀️",label:"Sun heats the water"},
    {emoji:"💨",label:"Water evaporates"},
    {emoji:"☁️",label:"Water vapour condenses"},
    {emoji:"🌧️",label:"Rain falls"},
    {emoji:"🌊",label:"Water collects"}
  ];
  if(has("butterfly")) return [
    {emoji:"🥚",label:"Egg is laid"},
    {emoji:"🐛",label:"Caterpillar grows"},
    {emoji:"🟢",label:"Pupa forms"},
    {emoji:"🦋",label:"Adult butterfly emerges"}
  ];
  if(has("pollination")) return [
    {emoji:"🌼",label:"Anther contains pollen"},
    {emoji:"🐝",label:"Pollen is carried"},
    {emoji:"🌸",label:"Pollen reaches stigma"},
    {emoji:"🌱",label:"Reproduction can continue"}
  ];
  return null;
}

async function simulate(){
  const input=$("simInput"),box=$("simulation"),text=input.value.trim();
  if(!text){input.focus();box.innerHTML='<div class="sim-title">💡 Type any concept first.</div>';box.classList.remove("hidden");return;}

  // Known visual lessons are rendered directly in the browser.
  // This makes Bible/science examples reliable even if the AI API is busy,
  // unavailable, or an old server deployment is still being served.
  const localSteps=getLocalSimulation(text);
  if(localSteps){
    renderSimulation(text,localSteps);
    return;
  }

  box.innerHTML='<div class="sim-title">🤖 AI is building a simulation…</div>';box.classList.remove("hidden");
  try{
    const res=await fetch(AI_API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"simulate",text})});
    const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||("Simulation failed ("+res.status+")"));
    const steps=Array.isArray(data.steps)?data.steps:[];if(!steps.length)throw new Error("AI returned no simulation steps.");
    renderSimulation(text,steps);
  }catch(err){
    console.warn("SIMULATION",err);box.innerHTML='<div class="sim-title">⚠️ '+esc(err&&err.message?err.message:"Simulation unavailable")+'</div>';
  }
}

document.querySelectorAll(".examples button").forEach(b=>b.onclick=()=>{$("simInput").value=b.dataset.example;simulate()});
$("simulateBtn").onclick=simulate;
$("topicBtn").onclick=createTopicLesson;
$("topicMiniPrev").onclick=()=>{if(topicMiniPage>0){topicMiniPage--;renderTopicMini();}};
$("topicMiniNext").onclick=()=>{if(topicMiniPage<topicPages.length-1){topicMiniPage++;renderTopicMini();}};

let logosBook="ruth",logosChapter=1;

function logosDeepData(){ return window.LOGOS_DEEP_2026||null; }

function validateLogosData(){
  const data=logosDeepData();
  if(!data)return {ok:false,books:0,chapters:0,points:0};
  let books=0,chapters=0,points=0;
  for(const book of Object.values(data)){
    books++;
    for(const ch of Object.values(book.chapters||{})){
      chapters++;
      if(!Array.isArray(ch.facts)||ch.facts.length!==10)return {ok:false,books,chapters,points};
      if(ch.facts.some(x=>typeof x!=="string"||!x.trim()))return {ok:false,books,chapters,points};
      points+=ch.facts.length;
    }
  }
  return {ok:books===5&&chapters===35&&points===350,books,chapters,points};
}

function renderLogosBooks(){
  const box=$("logosBooks");if(!box)return;
  const data=logosDeepData();
  if(!data){box.innerHTML='<p class="logos-empty">Logos study data could not be loaded.</p>';return;}
  box.innerHTML="";
  Object.entries(data).forEach(([key,book])=>{
    const group=document.createElement("div");group.className="logos-book";
    const title=document.createElement("button");title.className="logos-book-title";
    title.innerHTML=esc(book.label)+" <span>"+book.range[0]+"–"+book.range[1]+"</span>";
    title.onclick=()=>{logosBook=key;renderLogosBooks();renderLogosChapter();};
    group.appendChild(title);
    const nums=document.createElement("div");nums.className="logos-chapters";
    for(let n=book.range[0];n<=book.range[1];n++){
      const b=document.createElement("button");
      b.className="logos-chapter-btn"+(key===logosBook&&n===logosChapter?" active":"");
      b.textContent=n;b.title=book.label+" Chapter "+n;
      b.onclick=()=>{logosBook=key;logosChapter=n;renderLogosBooks();renderLogosChapter();};
      nums.appendChild(b);
    }
    group.appendChild(nums);box.appendChild(group);
  });
}

function renderLogosChapter(){
  const box=$("logosChapterView");if(!box)return;
  const data=logosDeepData(),book=data?.[logosBook],ch=book?.chapters?.[logosChapter];
  if(!book||!ch||!Array.isArray(ch.facts)||ch.facts.length!==10){
    box.innerHTML='<p class="logos-empty">This chapter does not have the required 10 study points.</p>';return;
  }
  box.innerHTML='<div class="logos-chapter-head"><div><span>'+esc(book.label)+'</span><h3>Chapter '+logosChapter+': '+esc(ch.title)+'</h3><small class="logos-point-count">10 Study Points</small></div><button id="logosQuizBtn" class="logos-quiz-btn">📝 Chapter Quiz</button></div>'+
    '<div class="logos-events">'+ch.facts.map((x,i)=>'<div class="logos-event"><b>'+(i+1)+'</b><span>'+esc(x)+'</span></div>').join("")+'</div>'+
    '<div class="logos-memory"><strong>🧠 Remember</strong><p>Learn these 10 points, then take the 10-question chapter quiz.</p></div>';
  $("logosQuizBtn").onclick=()=>{window.location.href="quiz.html?book="+encodeURIComponent(logosBook)+"&chapter="+logosChapter;};
}

(function bootLogosStudy(){
  const finish=()=>{
    const check=validateLogosData();
    renderLogosBooks();renderLogosChapter();
    if(!check.ok)console.error("LOGOS DATA VALIDATION FAILED",check);
  };
  if(window.LOGOS_DEEP_2026)finish();
  else{
    const s=document.createElement("script");
    s.src="./logos-data.js?v=20260924-103&fresh="+Date.now();
    s.onload=finish;s.onerror=finish;document.head.appendChild(s);
  }
})();