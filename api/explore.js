function send(res,data,status=200){
  res.status(status);
  res.setHeader("Content-Type","application/json");
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");
  res.end(JSON.stringify(data));
}
async function geminiText(query){
  const key=process.env.GEMINI_API_KEY;
  if(!key) throw new Error("GEMINI_API_KEY is not configured on Vercel.");
  const prompt=`You are helping an 11-year-old learner. Answer the user's question simply and accurately. Use Google Search grounding for current or factual information. Keep the answer to 2-5 short paragraphs or bullets. Do not mention being an AI. USER QUESTION: ${query}`;
  const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key="+encodeURIComponent(key),{
    method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},
    body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],tools:[{google_search:{}}],generationConfig:{maxOutputTokens:900}})
  });
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d?.error?.message||("Gemini search failed ("+r.status+")"));
  const c=d?.candidates?.[0];
  const answer=c?.content?.parts?.map(p=>p.text||"").join("").trim()||"";
  const chunks=c?.groundingMetadata?.groundingChunks||[];
  const sources=[];
  for(const ch of chunks){
    const w=ch?.web;
    if(w?.uri&&!sources.some(s=>s.url===w.uri)) sources.push({url:w.uri,title:w.title||new URL(w.uri).hostname,domain:new URL(w.uri).hostname});
  }
  return {answer,sources};
}
async function geminiImage(query){
  const key=process.env.GEMINI_API_KEY;
  if(!key) return null;
  const prompt=`Create one appealing child-friendly illustration for this question. No words, captions, labels, logos, or UI. Make the picture visually useful for understanding the subject and suitable for an 11-year-old: ${query}`;
  const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent",{
    method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},
    body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{responseModalities:["IMAGE"],imageConfig:{aspectRatio:"4:3",imageSize:"1K"}},tools:[{google_search:{searchTypes:{webSearch:{},imageSearch:{}}}}]})
  });
  const d=await r.json().catch(()=>({}));
  if(!r.ok)return null;
  const parts=d?.candidates?.[0]?.content?.parts||[];
  const p=parts.find(x=>x?.inlineData?.data||x?.inline_data?.data);
  if(!p)return null;
  const data=p.inlineData||p.inline_data;
  return "data:"+(data.mimeType||data.mime_type||"image/png")+";base64,"+data.data;
}
async function pollinationsImage(query){
  const key=process.env.POLLINATIONS_API_KEY;
  if(!key)return null;
  const url="https://gen.pollinations.ai/image/"+encodeURIComponent(query+"; child-friendly, high quality, no text, no logos")+"?model=flux&width=1024&height=768";
  const r=await fetch(url,{headers:{Authorization:"Bearer "+key}});
  if(!r.ok)return null;
  const buf=Buffer.from(await r.arrayBuffer());
  return "data:"+(r.headers.get("content-type")||"image/jpeg")+";base64,"+buf.toString("base64");
}
export default async function handler(req,res){
  if(req.method==="OPTIONS")return send(res,{ok:true});
  if(req.method!=="POST")return send(res,{error:"Method not allowed."},405);
  try{
    const body=typeof req.body==="string"?JSON.parse(req.body||"{}"):(req.body||{});
    const mode=String(body.mode||"web"),query=String(body.query||"").trim().slice(0,300);
    if(!query)return send(res,{error:"Please enter something to search."},400);
    if(mode==="web"){
      const d=await geminiText(query);
      return send(res,{query,...d});
    }
    if(mode==="ai"){
      const [textResult,image] = await Promise.all([geminiText(query),geminiImage(query)]);
      return send(res,{query,answer:textResult.answer,sources:textResult.sources,image:image||null});
    }
    if(mode==="break"){
      const image=await pollinationsImage(query)||await geminiImage(query);
      if(!image)return send(res,{error:"Image generation is not configured yet. Please add GEMINI_API_KEY or POLLINATIONS_API_KEY in Vercel."},503);
      return send(res,{query,image});
    }
    return send(res,{error:"Unknown explore mode."},400);
  }catch(error){
    console.error(error);
    return send(res,{error:error?.message||"Explore request failed."},500);
  }
}