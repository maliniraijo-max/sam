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

const LOGOS_LOCAL_SIMULATIONS={"ruth_1":{"book":"Ruth","chapter":1,"title":"Naomi and Ruth return to Bethlehem","facts":["A famine occurs in Bethlehem.","Elimelech takes Naomi and their two sons to Moab.","Elimelech dies in Moab.","Naomi's sons marry Ruth and Orpah.","Both of Naomi's sons die.","Naomi hears that the Lord has provided food for his people in Bethlehem.","Orpah returns to her people after Naomi urges her to go.","Ruth chooses to remain with Naomi.","Ruth pledges to Naomi and to Naomi's God.","Naomi and Ruth arrive in Bethlehem at the beginning of the barley harvest."]},"ruth_2":{"book":"Ruth","chapter":2,"title":"Ruth meets Boaz","facts":["Ruth goes to glean in the fields.","The field belongs to Boaz, a relative of Elimelech.","Boaz asks who Ruth is.","Ruth is known for staying with Naomi.","Boaz tells Ruth to remain in his field.","Boaz orders his workers not to molest Ruth.","Boaz tells Ruth to drink from the water vessels.","Boaz invites Ruth to eat with the workers.","Boaz instructs workers to leave extra grain for Ruth.","Ruth returns to Naomi with grain and tells her about Boaz."]},"ruth_3":{"book":"Ruth","chapter":3,"title":"Ruth asks Boaz to redeem her","facts":["Naomi seeks security for Ruth.","Naomi tells Ruth to go to Boaz at the threshing floor.","Ruth follows Naomi's instructions.","Boaz is surprised to find Ruth at his feet during the night.","Ruth asks Boaz to spread his cloak over her.","Ruth identifies Boaz as a redeemer.","Boaz praises Ruth for her loyalty.","Boaz explains that a nearer redeemer exists.","Boaz promises to settle the matter the next day.","Ruth returns to Naomi with six measures of barley."]},"ruth_4":{"book":"Ruth","chapter":4,"title":"Boaz redeems Ruth","facts":["Boaz goes to the town gate.","Boaz gathers the nearer redeemer and elders.","The nearer redeemer declines to redeem the land and Ruth.","Boaz acquires the property associated with Elimelech's family.","Boaz takes Ruth as his wife.","The elders and people bless the marriage.","Ruth and Boaz have a son.","The child is named Obed.","Obed becomes the father of Jesse.","Jesse becomes the father of David."]},"samuel_1":{"book":"1 Samuel","chapter":1,"title":"Hannah prays for a son","facts":["Elkanah goes yearly to worship at Shiloh.","Hannah is deeply distressed because she has no child.","Hannah prays to the Lord at the sanctuary.","Eli the priest sees Hannah praying.","Hannah promises to dedicate her son to the Lord.","Eli tells Hannah that her prayer will be answered.","Hannah gives birth to Samuel.","Hannah brings Samuel to Eli after he is weaned.","Samuel serves the Lord under Eli.","Hannah offers Samuel to the Lord at Shiloh."]},"samuel_2":{"book":"1 Samuel","chapter":2,"title":"Hannah's song and Eli's sons","facts":["Hannah praises the Lord in prayer.","Hannah's song celebrates God's power and holiness.","Samuel ministers before the Lord as a child.","Eli's sons Hophni and Phinehas are called scoundrels.","Eli's sons take portions of sacrifices improperly.","Eli warns his sons about their behavior.","Samuel grows in the presence of the Lord.","Hannah visits Samuel and brings him a little robe each year.","The Lord blesses Hannah with more children.","A man of God announces judgment against Eli's house."]},"samuel_3":{"book":"1 Samuel","chapter":3,"title":"The Lord calls Samuel","facts":["Samuel ministers to the Lord under Eli.","The word of the Lord is rare in those days.","Samuel hears his name called during the night.","Samuel initially thinks Eli is calling him.","Eli realizes that the Lord is calling Samuel.","Eli tells Samuel to answer the Lord.","The Lord gives Samuel a message about Eli's house.","Samuel is afraid to tell Eli the message.","Eli asks Samuel to tell him everything.","Samuel becomes known throughout Israel as a prophet of the Lord."]},"samuel_4":{"book":"1 Samuel","chapter":4,"title":"The ark is captured","facts":["Israel goes out to fight the Philistines.","Israel suffers a defeat at Ebenezer.","The elders bring the ark of the covenant from Shiloh.","Hophni and Phinehas accompany the ark.","Israel is defeated again.","The Philistines capture the ark.","Hophni and Phinehas die.","A messenger tells Eli that the ark has been captured.","Eli falls from his chair and dies.","Phinehas's wife gives birth to a son and names him Ichabod."]},"samuel_5":{"book":"1 Samuel","chapter":5,"title":"The ark among the Philistines","facts":["The Philistines take the ark to Ashdod.","The ark is placed beside the statue of Dagon.","Dagon is found fallen before the ark.","Dagon falls again and is broken.","The people of Ashdod suffer affliction.","The ark is moved to Gath.","Gath also experiences a plague.","The ark is moved to Ekron.","The people of Ekron fear the ark.","The Philistines decide that the ark must be sent away."]},"samuel_6":{"book":"1 Samuel","chapter":6,"title":"The ark returns to Israel","facts":["The ark remains in Philistine territory for seven months.","Philistine priests and diviners advise sending it back.","The Philistines prepare a new cart for the ark.","Two milk cows are used to pull the cart.","A guilt offering includes golden tumors and mice.","The cows go toward Beth-shemesh.","People of Beth-shemesh see the ark and rejoice.","The ark is placed on the great stone of Joshua.","Some people look into the ark and are struck.","The ark is later taken to Kiriath-jearim."]},"samuel_7":{"book":"1 Samuel","chapter":7,"title":"Samuel leads Israel back to the Lord","facts":["The ark stays at Kiriath-jearim for a long time.","Samuel tells Israel to put away foreign gods.","Israel gathers at Mizpah.","Samuel prays for Israel.","The Philistines hear that Israel has gathered.","The Israelites ask Samuel to cry out to the Lord.","Samuel offers a suckling lamb as a burnt offering.","The Lord throws the Philistines into confusion.","Israel defeats the Philistines.","Samuel sets up a stone called Ebenezer."]},"ecclesiastes_1":{"book":"Ecclesiastes","chapter":1,"title":"The vanity of human toil","facts":["The Teacher introduces the book as words of the Teacher.","The Teacher declares that all is vanity.","Generations come and go.","The sun rises and sets in its cycle.","Rivers run to the sea but the sea is not full.","There is nothing new under the sun.","People remember neither former nor future generations.","The Teacher applies his mind to study and wisdom.","The pursuit of wisdom is described as chasing the wind.","Increasing wisdom is associated with increasing sorrow."]},"ecclesiastes_2":{"book":"Ecclesiastes","chapter":2,"title":"Pleasure, work and wisdom","facts":["The Teacher tests pleasure.","Laughter is examined as a way of testing life.","The Teacher undertakes great works.","The Teacher builds houses and plants vineyards.","The Teacher acquires servants, possessions and wealth.","The Teacher gathers singers and many luxuries.","Wisdom is considered better than folly.","Both wise and foolish people eventually die.","The Teacher finds toil burdensome when its fruits pass to another.","Enjoying food, drink and work is presented as a gift from God."]},"ecclesiastes_3":{"book":"Ecclesiastes","chapter":3,"title":"A time for everything","facts":["There is a time to be born.","There is a time to die.","There is a time to plant and a time to uproot.","There is a time to weep and a time to laugh.","There is a time to mourn and a time to dance.","There is a time to keep silence and a time to speak.","God has made everything suitable for its time.","Human beings cannot fully discover all that God has done.","The Teacher considers judgment and justice.","The Teacher observes that humans and animals both face death."]},"ecclesiastes_4":{"book":"Ecclesiastes","chapter":4,"title":"Oppression and companionship","facts":["The Teacher observes the tears of the oppressed.","The oppressed have no comforter.","The dead are described as having escaped the oppression they saw.","The Teacher sees that toil can be driven by envy of one's neighbor.","A fool folds his hands and consumes his own flesh.","One person working alone may have no companion.","Two are better than one because they have a good reward for their toil.","If one falls, the other can help the companion.","Two can keep warm together.","A threefold cord is not quickly broken."]},"ecclesiastes_5":{"book":"Ecclesiastes","chapter":5,"title":"Worship, promises and wealth","facts":["The Teacher advises guarding one's steps when going to God's house.","Listening is emphasized over careless sacrifice.","Words before God should not be multiplied carelessly.","A vow made to God should be fulfilled.","Dreams and many words can be associated with vanity.","The poor may be oppressed in a province.","The love of money is connected with dissatisfaction.","Abundant wealth can bring many consumers.","The sleep of a laborer is described as sweet.","Enjoying one's allotted wealth is described as a gift from God."]},"ecclesiastes_6":{"book":"Ecclesiastes","chapter":6,"title":"Wealth without enjoyment","facts":["The Teacher describes a person who has wealth but cannot enjoy it.","A stranger may enjoy what another has accumulated.","Human appetite is not satisfied simply by seeing.","The wise person is not exempt from life's limits.","What exists is already known to be human.","People cannot contend with one who is stronger than they are.","More words can increase vanity.","Life is compared with a shadow in its brevity.","The Teacher asks what is good for people during their limited days.","Human beings cannot fully know what will happen after them."]},"john_1":{"book":"Gospel according to John","chapter":1,"title":"The Word and the first disciples","facts":["The Word is described as being with God.","The Word is described as God.","John the Baptist comes as a witness to the light.","John the Baptist denies being the Messiah.","John identifies Jesus as the Lamb of God.","Andrew follows Jesus after John's testimony.","Andrew brings Simon to Jesus.","Jesus gives Simon the name Cephas.","Philip follows Jesus.","Nathanael comes to Jesus after Philip invites him."]},"john_2":{"book":"Gospel according to John","chapter":2,"title":"Cana and the temple","facts":["Jesus attends a wedding at Cana in Galilee.","The wedding runs out of wine.","Jesus's mother tells him about the lack of wine.","Jesus turns water into wine.","The disciples believe in Jesus after the sign.","Jesus goes to Capernaum after the wedding.","Jesus goes to Jerusalem for Passover.","Jesus finds sellers and money changers in the temple.","Jesus drives them out of the temple.","Jesus speaks about the temple of his body."]},"john_3":{"book":"Gospel according to John","chapter":3,"title":"Jesus and Nicodemus","facts":["Nicodemus is a Pharisee and a leader of the Jews.","Nicodemus comes to Jesus by night.","Jesus teaches about being born from above.","Jesus compares the Spirit to the wind.","Jesus recalls the bronze serpent lifted by Moses.","Jesus teaches about God's love for the world.","John the Baptist continues to testify about Jesus.","John says he is not the Messiah.","John describes Jesus as the bridegroom.","John says Jesus must increase while he decreases."]},"john_4":{"book":"Gospel according to John","chapter":4,"title":"The Samaritan woman","facts":["Jesus travels through Samaria.","Jesus rests at Jacob's well.","A Samaritan woman comes to draw water.","Jesus asks the woman for a drink.","Jesus speaks about living water.","The woman has had five husbands.","Jesus identifies himself as the Messiah.","The woman leaves her water jar and tells people about Jesus.","Many Samaritans believe because of the woman's testimony.","Many more believe after hearing Jesus themselves."]},"john_5":{"book":"Gospel according to John","chapter":5,"title":"Healing at Bethesda","facts":["Jesus goes to Jerusalem for a festival.","A pool called Bethesda has many sick people around it.","A man has been ill for thirty-eight years.","Jesus asks the man whether he wants to be made well.","Jesus tells the man to stand up, take his mat and walk.","The healing takes place on the Sabbath.","Some leaders object because the man carries his mat on the Sabbath.","Jesus speaks of God as his Father.","Jesus teaches about the resurrection and judgment.","John the Baptist is mentioned as a witness to Jesus."]},"john_6":{"book":"Gospel according to John","chapter":6,"title":"Bread of Life","facts":["Jesus crosses the Sea of Galilee.","A large crowd follows Jesus because of signs of healing.","Jesus tests Philip about feeding the crowd.","A boy has five barley loaves and two fish.","Jesus gives thanks and distributes the food.","About five thousand men are fed.","Twelve baskets of leftovers are collected.","Jesus walks on the sea toward his disciples.","The crowd seeks Jesus after the feeding.","Jesus teaches that he is the bread of life."]},"john_7":{"book":"Gospel according to John","chapter":7,"title":"Jesus at the Feast of Booths","facts":["Jesus initially remains in Galilee.","Jesus's brothers encourage him to go to Judea.","Jesus goes to the Feast of Booths privately.","Jesus teaches in the temple.","People marvel at Jesus's knowledge.","Jesus says his teaching comes from the One who sent him.","Some people debate whether Jesus is the Christ.","Officers are sent to arrest Jesus.","Jesus speaks of coming to the One who sent him.","Jesus promises living water to those who believe."]},"john_8":{"book":"Gospel according to John","chapter":8,"title":"Light of the world","facts":["Jesus teaches in the temple.","Jesus says he is the light of the world.","Jesus says his testimony is true because he knows where he came from and where he is going.","Jesus speaks about the Father who sent him.","Jesus tells people that knowing him would mean knowing the Father.","Jesus says that those who continue in his word will know the truth.","Jesus says the truth will make people free.","Jesus speaks about people being slaves to sin.","Jesus says that before Abraham was, he is.","Some people take up stones to throw at Jesus."]},"john_9":{"book":"Gospel according to John","chapter":9,"title":"Jesus heals a man born blind","facts":["Jesus sees a man who was blind from birth.","Jesus says the man's blindness is not caused by his parents' sin.","Jesus makes mud with saliva.","Jesus puts the mud on the man's eyes.","The man washes in the pool of Siloam.","The man returns able to see.","Neighbors question how the man received sight.","Pharisees question the healed man.","The man's parents confirm that he was born blind.","The man comes to believe in and worship Jesus."]},"john_10":{"book":"Gospel according to John","chapter":10,"title":"The Good Shepherd","facts":["Jesus teaches about the sheepfold.","The shepherd enters by the gate.","The sheep know the shepherd's voice.","Jesus describes himself as the gate for the sheep.","Jesus says he came so that the sheep may have life abundantly.","Jesus calls himself the good shepherd.","The good shepherd lays down his life for the sheep.","Jesus contrasts the good shepherd with a hired hand.","Jesus says he knows his sheep and they know him.","Jesus says no one can snatch his sheep from his hand."]},"john_11":{"book":"Gospel according to John","chapter":11,"title":"Lazarus is raised","facts":["Lazarus is ill in Bethany.","Mary and Martha are Lazarus's sisters.","Jesus hears that Lazarus is ill but remains where he is for two days.","Jesus travels to Bethany.","Martha meets Jesus before he reaches the village.","Jesus tells Martha that he is the resurrection and the life.","Mary comes to Jesus and weeps.","Jesus weeps at Lazarus's tomb.","Jesus commands Lazarus to come out of the tomb.","Lazarus comes out still wrapped in burial cloths."]},"john_12":{"book":"Gospel according to John","chapter":12,"title":"Jesus enters Jerusalem","facts":["Jesus comes to Bethany before Passover.","Mary anoints Jesus's feet with costly perfume.","Judas Iscariot objects to the perfume.","Jesus enters Jerusalem riding a young donkey.","The crowd takes branches and goes out to meet Jesus.","The crowd cries out about the King of Israel.","Greeks come seeking to see Jesus.","Jesus compares his coming death to a grain of wheat falling into the earth.","Jesus speaks about being lifted up.","Many people still do not believe despite the signs Jesus has done."]},"galatians_1":{"book":"Galatians","chapter":1,"title":"The true gospel","facts":["Paul identifies himself as an apostle.","Paul says his apostleship is through Jesus Christ and God the Father.","Paul greets the churches of Galatia.","Paul expresses astonishment that the Galatians are turning to a different gospel.","Paul says there is no other true gospel.","Paul warns that anyone preaching another gospel should be accursed.","Paul says he is not seeking human approval.","Paul describes his former life in Judaism.","Paul says God set him apart before he was born.","Paul describes receiving his calling by God's grace."]},"galatians_2":{"book":"Galatians","chapter":2,"title":"Justification by faith","facts":["Paul describes going to Jerusalem with Barnabas and Titus.","Titus was not compelled to be circumcised.","Paul says the gospel was entrusted to him for the Gentiles.","James, Cephas and John are described as pillars.","Paul confronts Peter at Antioch.","Peter had withdrawn from eating with Gentiles when certain people arrived.","Paul says a person is not justified by works of the law.","Paul says justification is through faith in Jesus Christ.","Paul says he has been crucified with Christ.","Paul says he lives by faith in the Son of God."]},"galatians_3":{"book":"Galatians","chapter":3,"title":"Faith, law and God's promise","facts":["Paul asks whether the Galatians received the Spirit by works of the law or faith.","Paul points to Abraham's faith.","Those who believe are described as children of Abraham.","Scripture is said to have announced the gospel beforehand to Abraham.","The law brings a curse on failure to keep all its requirements.","Christ redeems people from the curse of the law.","The promise is connected with Abraham's offspring.","Paul explains that the law came later than the promise.","The law is described as a guardian until Christ came.","Those who belong to Christ are described as Abraham's offspring and heirs."]},"galatians_4":{"book":"Galatians","chapter":4,"title":"Sons and heirs","facts":["Paul compares an heir while a child to a servant.","God sends his Son at the fullness of time.","The Son is born of a woman and born under the law.","Believers receive adoption as children.","The Spirit of God's Son is sent into believers' hearts.","Believers can call God Father.","Paul worries that the Galatians are turning back to weak and beggarly elements.","Paul recalls the Galatians receiving him warmly.","Paul uses Hagar and Sarah as an illustration.","Paul says believers are children of the free woman."]},"galatians_5":{"book":"Galatians","chapter":5,"title":"Freedom and life by the Spirit","facts":["Paul urges believers to stand firm in the freedom Christ gives.","Circumcision is discussed as a danger if treated as the basis of justification.","Faith works through love.","Paul says the whole law is summed up in loving one's neighbor.","Paul warns against using freedom as an opportunity for the flesh.","Believers are told to serve one another through love.","Paul says walking by the Spirit opposes gratifying the flesh.","The works of the flesh are listed.","The fruit of the Spirit is listed.","Those who belong to Christ are described as crucifying the flesh with its passions and desires."]},"galatians_6":{"book":"Galatians","chapter":6,"title":"Bear one another's burdens","facts":["Paul tells believers to restore someone caught in a transgression gently.","Believers are told to watch themselves while helping others.","Christians are told to bear one another's burdens.","Each person is encouraged to test their own work.","The one taught the word should share good things with the teacher.","Paul teaches that people reap what they sow.","Sowing to the flesh leads to corruption.","Sowing to the Spirit leads to eternal life.","Believers are urged not to grow weary in doing good.","Paul emphasizes the new creation and the cross of Jesus Christ."]}}

