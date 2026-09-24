function send(res,data,status=200){res.status(status);res.setHeader("Content-Type","application/json");res.setHeader("Access-Control-Allow-Origin","*");res.setHeader("Access-Control-Allow-Headers","Content-Type");res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");res.end(JSON.stringify(data));}
function extractObject(text){
  const s=String(text||"").replace(/^\s*```json\s*/i,"").replace(/\s*```\s*$/i,"").trim();
  const a=s.indexOf("{"),b=s.lastIndexOf("}");return JSON.parse(a>=0&&b>=0?s.slice(a,b+1):s);
}
const prompt=`You create accessible visual lessons for an 11-year-old learner. Preserve the source meaning and do not invent facts. Return ONLY valid JSON with exactly these fields: title, keyIdeas (3 concise factual bullets), discovery (one simple conceptual sentence), memory (short memorable phrase), imagePrompt (a detailed prompt for a clear educational illustration). Use concrete calm child-friendly language. If an image is supplied, read the visible text and diagrams carefully. The imagePrompt must represent the actual page concept, not a generic decorative image. Do not ask the image generator to render lots of text.`;
async function callGemini(parts, responseMimeType="application/json"){
  const key=process.env.GEMINI_API_KEY;if(!key)throw new Error("GEMINI_API_KEY is not configured on Vercel.");
  const models=["gemini-3.5-flash-lite","gemini-3.8-flash","gemini-3.6-flash"];
  let lastError=null;
  for(const model of models){
    for(let attempt=0;attempt<3;attempt++){
      try{
        const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent?key="+encodeURIComponent(key),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts}],generationConfig:{responseMimeType,temperature:0.2}})});
        const d=await r.json().catch(()=>({}));
        if(r.ok)return extractObject(d?.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("")||"");
        lastError=new Error(d?.error?.message||("Gemini request failed ("+r.status+")"));
        if(![429,500,502,503,504].includes(r.status))break;
      }catch(e){lastError=e;}
      await new Promise(resolve=>setTimeout(resolve,800*Math.pow(2,attempt)));
    }
  }
  throw lastError||new Error("Gemini is temporarily unavailable. Please try again.");
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
      return send(res,{lesson:await gemini(parts)});
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