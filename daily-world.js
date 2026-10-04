let DATA=null,region="kerala",slide=0,currentPeople=[];
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]));
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
 $("dailyTabs").innerHTML=Object.entries(DATA.categories).map(([key,c])=>'<button class="daily-world-tab '+(key===region?"active":"")+'" data-region="'+esc(key)+'"><span class="daily-world-tab-icon">'+esc(c.icon)+'</span><strong>'+esc(c.title)+'</strong><small>'+c.slides.length+' story slides</small></button>').join("");
 document.querySelectorAll(".daily-world-tab").forEach(b=>b.onclick=()=>{region=b.dataset.region;slide=0;renderTabs();render();});
}
function peopleMarkup(people){
 if(!people?.length)return "";
 return '<div class="daily-world-people"><div class="daily-world-people-label">👥 People to know</div><div class="daily-world-people-list">'+people.map((p,i)=>'<button class="daily-person-chip" data-person="'+i+'">👤 '+esc(p.name)+' <span>›</span></button>').join("")+'</div></div>';
}
function render(){
 const c=DATA.categories[region],s=c.slides[slide];
 currentPeople=s.people||[];
 const tags=currentPeople.length?'<div class="daily-world-image-tags">'+currentPeople.map((p,i)=>'<button class="daily-person-photo-tag" data-person="'+i+'">👤 Meet '+esc(p.name)+'</button>').join("")+'</div>':"";
 const img=s.image?'<img src="'+esc(s.image)+'" alt="'+esc(s.title)+'" loading="eager" onerror="this.parentElement.innerHTML=\'<div class="image-fallback">'+esc(s.emoji)+'</div>\'">':'<div class="image-fallback">'+esc(s.emoji)+'</div>';
 const source=s.sourceUrl?'<a class="daily-source-link" href="'+esc(s.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Read source ↗</a>':"";
 $("dailySlide").innerHTML='<article class="daily-world-slide"><div class="daily-world-image">'+img+tags+'</div><div class="daily-world-copy"><div class="daily-world-kicker">'+esc(c.icon)+' '+esc(c.title.toUpperCase())+' • STORY '+(slide+1)+'</div><h2>'+esc(s.title)+'</h2><p>'+esc(s.summary)+'</p><div class="daily-world-fun">💡 '+esc(s.fun)+'</div>'+peopleMarkup(currentPeople)+'<div class="daily-world-fact">Source: '+esc(s.source)+' '+source+'</div></div></article>';
 document.querySelectorAll("[data-person]").forEach(b=>b.onclick=()=>openPerson(currentPeople[Number(b.dataset.person)]));
 $("dailyCounter").textContent=(slide+1)+" / "+c.slides.length;
 $("dailyProgress").style.width=((slide+1)/c.slides.length*100)+"%";
 $("dailyPrev").disabled=slide===0;
 $("dailyNext").disabled=slide===c.slides.length-1;
 $("quizCTA").classList.toggle("show",region==="world"&&slide===c.slides.length-1);
 window.scrollTo({top:0,behavior:"smooth"});
}
function openPerson(p){
 if(!p)return;
 $("personModalBody").innerHTML='<div class="person-modal-kicker">👤 MEET SOMEONE FROM TODAY’S NEWS</div><h2>'+esc(p.name)+'</h2><div class="person-role">'+esc(p.role||"")+'</div><p>'+esc(p.bio||"")+'</p>'+(p.why?'<div class="person-why"><strong>Why are we seeing them today?</strong><span>'+esc(p.why)+'</span></div>':"")+(p.link?'<a class="person-learn" href="'+esc(p.link)+'" target="_blank" rel="noopener noreferrer">🌐 Learn more from an official source ↗</a>':"");
 $("personModal").classList.add("open"); $("personModal").setAttribute("aria-hidden","false"); document.body.classList.add("modal-open");
}
function closePerson(){ $("personModal").classList.remove("open"); $("personModal").setAttribute("aria-hidden","true"); document.body.classList.remove("modal-open"); }
$("dailyPrev").onclick=()=>{if(slide>0){slide--;render()}};
$("dailyNext").onclick=()=>{const n=DATA.categories[region].slides.length;if(slide<n-1){slide++;render()}};
$("personModalClose").onclick=closePerson;
$("personModal").addEventListener("click",e=>{if(e.target===$("personModal"))closePerson();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closePerson();if(e.key==="ArrowLeft")$("dailyPrev").click();if(e.key==="ArrowRight")$("dailyNext").click()});
boot();