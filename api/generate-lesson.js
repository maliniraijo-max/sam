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
async function callGemini(parts,responseMimeType="application/json"){
  const key=process.env.GEMINI_API_KEY;
  if(!key)throw new Error("GEMINI_API_KEY is not configured on Vercel.");
  let lastError=null;
  // Keep each request bounded; do not queue six slow model calls.
  for(let attempt=0;attempt<2;attempt++){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),24000);
    try{
      const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key="+encodeURIComponent(key),{
        method:"POST",headers:{"Content-Type":"application/json"},signal:controller.signal,
        body:JSON.stringify({contents:[{role:"user",parts}],generationConfig:{responseMimeType,maxOutputTokens:900}})
      });
      const d=await r.json().catch(()=>({}));
      if(r.ok)return extractObject(d?.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("")||"");
      lastError=new Error(d?.error?.message||("Gemini request failed ("+r.status+")"));
      if(![500,502,503,504].includes(r.status))break;
    }catch(e){
      lastError=e?.name==="AbortError"?new Error("Gemini did not respond within 24 seconds"):e;
    }finally{clearTimeout(timeout);}
    if(attempt===0)await new Promise(resolve=>setTimeout(resolve,900));
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
      const first=await callGemini(parts);
      const complete=(x)=>x&&String(x.title||"").trim()&&Array.isArray(x.keyIdeas)&&x.keyIdeas.length>=2&&String(x.discovery||"").trim()&&String(x.memory||"").trim();
      let lesson=first;
      if(!complete(lesson)){
        const repair="You are repairing an AI lesson extraction. Use ONLY the supplied SOURCE PAGE. Return ONLY valid JSON with exactly these fields: title (short page-specific title), keyIdeas (exactly 3 factual points from the page), discovery (one simple explanation of the page main idea), memory (one short memory phrase), imagePrompt (specific educational illustration prompt for THIS page). Do not use any topic from outside the source page. If the page is a worksheet, base the lesson on the actual questions or concepts visible on it.\\n\\nSOURCE PAGE:\\n"+parts.map(p=>p.text||"").join("\\n")+"\\n\\nFIRST ATTEMPT:\\n"+JSON.stringify(first);
        lesson=await callGemini([{text:repair},...parts.filter(p=>p.inline_data)]);
      }
      if(!complete(lesson))throw new Error("Gemini returned incomplete lesson fields. Please try this page again.");
      lesson.keyIdeas=lesson.keyIdeas.filter(Boolean).slice(0,3);
      lesson.imagePrompt=String(lesson.imagePrompt||"").trim()||("Accurate child-friendly educational illustration of "+lesson.title+": "+lesson.keyIdeas.join("; "));
      return send(res,{lesson});
    }
    if(body.action==="topic-lesson"){
      const topic=String(body.topic||"").trim();
      if(!topic)return send(res,{error:"Please enter a topic."},400);
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
      const obj=await callGemini([{text:topicPrompt}],"application/json");
      if(!obj||!Array.isArray(obj.slides)||obj.slides.length<5)throw new Error("The AI could not create enough lesson slides. Please try the topic again.");
      obj.slides=obj.slides.slice(0,25).map((s,i)=>({
        title:String(s.title||("Lesson "+(i+1))).trim(),
        keyIdeas:Array.isArray(s.keyIdeas)?s.keyIdeas.filter(Boolean).map(x=>String(x).trim()).slice(0,3):[],
        discovery:String(s.discovery||"").trim(),
        memory:String(s.memory||"").trim(),
        imagePrompt:String(s.imagePrompt||"").trim()
      }));
      return send(res,{lesson:obj});
    }

    if(body.action==="simulate"){
      const text=String(body.text||"").trim();if(!text)return send(res,{error:"No simulation topic supplied."},400);
      const simPrompt="You are an educational simulation designer for an 11-year-old. The learner may type ANY school concept, including fractions, equivalent fractions, grammar, science, history, geography, or mathematics. Create a short visual step-by-step simulation that demonstrates the concept, not merely defines it. Return ONLY valid JSON: {\"steps\":[{\"emoji\":\"one emoji\",\"label\":\"short action/state\"}]}. Give 3 to 7 steps. Make the sequence logically meaningful and age-appropriate. For mathematics, show the mathematical transformation or relationship. For non-math topics, show a process, cause/effect chain, comparison, or transformation. Keep labels under 8 words. Use simple emojis as visual anchors.";
      const obj=await callGemini([{text:simPrompt+"\\n\\nCONCEPT:\\n"+text}]);return send(res,obj);
    }

    if(body.action==="image"){
      const key=process.env.POLLINATIONS_API_KEY;
      if(!key)return send(res,{error:"POLLINATIONS_API_KEY is not configured on Vercel."},500);
      const promptText=String(body.prompt||"").trim();if(!promptText)return send(res,{error:"No image prompt supplied."},400);
      const url="https://gen.pollinations.ai/image/"+encodeURIComponent(promptText)+"?model=flux&width=1024&height=1024";
      const r=await fetch(url,{headers:{Authorization:"Bearer "+key}});
      if(!r.ok)throw new Error("Pollinations image request failed ("+r.status+")");
      const buf=Buffer.from(await r.arrayBuffer());const type=r.headers.get("content-type")||"image/jpeg";
      return send(res,{image:"data:"+type+";base64,"+buf.toString("base64")});
    }
    return send(res,{error:"Unknown action."},400);
  }catch(error){console.error(error);return send(res,{error:error?.message||"AI request failed."},500);}
}