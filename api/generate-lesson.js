function send(res,data,status=200){res.status(status);res.setHeader("Content-Type","application/json");res.setHeader("Access-Control-Allow-Origin","*");res.setHeader("Access-Control-Allow-Headers","Content-Type");res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");res.end(JSON.stringify(data));}
function extractObject(text){
  const s=String(text||"").replace(/^\s*```json\s*/i,"").replace(/\s*```\s*$/i,"").trim();
  const a=s.indexOf("{"),b=s.lastIndexOf("}");return JSON.parse(a>=0&&b>=0?s.slice(a,b+1):s);
}
const prompt=`You create one visual learning slide from ONE uploaded school-book page for an 11-year-old learner. The uploaded page is the ONLY authoritative source. IGNORE any previous topic, chapter, page, template, or hardcoded example. Never assume the page is about flowering plants, science, mathematics, or any other topic unless the uploaded page actually shows or states that. Carefully read ALL visible source text and inspect diagrams, tables, labels, examples, and pictures in the supplied page image. Preserve the source meaning and facts; do not invent facts or substitute generic teaching content.

Return ONLY valid JSON with exactly these fields:
title: a short title that matches THIS page;
keyIdeas: exactly 3 concise factual points drawn from THIS page;
discovery: one simple conceptual explanation of the main idea on THIS page;
memory: one short memorable phrase based on THIS page;
imagePrompt: a detailed prompt for an accurate educational illustration of THIS page's actual concept. If the page contains a process, show that process; if it contains a diagram, recreate its relationships; if it contains mathematics, show the actual mathematical objects. Do not add unrelated objects. Do not ask the image generator to render paragraphs of text.

The slide must be appropriate for the uploaded page even when the page belongs to a completely different subject from every other page.`;
async function callGemini(parts,responseMimeType="application/json",options={}){
  const key=process.env.GEMINI_API_KEY;
  if(!key)throw new Error("GEMINI_API_KEY is not configured on Vercel.");

  // Use a small model cascade. Google is currently reporting intermittent
  // high-demand 503s on Gemini, so one busy model should not break the whole app.
  const models=options.models||["gemini-3.1-flash-lite","gemini-3.5-flash-lite","gemini-3.6-flash"];
  const timeoutMs=options.timeoutMs||45000;
  const maxOutputTokens=options.maxOutputTokens||1200;
  let lastError=null;

  for(const model of models){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent?key="+encodeURIComponent(key),{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        signal:controller.signal,
        body:JSON.stringify({
          contents:[{role:"user",parts}],
          generationConfig:{responseMimeType,maxOutputTokens}
        })
      });
      const d=await r.json().catch(()=>({}));
      if(r.ok){
        const text=d?.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("")||"";
        return extractObject(text);
      }
      lastError=new Error(d?.error?.message||("Gemini request failed ("+r.status+")"));
      // 429/permission/quota should not burn through the remaining models.
      if([400,401,403,404,429].includes(r.status))break;
      // 500/502/503/504: immediately try the next stable model.
    }catch(e){
      lastError=e?.name==="AbortError"?new Error(model+" did not respond within "+Math.round(timeoutMs/1000)+" seconds"):e;
    }finally{clearTimeout(timeout);}
  }
  throw lastError||new Error("Gemini is temporarily unavailable.");
}

