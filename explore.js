(() => {
  const mode=new URLSearchParams(location.search).get("mode")||"web";
  const cfg={
    web:{icon:"🔎",eyebrow:"WEB SEARCH",title:"Search the web",subtitle:"Fresh web results, shown simply for Sam.",placeholder:"Search for an animal, place, fact, video topic…",loading:"Searching the web…",button:"Search",suggest:["Red panda","How do volcanoes erupt?","Planets in our solar system"]},
    ai:{icon:"✨",eyebrow:"AI SEARCH",title:"Ask AI",subtitle:"Ask a question and get a simple answer with a helpful picture.",placeholder:"Ask anything you want to understand…",loading:"Thinking and finding helpful information…",button:"Ask AI",suggest:["Why do birds migrate?","How does a rainbow form?","Tell me about dolphins"]},
    break:{icon:"🌿",eyebrow:"TAKE A BREAK",title:"Take a Break",subtitle:"Type anything. Sam gets a picture — no explanation, no extra text.",placeholder:"Type an animal, cartoon, place, character, or scene…",loading:"Making your picture…",button:"Create Picture",suggest:["A baby panda playing","Cartoon dinosaur world","Cute space adventure"]}
  };
  const c=cfg[mode]||cfg.web;
  const $=id=>document.getElementById(id);
  $("exploreIcon").textContent=c.icon;$("exploreEyebrow").textContent=c.eyebrow;$("exploreTitle").textContent=c.title;$("exploreSubtitle").textContent=c.subtitle;
  $("exploreInput").placeholder=c.placeholder;$("loadingText").textContent=c.loading;$("exploreForm button").textContent=c.button;
  $("suggestions").innerHTML=c.suggest.map(x=>'<button type="button">'+x.replace(/</g,"&lt;")+'</button>').join("");
  document.querySelectorAll(".explore-suggestions button").forEach(b=>b.onclick=()=>{$("exploreInput").value=b.textContent;$("exploreForm").requestSubmit()});
  if(mode==="break") document.body.classList.add("break-mode");
  if(mode==="web"){document.getElementById("exploreForm").classList.add("hidden");document.getElementById("suggestions").classList.add("hidden");document.getElementById("googleWebSearch").classList.remove("hidden");}
  const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  function showLoading(on){$("loading").classList.toggle("hidden",!on);if(on)$("results").innerHTML="";}
  function sourceCard(x,i){
    const url=x.url||"#", title=esc(x.title||x.domain||"Web source"), desc=esc(x.description||"");
    return '<article class="source-card"><div class="source-num">'+(i+1)+'</div><div><a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+title+'</a><small>'+esc(x.domain||url)+'</small>'+ (desc?'<p>'+desc+'</p>':"")+'</div></article>';
  }
  function renderWeb(d){
    $("results").innerHTML='<div class="results-head"><span>WEB RESULTS</span><strong>'+esc(d.query)+'</strong></div>'+
      (d.answer?'<div class="search-summary">'+esc(d.answer)+'</div>':"")+
      '<div class="source-list">'+(d.sources||[]).map(sourceCard).join("")+'</div>'+
      '<a class="open-google" href="https://www.google.com/search?q='+encodeURIComponent(d.query)+'" target="_blank" rel="noopener noreferrer">Open full Google results ↗</a>';
  }
  function renderAi(d){
    const image=d.image?'<img class="ai-result-image" src="'+d.image+'" alt="Picture related to '+esc(d.query)+'">':"";
    $("results").innerHTML='<div class="results-head"><span>AI ANSWER</span><strong>'+esc(d.query)+'</strong></div>'+
      '<article class="ai-answer">'+image+'<div class="ai-answer-copy">'+(d.answerHtml||'<p>'+esc(d.answer||"")+'</p>')+'</div></article>'+
      '<div class="ai-sources"><h3>🔗 Sources used</h3><div class="source-list">'+(d.sources||[]).map(sourceCard).join("")+'</div></div>';
  }
  function renderBreak(d){
    $("results").innerHTML='<div class="break-image-wrap"><img src="'+d.image+'" alt="" class="break-image"></div>';
  }
  // Route Google result clicks to Sam's website viewer page.
  if(mode==="web"){
    document.addEventListener("click",event=>{
      const link=event.target.closest(".gsc-result a.gs-title, .gsc-result a.gs-visibleUrl");
      if(!link) return;
      const href=link.href;
      if(!/^https?:\\/\\//i.test(href)) return;
      event.preventDefault();
      event.stopPropagation();
      const input=document.querySelector(".gsc-input-box input.gsc-input, input.gsc-input");
      const q=input?.value?.trim()||"";
      const returnUrl=location.href.split("#")[0]+(q?"&q="+encodeURIComponent(q):"");
      location.href="site-viewer.html?url="+encodeURIComponent(href)+"&return="+encodeURIComponent(returnUrl);
    },true);
  }
  $("exploreForm").addEventListener("submit",async e=>{
    e.preventDefault();const query=$("exploreInput").value.trim();if(!query)return;
    showLoading(true);
    try{
      if(mode==="web"){window.location.assign("https://www.google.com/search?q="+encodeURIComponent(query));return;} if(mode==="ai"){window.location.assign("https://www.google.com/aimode?q="+encodeURIComponent(query));return;} if(mode==="break"){window.location.assign("https://www.google.com/search?tbm=isch&q="+encodeURIComponent(query));return;} const r=await fetch("./api/explore",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode,query})});
      const d=await r.json();if(!r.ok||d.error)throw new Error(d.error||"Something went wrong.");
      if(mode==="web")renderWeb(d);else if(mode==="ai")renderAi(d);else renderBreak(d);
    }catch(err){
      $("results").innerHTML='<div class="explore-error"><strong>Let’s try that again.</strong><p>'+esc(err.message)+'</p><button class="small-btn" onclick="location.reload()">Reload</button></div>';
    }finally{showLoading(false);}
  });
})();