function getLocalSimulation(text){
  const t=text.toLowerCase().replace(/\s+/g," ").trim();
  const has=x=>t.includes(x);
  // Offline Logos fallback: all 35 syllabus chapters are hard-coded here.
  // This runs before Gemini, so Search & Find still works if the AI/API is unavailable.
  const m=t.match(/^(ruth|1\\s*samuel|ecclesiastes|john|gospel\\s+according\\s+to\\s+john|galatians)\\s+(?:chapter\\s*)?(\\d+)$/i);
  if(m){
    const aliases={ruth:"ruth", "1 samuel":"1_Samuel", "1samuel":"1_Samuel", ecclesiastes:"ecclesiastes", john:"john", "gospel according to john":"john", galatians:"galatians"};
    const key=(aliases[m[1].toLowerCase()]||aliases[m[1].toLowerCase().replace(/\\s+/g," ")])+"_"+Number(m[2]);
    const item=LOGOS_LOCAL_SIMULATIONS[key];
    if(item){
      const icons=["📖","🧑","🌾","🙏","🤝","🏠","⚖️","👑","🌟","🧠"];
      return item.facts.map((label,i)=>({emoji:icons[i],label}));
    }
  }


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

function logosDeepData(){
  if(window.LOGOS_DEEP_2026)return window.LOGOS_DEEP_2026;
  const data={};
  for(const item of Object.values(LOGOS_LOCAL_SIMULATIONS)){
    const key=item.book==="Ruth"?"ruth":item.book==="1 Samuel"?"samuel":item.book==="Ecclesiastes"?"ecclesiastes":item.book==="John"?"john":"galatians";
    if(!data[key])data[key]={label:(key==="ruth"?"🌾 Ruth":key==="samuel"?"👑 1 Samuel":key==="ecclesiastes"?"📜 Ecclesiastes":key==="john"?"✝️ Gospel according to John":"✉️ Galatians"),range:[1,key==="ruth"?4:key==="samuel"?7:key==="ecclesiastes"?6:key==="john"?12:6],chapters:{}};
    data[key].chapters[item.chapter]={title:item.title,facts:item.facts};
  }
  return data;
}

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