export default async function handler(req,res){
  if(req.method==="OPTIONS")return send(res,{ok:true});
  if(req.method!=="POST")return send(res,{error:"Method not allowed."},405);
  try{
    const body=typeof req.body==="string"?JSON.parse(req.body||"{}"):(req.body||{});
    if(body.action==="lesson-page"){
      const parts=[];if(body.text)parts.push({text:"SOURCE TEXT:\n"+String(body.text).slice(0,18000)});
      if(body.image){
        const m=String(body.image).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if(m)parts.push({inline_data:{mime_type:m[1],data:m[2]}});
      }
      if(!parts.length)return send(res,{error:"No page text or image supplied."},400);
      let first;
      try{
        first=await callGemini(parts,"application/json",{timeoutMs:12000,maxOutputTokens:900});
      }catch(aiError){
        // Gemini may be unavailable because the free quota is exhausted. The uploaded
        // page must still produce a page-faithful lesson, so fall back to the actual
        // extracted page text instead of generic subject notes.
        console.warn("LESSON AI unavailable; using source-faithful local fallback:",aiError?.message);
        const source=String(body.text||"").replace(/\s+/g," ").trim();
        const rawParts=source
          .split(/(?<=[.!?])\s+|(?=\b(?:Example|Activity|Question|Remember|Note|Definition|Key|What|How|Why)\b\s*[:\-])/i)
          .map(x=>x.trim())
          .filter(x=>x.length>15);
        const cleanParts=rawParts.filter(x=>!/^(page|chapter)\s*\d+$/i.test(x));
        const lower=source.toLowerCase();

        // Prefer a heading-like opening fragment for the slide title.
        let title=(cleanParts.find(x=>x.length>=3&&x.length<=90&&
          !/[.!?]$/.test(x))||cleanParts[0]||"Lesson Page")
          .replace(/^(page|chapter)\s*\d+[:.\-]?\s*/i,"").trim();
        if(!title||title.length>90)title="Lesson Page";

        // Preserve the page's actual statements. Do not substitute generic facts.
        let keyIdeas=cleanParts
          .filter(x=>x.length>=20)
          .slice(0,5)
          .map(x=>x.length>180?x.slice(0,177)+"…":x);

        // If extraction is sparse, use recognizable page-specific terms from the source.
        if(keyIdeas.length<2){
          const terms=[];
          const patterns=[
            [/numerator|denominator|fraction/,"Fraction concepts shown on this page"],
            [/pollinat|pollen|anther|stigma/,"Pollination concepts shown on this page"],
            [/kinetic|potential|energy/,"Energy concepts shown on this page"],
            [/evaporation|condensation|rainfall/,"Water-cycle concepts shown on this page"],
            [/photosynthesis|chlorophyll/,"Photosynthesis concepts shown on this page"],
            [/force|motion|friction/,"Force and motion concepts shown on this page"]
          ];
          for(const [re,label] of patterns)if(re.test(lower))terms.push(label);
          keyIdeas=[...keyIdeas,...terms];
        }
        while(keyIdeas.length<2)keyIdeas.push("The page contains additional examples or information that should be read directly from the source.");

        const discovery=cleanParts.slice(0,2).join(" ");
        const memoryTerms=(source.match(/\b[A-Za-z][A-Za-z-]{3,}\b/g)||[])
          .filter(x=>!/^(this|that|with|from|they|have|which|about|there|their)$/i.test(x))
          .slice(0,6);
        first={
          title:title.slice(0,80),
          keyIdeas:keyIdeas.slice(0,3),
          discovery:discovery||"Read the examples and diagrams on this page and connect them to the main idea.",
          memory:memoryTerms.length?memoryTerms.join(" • "):"SEE THE PAGE → CONNECT THE IDEAS → EXPLAIN",
          imagePrompt:"Create an educational illustration that stays faithful to the uploaded page. Use the page's actual topic, objects, relationships, examples and process from the supplied source text. Do not invent a different topic."
        };
      }
      const complete=(x)=>x&&String(x.title||"").trim()&&Array.isArray(x.keyIdeas)&&x.keyIdeas.length>=2&&String(x.discovery||"").trim()&&String(x.memory||"").trim();
      let lesson=first;
      if(!complete(lesson)){
        const repair="You are repairing an AI lesson extraction. Use ONLY the supplied SOURCE PAGE. Return ONLY valid JSON with exactly these fields: title (short page-specific title), keyIdeas (exactly 3 factual points from the page), discovery (one simple explanation of the page main idea), memory (one short memory phrase), imagePrompt (specific educational illustration prompt for THIS page). Do not use any topic from outside the source page. If the page is a worksheet, base the lesson on the actual questions or concepts visible on it.\\n\\nSOURCE PAGE:\\n"+parts.map(p=>p.text||"").join("\\n")+"\\n\\nFIRST ATTEMPT:\\n"+JSON.stringify(first);
        lesson=await callGemini([{text:repair},...parts.filter(p=>p.inline_data)],"application/json",{timeoutMs:45000,maxOutputTokens:1100});
      }
      if(!complete(lesson))throw new Error("Gemini returned incomplete lesson fields. Please try this page again.");
      lesson.keyIdeas=lesson.keyIdeas.filter(Boolean).slice(0,3);
      lesson.imagePrompt=String(lesson.imagePrompt||"").trim()||("Accurate child-friendly educational illustration of "+lesson.title+": "+lesson.keyIdeas.join("; "));
      return send(res,{lesson});
    }
    if(body.action==="topic-lesson"){
      const topic=String(body.topic||"").trim();
      if(!topic)return send(res,{error:"Please enter a topic."},400);

      async function getBibleChapter(request){
        let normalized=String(request||"").trim();
        normalized=normalized.replace(/^\s*(?:from|in|of)\s+(?:the\s+)?bible\s+/i,"");
        normalized=normalized.replace(/^\s*bible\s+/i,"");
        normalized=normalized.replace(/^\s*book\s+of\s+/i,"");
        const m=normalized.match(/^(.+?)\s+(?:chapter\s*)?(\d{1,3})(?::(\d+(?:-\d+)?))?$/i);
        if(!m)return null;
        const rawBook=m[1].trim().toLowerCase().replace(/^(the)\s+/,"");
        const aliases={
          "genesis":"GEN","gen":"GEN","exodus":"EXO","ex":"EXO","leviticus":"LEV","lev":"LEV",
          "numbers":"NUM","num":"NUM","deuteronomy":"DEU","deut":"DEU","joshua":"JOS","judges":"JDG",
          "ruth":"RUT","1 samuel":"1SA","1samuel":"1SA","2 samuel":"2SA","2samuel":"2SA",
          "1 kings":"1KI","2 kings":"2KI","1 chronicles":"1CH","2 chronicles":"2CH",
          "ezra":"EZR","nehemiah":"NEH","esther":"EST","job":"JOB","psalms":"PSA","psalm":"PSA",
          "proverbs":"PRO","ecclesiastes":"ECC","song of solomon":"SNG","isaiah":"ISA","jeremiah":"JER",
          "lamentations":"LAM","ezekiel":"EZK","daniel":"DAN","hosea":"HOS","joel":"JOL","amos":"AMO",
          "obadiah":"OBA","jonah":"JON","micah":"MIC","nahum":"NAM","habakkuk":"HAB","zephaniah":"ZEP",
          "haggai":"HAG","zechariah":"ZEC","malachi":"MAL","matthew":"MAT","matt":"MAT","mark":"MRK",
          "mk":"MRK","luke":"LUK","john":"JHN","acts":"ACT","romans":"ROM","rom":"ROM",
          "1 corinthians":"1CO","2 corinthians":"2CO","galatians":"GAL","ephesians":"EPH",
          "philippians":"PHP","colossians":"COL","1 thessalonians":"1TH","2 thessalonians":"2TH",
          "1 timothy":"1TI","2 timothy":"2TI","titus":"TIT","philemon":"PHM","hebrews":"HEB",
          "james":"JAS","1 peter":"1PE","2 peter":"2PE","1 john":"1JN","2 john":"2JN","3 john":"3JN",
          "jude":"JUD","revelation":"REV","revelation of john":"REV"
        };
        const id=aliases[rawBook];
        if(!id)return null;
        const chapter=m[2], verseRange=m[3]||"";
        const url="https://bible-api.com/data/web/"+id+"/"+chapter;
        try{
          const r=await fetch(url);
          if(!r.ok)return null;
          const d=await r.json();
          if(!Array.isArray(d.verses)||!d.verses.length)return null;
          return {book:m[1].trim(),chapter,verseRange,verses:d.verses};
        }catch(e){return null;}
      }
      function bibleFallback(ch){
        const verses=ch.verses;
        const groups=[];
        const size=Math.max(2,Math.ceil(verses.length/5));
        for(let i=0;i<verses.length;i+=size)groups.push(verses.slice(i,i+size));
        const clean=(arr)=>arr.map(v=>"Verse "+v.verse+": "+String(v.text||"").replace(/\\s+/g," ").trim()).join(" ");
        const slides=[];
        slides.push({
          title:ch.book+" "+ch.chapter+" — Overview",
          keyIdeas:[
            "This chapter has "+verses.length+" verses.",
            "Read the chapter as one connected story or message.",
            "Notice the people, place, problem, response and outcome."
          ],
          discovery:"Start by asking: Who is involved, what happens, and how does the situation change?",
          memory:"WHO → WHAT HAPPENS → WHAT CHANGES",
          imagePrompt:"Child-friendly Bible story illustration for "+ch.book+" chapter "+ch.chapter+", showing the main people and setting without adding modern objects."
        });
        groups.forEach((g,i)=>{
          const first=g[0].verse,last=g[g.length-1].verse;
          const text=clean(g);
          slides.push({
            title:ch.book+" "+ch.chapter+":"+first+(first!==last?"–"+last:""),
            keyIdeas:[
              "Verses "+first+"–"+last+" introduce the events and people in this part of the chapter.",
              "Look for what the people say, do, decide, or experience.",
              "Connect this part to what happened immediately before and after it."
            ],
            discovery:text.length>420?text.slice(0,417)+"…":text,
            memory:"READ → NOTICE → CONNECT",
            imagePrompt:"Accurate child-friendly Bible story scene representing "+ch.book+" "+ch.chapter+":"+first+"–"+last+". Use the historical setting and people suggested by the passage; no modern objects, no text."
          });
        });
        slides.push({
          title:"What can we learn?",
          keyIdeas:[
            "Retell the chapter in the correct order.",
            "Name the important people and explain their choices or actions.",
            "Use the chapter itself to support your answers."
          ],
          discovery:"The strongest understanding comes from connecting the chapter's events rather than memorising isolated names.",
          memory:"RETELL IT → EXPLAIN IT → REMEMBER IT",
          imagePrompt:"Warm educational Bible chapter recap illustration for "+ch.book+" "+ch.chapter+", showing the central story arc in one clear scene."
        });
        return {title:ch.book+" "+ch.chapter,subtitle:"Bible chapter lesson • World English Bible source",slides};
      }

      // Keep the Topic Lesson feature usable even when Gemini is overloaded.
      // These lessons are deterministic, instant, and can still receive AI illustrations.

      const bibleChapter=await getBibleChapter(topic);
      if(bibleChapter){
        // Try Gemini with the actual chapter text first, so the lesson can be precise.
        const chapterText=bibleChapter.verses.map(v=>"Verse "+v.verse+": "+v.text).join("\\n");
        try{
          const biblePrompt="Create a meaningful Bible study lesson for an 11-year-old from the exact chapter text below. Do not invent events. Use the chapter as the authoritative source. Summarize rather than quoting long passages. Include the actual people, places, events, choices and sequence from the chapter. Return ONLY JSON with title, subtitle and 5-10 slides, each with title, exactly 3 keyIdeas, discovery, memory and imagePrompt.\\n\\nCHAPTER: "+bibleChapter.book+" "+bibleChapter.chapter+"\\n"+chapterText;
          const obj=await callGemini([{text:biblePrompt}],"application/json",{timeoutMs:12000,maxOutputTokens:5000});
          if(obj&&Array.isArray(obj.slides)&&obj.slides.length>=5)return send(res,{lesson:obj});
        }catch(e){console.warn("BIBLE AI unavailable; using chapter-aware fallback:",e?.message);}
        return send(res,{lesson:bibleFallback(bibleChapter)});
      }

      // Bible requests MUST be routed before generic topic AI; otherwise Gemini may answer “Ruth chapter 1” as a generic lesson.
      const topicPrompt=`Create a complete illustrated school lesson for an 11-year-old learner at the requested grade level.

TOPIC / REQUEST:
${topic}

Use your general educational knowledge to teach the topic accurately and age-appropriately. If the request names a grade, match that grade. If it names a curriculum or syllabus, follow that level and terminology where you know it. Do not invent quotations, page numbers, or claims of having searched a textbook. Build a coherent lesson from basics to understanding and application.

Choose the number of slides yourself based on the breadth of the topic: normally 5–10 slides, but use up to 25 when the topic genuinely needs more explanation. Do not pad the lesson just to increase the slide count.

Return ONLY valid JSON:
{"title":"...","subtitle":"...","slides":[{"title":"short slide title","keyIdeas":["concise factual point","concise factual point","concise factual point"],"discovery":"one simple conceptual explanation","memory":"short memorable phrase","imagePrompt":"specific educational illustration showing the actual concept on this slide"}]}

Rules:
- Each slide must teach one clear idea.
- Keep language simple enough for the stated grade.
- Progress logically from introduction to explanation, examples/processes, and a short recap/application where appropriate.
- Make the lesson visually teachable: every slide needs a meaningful imagePrompt.
- For science, show accurate processes, labelled relationships, life cycles, cause/effect, or diagrams.
- For mathematics, show the actual mathematical objects, steps, quantities, or visual models.
- For language/history/geography, use meaningful scenes, timelines, maps, examples, or comparisons.
- Do not put long paragraphs inside imagePrompt.
- Avoid repeating the same idea across slides.
- Never mention that you are an AI.`;
      try{
        const obj=await callGemini([{text:topicPrompt}],"application/json",{timeoutMs:12000,maxOutputTokens:5000});
        if(obj&&Array.isArray(obj.slides)&&obj.slides.length>=5){
          obj.slides=obj.slides.slice(0,25).map((s,i)=>({
            title:String(s.title||("Lesson "+(i+1))).trim(),
            keyIdeas:Array.isArray(s.keyIdeas)?s.keyIdeas.filter(Boolean).map(x=>String(x).trim()).slice(0,3):[],
            discovery:String(s.discovery||"").trim(),
            memory:String(s.memory||"").trim(),
            imagePrompt:String(s.imagePrompt||"").trim()
          }));
          return send(res,{lesson:obj});
        }
      }catch(topicError){
        console.warn("TOPIC AI unavailable; using local lesson fallback:",topicError?.message);
      }

      // Bible chapter requests get a real chapter-aware fallback instead of a generic lesson.
      // We use the public-domain World English Bible through bible-api.com for the chapter text,
      // then summarize it into child-friendly slides. Gemini is still used first when available.


      const t=topic.toLowerCase();
      let slides=[];
      const add=(title,keyIdeas,discovery,memory,imagePrompt)=>slides.push({title,keyIdeas,discovery,memory,imagePrompt});

      if(/fraction/.test(t)){
        add("What is a Fraction?",["A fraction shows equal parts of a whole.","The numerator is the top number.","The denominator is the bottom number."],"A fraction tells us how many equal parts we have out of the total number of equal parts.","TOP = parts we have • BOTTOM = total equal parts","Grade 5 fraction model with a rectangle divided into equal parts, some parts shaded, numerator and denominator clearly represented visually");
        add("Proper, Improper & Mixed Fractions",["A proper fraction is less than 1.","An improper fraction is equal to or greater than 1.","A mixed number has a whole number and a fraction."],"The size of a fraction depends on how the numerator compares with the denominator.","PROPER < 1 • IMPROPER ≥ 1","Visual comparison of proper fraction, improper fraction, and mixed number using fraction bars");
        add("Equivalent Fractions",["Equivalent fractions have the same value.","Multiply or divide numerator and denominator by the same non-zero number.","Different-looking fractions can represent the same amount."],"Multiplying both parts by the same number changes the names of the parts but not the value.","SAME VALUE, DIFFERENT LOOK","Two fraction bars showing 1/2 and 2/4 with equal shaded areas, plus the multiplication relationship");
        add("Comparing Fractions",["Fractions with the same denominator are easy to compare.","With the same denominator, the larger numerator means the larger fraction.","Visual fraction bars help compare different fractions."],"Compare the amount shaded, not just the numbers you see.","SAME BOTTOM → COMPARE TOP","Side-by-side fraction bars comparing two fractions with equal and different denominators");
        add("Adding Fractions",["Fractions with the same denominator can be added directly.","Add the numerators and keep the denominator the same.","The denominator tells the size of each part."],"When the pieces are the same size, you only need to count how many pieces you have altogether.","KEEP THE BOTTOM, ADD THE TOP","Chocolate bar or fraction bars demonstrating 2/8 + 3/8 = 5/8 with equal pieces");
        add("Subtracting Fractions",["Use a common denominator before subtracting.","Subtract the numerators when denominators are equal.","Simplify the answer when possible."],"Subtracting fractions means taking away equal-sized parts.","KEEP THE BOTTOM, SUBTRACT THE TOP","Fraction bars showing 7/8 - 3/8 = 4/8 and simplification to 1/2");
        add("Multiplying Fractions",["Multiply numerator by numerator.","Multiply denominator by denominator.","Simplify the result when possible."],"Fraction multiplication can be understood as finding a fraction of a fraction.","TOP × TOP • BOTTOM × BOTTOM","Area model showing 2/3 of 3/4 with overlapping shaded regions and the resulting fraction");
        add("Dividing Fractions",["Dividing asks how many groups of one fraction fit into another.","Keep the first fraction, change division to multiplication, and use the reciprocal of the second fraction.","Check whether the answer makes sense."],"Division tells us how many fractional groups can fit into the amount we have.","KEEP • CHANGE • FLIP","Visual fraction bars demonstrating division of one fraction by another with reciprocal step");
        add("Fraction Review",["Fractions describe parts of equal wholes.","Equivalent fractions keep the same value.","Choose the operation that matches the problem."],"Fractions become easier when you picture the equal parts first.","SEE THE PARTS → CHOOSE THE OPERATION","Friendly grade 5 fraction concept map connecting fraction types, equivalence, comparison, addition, subtraction, multiplication and division");
      }else if(/pollinat/.test(t)){
        add("What is Pollination?",["Pollination is the transfer of pollen from anther to stigma.","The anther produces pollen.","The stigma receives pollen."],"Pollination is the important step where pollen reaches the female part of a flower.","ANTHER → POLLEN → STIGMA","Accurate flower diagram showing pollen moving from anther to stigma");
        add("Agents of Pollination",["Insects can carry pollen.","Birds and other animals can carry pollen.","Wind and water can also move pollen in some plants."],"Pollen can travel with help from living and non-living agents.","POLLEN NEEDS A CARRIER","Bee, bird, wind and water carrying pollen between flowers");
        add("Self & Cross Pollination",["Self-pollination happens within the same flower or plant.","Cross-pollination transfers pollen between flowers of different plants of the same species.","Both involve pollen reaching a stigma."],"The key difference is where the pollen comes from.","SAME PLANT or DIFFERENT PLANT","Clear comparison diagram of self-pollination and cross-pollination");
        add("From Pollination to Fertilisation",["Pollination happens before fertilisation.","A pollen grain on the stigma can grow a pollen tube.","The male cell can reach the ovule."],"Pollination starts a chain of events that can lead to fertilisation.","POLLINATION → POLLEN TUBE → FERTILISATION","Step-by-step flower diagram from pollen landing on stigma to pollen tube reaching ovule");
        add("Why Pollination Matters",["Pollination helps flowering plants reproduce.","Successful reproduction can lead to seeds.","Seeds can grow into new plants."],"Pollination connects one generation of plants to the next.","POLLEN → SEED → NEW PLANT","Life-cycle style illustration linking flower, pollination, seed formation and new plant");
      }else{
        add("Let's Explore "+topic,["First identify what the topic is about.","Look for its important parts or ideas.","Connect the ideas to understand the whole topic."],"Start with the big picture, then zoom in on the important parts.","BIG IDEA → PARTS → CONNECTIONS","Clean child-friendly educational overview of "+topic+", showing its main concept and major parts");
        add("Key Ideas",["Find the main facts or rules.","Notice important words and relationships.","Ask what causes what, or how the parts connect."],"Learning becomes easier when separate facts are connected into one mental picture.","NOTICE → CONNECT → EXPLAIN","Visual concept map for "+topic+" with three clearly connected key ideas");
        add("How It Works",["Break the topic into simple steps.","Follow the order when there is a process.","Use an example to check your understanding."],"A process becomes clearer when you see one step leading to the next.","STEP 1 → STEP 2 → STEP 3","Step-by-step educational process illustrating "+topic+" in a simple school textbook style");
        add("Example & Application",["Use the idea in a simple example.","Explain why the answer or result makes sense.","Try a similar example yourself."],"Applying an idea shows whether you truly understand it.","LEARN → TRY → EXPLAIN","Age-appropriate example applying "+topic+" with clear visual objects and relationships");
        add("Quick Review",["Say the main idea in your own words.","Recall the most important terms.","Explain one example without looking."],"If you can explain the idea simply, you are ready to use it.","SEE IT → UNDERSTAND IT → REMEMBER IT","Friendly visual recap of "+topic+" with the main idea, key terms and one example");
      }
      return send(res,{lesson:{title:topic,subtitle:"Visual lesson",slides}});
    }

    if(body.action==="simulate"){
      const text=String(body.text||"").trim();if(!text)return send(res,{error:"No simulation topic supplied."},400);
      const t=text.toLowerCase().replace(/\s+/g," ").trim();
      const has=phrase=>t.includes(phrase);
      let steps=null;

      // Known flows are local-first. Gemini cannot replace them with generic steps.
      if(has("ruth") && (has("ruth chapter 1") || /^ruth\s+1$/.test(t))){
        steps=[
          {emoji:"👩",label:"Naomi loses her husband and sons"},
          {emoji:"🏠",label:"Naomi decides to return home"},
          {emoji:"👭",label:"Ruth chooses to stay with Naomi"},
          {emoji:"🛤️",label:"They travel to Bethlehem"},
          {emoji:"🌾",label:"They arrive at barley harvest"}
        ];
      }else if((has("ruth") && (has("chapter")||/^ruth\s+\d+$/.test(t))) ||
               has("1 samuel") || has("2 samuel") || has("john chapter") || has("galatians chapter")){
        steps=[
          {emoji:"📖",label:"Open the Bible chapter"},
          {emoji:"👥",label:"Meet the important people"},
          {emoji:"➡️",label:"Follow the events in order"},
          {emoji:"💬",label:"Notice words and choices"},
          {emoji:"💡",label:"Understand the chapter message"}
        ];
      }else if(/equivalent fraction|fraction|fractions/.test(t)){
        steps=[
          {emoji:"🍫",label:"Start with the fraction"},
          {emoji:"✖️",label:"Multiply top and bottom"},
          {emoji:"🔢",label:"Keep the value equal"},
          {emoji:"✨",label:"Get an equivalent fraction"}
        ];
      }else if(/tree|plant|growth/.test(t)){
        steps=[
          {emoji:"🌰",label:"Seed is planted"},
          {emoji:"💧",label:"Water reaches the seed"},
          {emoji:"🌱",label:"Root and shoot emerge"},
          {emoji:"🌿",label:"Young plant grows"},
          {emoji:"🌳",label:"Mature tree develops"}
        ];
      }else if(has("water cycle")){
        steps=[
          {emoji:"☀️",label:"Sun heats the water"},
          {emoji:"💨",label:"Water evaporates"},
          {emoji:"☁️",label:"Water vapour condenses"},
          {emoji:"🌧️",label:"Rain falls"},
          {emoji:"🌊",label:"Water collects"}
        ];
      }else if(has("butterfly")){
        steps=[
          {emoji:"🥚",label:"Egg is laid"},
          {emoji:"🐛",label:"Caterpillar grows"},
          {emoji:"🟢",label:"Pupa forms"},
          {emoji:"🦋",label:"Adult butterfly emerges"}
        ];
      }else if(has("pollination")){
        steps=[
          {emoji:"🌼",label:"Anther contains pollen"},
          {emoji:"🐝",label:"Pollen is carried"},
          {emoji:"🌸",label:"Pollen reaches stigma"},
          {emoji:"🌱",label:"Reproduction can continue"}
        ];
      }else if(has("earth")&&has("sun")){
        steps=[
          {emoji:"☀️",label:"Sun provides light"},
          {emoji:"🌍",label:"Earth receives sunlight"},
          {emoji:"🔄",label:"Earth moves in orbit"},
          {emoji:"🌌",label:"Earth continues around Sun"}
        ];
      }else if(has("food chain")){
        steps=[
          {emoji:"🌱",label:"Plant makes food"},
          {emoji:"🐛",label:"Insect eats plant"},
          {emoji:"🐸",label:"Frog eats insect"},
          {emoji:"🐍",label:"Snake eats frog"},
          {emoji:"🦅",label:"Eagle eats snake"}
        ];
      }else if(has("volcano")){
        steps=[
          {emoji:"🌋",label:"Magma gathers underground"},
          {emoji:"🔥",label:"Pressure and heat increase"},
          {emoji:"💨",label:"Volcano erupts"},
          {emoji:"🌋",label:"Lava flows outward"}
        ];
      }

      if(steps)return send(res,{steps});

      // Unknown concepts still use Gemini for flexible AI simulation.
      const simPrompt='You are an educational simulation designer for an 11-year-old. The learner may type ANY school concept, including fractions, grammar, science, history, geography, or mathematics. Create a short visual step-by-step simulation that demonstrates the concept, not merely defines it. Return ONLY valid JSON: {"steps":[{"emoji":"one emoji","label":"short action/state"}]}. Give 3 to 7 steps. Make the sequence logically meaningful and age-appropriate. For mathematics, show the mathematical transformation or relationship. For non-math topics, show a process, cause/effect chain, comparison, or transformation. Keep labels under 8 words. Use simple emojis as visual anchors.';
      try{
        const obj=await callGemini([{text:simPrompt+"\\n\\nCONCEPT:\\n"+text}],"application/json",{timeoutMs:8000,maxOutputTokens:700});
        if(obj?.steps?.length)return send(res,obj);
      }catch(simError){
        console.warn("SIMULATION AI unavailable; using instant fallback:",simError?.message);
      }

      return send(res,{steps:[
        {emoji:"🔎",label:"Identify the main idea"},
        {emoji:"🧩",label:"Break it into parts"},
        {emoji:"🔗",label:"Connect the important steps"},
        {emoji:"💡",label:"Explain what happens"}
      ]});
    }

    if(body.action==="image"){
      const key=process.env.POLLINATIONS_API_KEY;
      if(!key)return send(res,{error:"POLLINATIONS_API_KEY is not configured on Vercel."},500);
      const promptText=String(body.prompt||"").trim();if(!promptText)return send(res,{error:"No image prompt supplied."},400);
      const url="https://gen.pollinations.ai/image/"+encodeURIComponent(promptText)+"?model=flux&width=768&height=768";
      const r=await fetch(url,{headers:{Authorization:"Bearer "+key}});
      if(!r.ok)throw new Error("Pollinations image request failed ("+r.status+")");
      const buf=Buffer.from(await r.arrayBuffer());const type=r.headers.get("content-type")||"image/jpeg";
      return send(res,{image:"data:"+type+";base64,"+buf.toString("base64")});
    }
    return send(res,{error:"Unknown action."},400);
  }catch(error){console.error(error);return send(res,{error:error?.message||"AI request failed."},500);}
}