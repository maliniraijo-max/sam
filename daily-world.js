let DATA=null,region="kerala",slide=0;
const $=id=>document.getElementById(id);
async function boot(){
 try{
  const r=await fetch("daily-world.json?"+Date.now(),{cache:"no-store"});
  DATA=await r.json();
  $("dailyDate").textContent=DATA.displayDate;
  $("dailyIntro").textContent=DATA.intro;
  renderTabs(); render();
 }catch(e){
  $("dailySlide").innerHTML='<div class="daily-world-slide"><div class="daily-world-copy"><div class="daily-world-kicker">TODAY’S EDITION</div><h2>News adventure is loading…</h2><p>Please refresh in a moment.</p></div></div>';
 }
}
function renderTabs(){
 $("dailyTabs").innerHTML=Object.entries(DATA.categories).map(([key,c])=>'<button class="daily-world-tab '+(key===region?"active":"")+'" data-region="'+key+'"><span class="daily-world-tab-icon">'+c.icon+'</span><strong>'+c.title+'</strong><small>'+c.slides.length+' story slides</small></button>').join("");
 document.querySelectorAll(".daily-world-tab").forEach(b=>b.onclick=()=>{region=b.dataset.region;slide=0;renderTabs();render();});
}
function render(){
 const c=DATA.categories[region],s=c.slides[slide];
 const img=s.image?'<img src="'+s.image+'" alt="'+s.title+'" loading="eager" onerror="this.parentElement.innerHTML=\'<div class="image-fallback">'+s.emoji+'</div>\'">':'<div class="image-fallback">'+s.emoji+'</div>';
 $("dailySlide").innerHTML='<article class="daily-world-slide"><div class="daily-world-image">'+img+'</div><div class="daily-world-copy"><div class="daily-world-kicker">'+c.icon+' '+c.title.toUpperCase()+' • STORY '+(slide+1)+'</div><h2>'+s.title+'</h2><p>'+s.summary+'</p><div class="daily-world-fun">💡 '+s.fun+'</div><div class="daily-world-fact">Source: '+s.source+'</div></div></article>';
 $("dailyCounter").textContent=(slide+1)+" / "+c.slides.length;
 $("dailyProgress").style.width=((slide+1)/c.slides.length*100)+"%";
 $("dailyPrev").disabled=slide===0;
 $("dailyNext").disabled=slide===c.slides.length-1;
 $("quizCTA").classList.toggle("show",region==="world"&&slide===c.slides.length-1);
 window.scrollTo({top:0,behavior:"smooth"});
}
$("dailyPrev").onclick=()=>{if(slide>0){slide--;render()}};
$("dailyNext").onclick=()=>{const n=DATA.categories[region].slides.length;if(slide<n-1){slide++;render()}};
document.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")$("dailyPrev").click();if(e.key==="ArrowRight")$("dailyNext").click()});
boot();