(() => {
  const params=new URLSearchParams(location.search);
  const raw=params.get("url")||"";
  const returnUrl=params.get("return")||"explore.html?mode=web";
  const title=document.getElementById("viewerTitle");
  const urlLabel=document.getElementById("viewerUrl");
  const frame=document.getElementById("siteFrame");
  const fallback=document.getElementById("frameFallback");
  const back=document.getElementById("backToSearch");
  const open=document.getElementById("openWebsite");
  const openFallback=document.getElementById("openWebsiteFallback");

  let target="";
  try{
    const u=new URL(raw);
    if(u.protocol!=="http:"&&u.protocol!=="https:") throw new Error("Unsupported URL");
    target=u.href;
  }catch{
    title.textContent="Invalid website";
    urlLabel.textContent="The selected link is not a valid web address.";
    frame.classList.add("hidden");
    fallback.classList.remove("hidden");
    open.classList.add("hidden");
    openFallback.classList.add("hidden");
    return;
  }

  let host="";
  try{host=new URL(target).hostname.replace(/^www\./,"");}catch{}
  title.textContent=host||"Website";
  urlLabel.textContent=target;
  back.href=returnUrl;
  open.onclick=()=>window.open(target,"_blank","noopener,noreferrer");
  openFallback.onclick=()=>window.open(target,"_blank","noopener,noreferrer");

  let loaded=false;
  frame.onload=()=>{
    loaded=true;
    fallback.classList.add("hidden");
    frame.classList.remove("hidden");
  };
  frame.src=target;

  // X-Frame-Options/CSP blocks often do not fire iframe.onerror.
  // Give allowed pages time to load, then show a safe external-link fallback.
  setTimeout(()=>{
    if(!loaded){
      fallback.classList.remove("hidden");
      frame.classList.add("hidden");
    }
  },8000);
})();