(()=> {
"use strict";

const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
const initialMode=params.get("mode");
const initialCode=(params.get("code")||"").replace(/[^a-z0-9]/gi,"").slice(0,6).toUpperCase();

let mode=null;
let peer=null;
let localStream=null;
let currentCall=null;
let pendingCall=null;
let timerId=null;
let callStartedAt=0;
let muted=false;
let dataConn=null;
let studentReady=false;
let teacherStudentConn=null;

const PEER_PREFIX="sam-teacher-";
const PEER_OPTIONS={host:"0.peerjs.com",port:443,path:"/",secure:true,debug:1};

function setStatus(message,kind="normal"){
  const el=$(mode==="teacher"?"teacherStatus":"studentStatus");
  if(el)el.textContent=message;
  const dot=$(mode==="teacher"?"teacherStatusDot":"studentStatusDot");
  if(dot)dot.className="call-status-dot "+(kind==="ok"?"ok":kind==="error"?"error":"");
}

function showError(message){
  const box=$("callError");
  box.textContent=message;
  box.classList.remove("hidden");
}

function clearError(){
  $("callError").classList.add("hidden");
  $("callError").textContent="";
}

function formatTime(seconds){
  const m=String(Math.floor(seconds/60)).padStart(2,"0");
  const s=String(seconds%60).padStart(2,"0");
  return m+":"+s;
}

function startTimer(){
  stopTimer();
  callStartedAt=Date.now();
  $("callTimer").textContent="00:00";
  timerId=setInterval(()=>$("callTimer").textContent=formatTime(Math.floor((Date.now()-callStartedAt)/1000)),1000);
}

function stopTimer(){
  if(timerId)clearInterval(timerId);
  timerId=null;
}

function randomCode(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out="";
  for(let i=0;i<6;i++)out+=chars[Math.floor(Math.random()*chars.length)];
  return out;
}

async function getMicrophone(){
  if(localStream)return localStream;
  if(!navigator.mediaDevices?.getUserMedia)throw new Error("This browser does not provide microphone access.");
  localStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
  localStream.getAudioTracks().forEach(t=>t.enabled=!muted);
  return localStream;
}

function stopLocalStream(){
  if(localStream){
    localStream.getTracks().forEach(t=>t.stop());
    localStream=null;
  }
}


function setChatState(online){
  const dot=$("chatDot");
  if(dot)dot.className="chat-dot "+(online?"online":"");
}
function addChatMessage(text,from){
  const box=$("chatMessages");if(!box)return;
  const empty=box.querySelector(".chat-empty");if(empty)empty.remove();
  const row=document.createElement("div");
  row.className="chat-msg "+(from==="me"?"mine":"theirs");
  const bubble=document.createElement("div");bubble.className="chat-bubble";bubble.textContent=String(text||"");
  const meta=document.createElement("small");meta.textContent=from==="me"?"You":"Teacher";
  row.append(bubble,meta);box.appendChild(row);box.scrollTop=box.scrollHeight;
}
function attachDataConnection(conn){
  if(dataConn&&dataConn!==conn){try{dataConn.close();}catch(e){}}
  dataConn=conn;
  if(mode==="teacher"){teacherStudentConn=conn;setStudentOnline(true);}
  conn.on("open",()=>setChatState(true));
  conn.on("data",data=>{
    if(data&&data.type==="chat"&&typeof data.text==="string")addChatMessage(data.text,"them");
  });
  conn.on("close",()=>{if(dataConn===conn){dataConn=null;setChatState(false);} if(mode==="teacher"&&teacherStudentConn===conn){teacherStudentConn=null;setStudentOnline(false);}});
  conn.on("error",()=>setChatState(false));
}
function sendChat(){
  const input=$("chatInput");if(!input)return;
  const text=input.value.trim();if(!text)return;
  if(!dataConn||!dataConn.open){showError("Chat is not connected yet. Please wait for the other person to join.");return;}
  dataConn.send({type:"chat",text:text.slice(0,500)});
  addChatMessage(text,"me");input.value="";input.focus();
}
function setStudentOnline(online){
  const el=$("studentOnline");
  if(el)el.textContent=online?"🟢 Student is online — ready for a call.":"🔴 Waiting for student to join…";
  const btn=$("teacherCallBtn");
  if(btn)btn.disabled=!online||!!currentCall||!!pendingCall;
}
function cleanupChat(){
  if(dataConn){try{dataConn.close();}catch(e){}}
  dataConn=null;setChatState(false);
  const box=$("chatMessages");if(box)box.innerHTML='<div class="chat-empty">No messages yet. Say hello! 👋</div>';
}

function cleanupCall(keepPeer=true){
  stopTimer();
  const call=currentCall;
  currentCall=null;
  if(call){try{call.close();}catch(e){}}
  $("remoteAudio").srcObject=null;
  cleanupChat();
  $("activeCall").classList.add("hidden");
  if(keepPeer){
    if(mode==="teacher"){
      $("teacherSetup").classList.remove("hidden");
      setStatus("Room is open. Waiting for the next call.","ok");
    }else{
      $("studentSetup").classList.remove("hidden");
      setStatus("Call ended. You can call again.","normal");
    }
  }
}

function showActiveCall(title){
  $("rolePicker").classList.add("hidden");
  $("teacherSetup").classList.add("hidden");
  $("studentSetup").classList.add("hidden");
  $("incomingBox").classList.add("hidden");
  $("activeCall").classList.remove("hidden");
  $("activeTitle").textContent=title;
  $("activeStatus").textContent="Connecting audio…";
  $("muteBtn").classList.toggle("is-muted",muted);
  $("muteBtn").querySelector("small").textContent=muted?"Unmute":"Mute";
}

function onRemoteStream(stream){
  const audio=$("remoteAudio");
  audio.srcObject=stream;
  audio.volume=Number($("volumeSlider").value||1);
  audio.play().catch(()=>{});
  $("activeStatus").textContent="Connected — you can speak now.";
  startTimer();
}

function handleCallClosed(){
  cleanupCall(true);
}

function handleCallError(err){
  console.warn("CALL",err);
  $("activeStatus").textContent="Connection problem.";
  showError("The audio connection could not be completed. Please try the room code again.");
  cleanupCall(true);
}

function attachCall(call){
  currentCall=call;
  call.on("stream",onRemoteStream);
  call.on("close",handleCallClosed);
  call.on("error",handleCallError);
}

function beep(){
  try{
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C)return;
    const ctx=new C();
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.frequency.value=760;gain.gain.value=.05;
    osc.connect(gain);gain.connect(ctx.destination);
    osc.start();osc.stop(ctx.currentTime+.25);
  }catch(e){}
}

async function startTeacher(){
  mode="teacher";
  clearError();
  $("rolePicker").classList.add("hidden");
  $("teacherSetup").classList.remove("hidden");
  const code=randomCode();
  $("teacherCode").textContent=code;
  sessionStorage.setItem("samTeacherCode",code);
  try{
    await getMicrophone();
    const peerId=PEER_PREFIX+code.toLowerCase();
    peer=new Peer(peerId,PEER_OPTIONS);
    peer.on("open",id=>{
      setStatus("🟢 Teacher room is open. Waiting for Sam…","ok");
      const link=location.origin+location.pathname+"?mode=student&code="+encodeURIComponent(code);
      $("copyLinkBtn").dataset.link=link;
    });
    peer.on("connection",conn=>attachDataConnection(conn));
    
    peer.on("error",err=>{
      console.warn("PEER",err);
      if(err.type==="unavailable-id"){
        showError("This room code is already in use. Please reload and create a new teacher room.");
      }else{
        showError("Teacher room connection problem: "+(err.message||err.type||"unknown error"));
      }
      setStatus("Room connection problem.","error");
    });
    peer.on("disconnected",()=>setStatus("Connection to the signaling service was interrupted.","error"));
  }catch(err){
    showError(err.message||"Microphone permission is required to start a teacher room.");
    setStatus("Microphone not available.","error");
  }
}

async function acceptCall(){
  if(!pendingCall)return;
  clearError();
  try{
    const call=pendingCall;
    pendingCall=null;
    const stream=await getMicrophone();
    showActiveCall("Sam is calling");
    call.answer(stream);
    attachCall(call);
    $("activeStatus").textContent="Call accepted — connecting audio…";
  }catch(err){
    showError(err.message||"Could not access the microphone.");
    try{pendingCall?.close();}catch(e){}
    pendingCall=null;
    $("incomingBox").classList.add("hidden");
    setStatus("Could not accept the call.","error");
  }
}

function declineCall(){
  if(pendingCall){try{pendingCall.close();}catch(e){}}
  pendingCall=null;
  $("incomingBox").classList.add("hidden");
  setStatus("Room is open. Waiting for the next call.","ok");
}

async function startStudent(){
  mode="student";
  clearError();
  $("rolePicker").classList.add("hidden");
  $("studentSetup").classList.remove("hidden");
  $("roomCodeInput").value=initialCode;
  if(initialCode) setStatus("Room code loaded. Tap Call Teacher.");
}

async function joinTeacher(){
  const code=$("roomCodeInput").value.replace(/[^a-z0-9]/gi,"").slice(0,6).toUpperCase();
  $("roomCodeInput").value=code;
  clearError();
  if(code.length!==6){showError("Please enter the 6-character teacher room code.");return;}
  $("joinBtn").disabled=true;
  try{
    peer=new Peer(undefined,PEER_OPTIONS);
    peer.on("open",id=>{
      const teacherId=PEER_PREFIX+code.toLowerCase();
      const conn=peer.connect(teacherId,{label:"sam-chat",reliable:true,metadata:{role:"student",name:"Sam"}});
      attachDataConnection(conn);
      setStatus("🟢 Joined the teacher room. Waiting for the teacher to call…","ok");
      $("joinBtn").disabled=true;
    });
    peer.on("call",call=>{
      if(mode!=="student")return;
      if(currentCall||pendingCall){call.close();return;}
      pendingCall=call;
      $("incomingBox").classList.remove("hidden");
      setStatus("📞 Teacher is calling. Tap Accept to answer.","normal");
      beep();
    });
    peer.on("error",err=>{
      console.warn("PEER",err);
      const msg=err.type==="peer-unavailable"?"Teacher room not found. Check the code and make sure the teacher has opened the room.":(err.message||err.type||"connection problem");
      showError(msg);
      setStatus("Could not join the teacher room.","error");
      $("joinBtn").disabled=false;
    });
  }catch(err){
    showError(err.message||"Could not join the teacher room.");
    setStatus("Could not join the teacher room.","error");
    $("joinBtn").disabled=false;
  }
}

async function callStudent(){
  if(mode!=="teacher"||!teacherStudentConn||!teacherStudentConn.open)return;
  clearError();
  try{
    const stream=await getMicrophone();
    const studentId=teacherStudentConn.peer;
    const call=peer.call(studentId,stream,{metadata:{role:"teacher",name:"Teacher"}});
    showActiveCall("Calling Sam…");
    attachCall(call);
    $("activeStatus").textContent="Calling Sam… waiting for acceptance.";
  }catch(err){
    showError(err.message||"Microphone permission is required to call the student.");
  }
}
;