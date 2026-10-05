(() => {
  const $ = id => document.getElementById(id);
  const pinGate = $("pinGate");
  const chatApp = $("chatApp");
  const setupNotice = $("setupNotice");
  const messagesEl = $("messages");
  const pinForm = $("pinForm");
  const pinInput = $("pinInput");
  const pinError = $("pinError");
  const chatForm = $("chatForm");
  const messageInput = $("messageInput");
  const chatStatus = $("chatStatus");
  const connectionText = $("connectionText");
  const connectionDot = $("connectionDot");
  const emojiTray = $("emojiTray");

  let pin = sessionStorage.getItem("familyChatPin") || "";
  let pollTimer = null;
  let firstRender = true;

  function setConnection(ok, text) {
    connectionText.textContent = text;
    connectionDot.classList.toggle("online", !!ok);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, ch => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[ch]));
  }

  function formatTime(value) {
    try {
      return new Date(value).toLocaleString([], { day:"numeric", month:"short", hour:"numeric", minute:"2-digit" });
    } catch (_) { return ""; }
  }

  function renderMessages(items) {
    if (!items || !items.length) {
      messagesEl.innerHTML = '<div class="family-empty"><div>🌿</div><strong>No messages yet</strong><p>When Mum or Dad sends a message to the connected family WhatsApp number, it will appear here.</p></div>';
      return;
    }
    messagesEl.innerHTML = items.map(msg => {
      const mine = msg.sender === "sam";
      const label = mine ? "Sam" : (msg.sender === "mum" ? "Mum" : "Dad");
      const avatar = mine ? "⭐" : (msg.sender === "mum" ? "💗" : "💙");
      const media = msg.media_url ? '<a class="chat-media-link" href="' + escapeHtml(msg.media_url) + '" target="_blank" rel="noopener">📎 Open media</a>' : "";
      return '<article class="family-message ' + (mine ? "mine" : "theirs") + '">' +
        '<div class="family-message-meta"><span>' + avatar + " " + label + '</span><time>' + formatTime(msg.created_at) + '</time></div>' +
        '<div class="family-bubble">' + (msg.body ? escapeHtml(msg.body).replace(/\n/g,"<br>") : "") + media + '</div>' +
      '</article>';
    }).join("");
    if (firstRender) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
      firstRender = false;
    }
  }

  async function api(path, options = {}) {
    const headers = Object.assign({ "Content-Type":"application/json", "X-Family-Pin":pin }, options.headers || {});
    const response = await fetch(path, Object.assign({}, options, { headers }));
    let data = {};
    try { data = await response.json(); } catch (_) {}
    if (!response.ok) {
      const error = new Error(data.error || "Family chat request failed.");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function loadMessages() {
    try {
      const data = await api("/api/family-chat?action=messages");
      renderMessages(data.messages || []);
      setConnection(true, data.configured ? "WhatsApp family connection is ready" : "Chat page ready");
      if (!data.configured) setupNotice.classList.remove("hidden");
    } catch (error) {
      if (error.status === 401) {
        sessionStorage.removeItem("familyChatPin");
        pin = "";
        chatApp.classList.add("hidden");
        pinGate.classList.remove("hidden");
        showPinError("That PIN is not correct.");
        stopPolling();
        return;
      }
      if (error.status === 503) {
        setupNotice.classList.remove("hidden");
        setConnection(false, "WhatsApp connection needs setup");
      } else {
        setConnection(false, "Connection unavailable");
        chatStatus.textContent = error.message;
      }
    }
  }

  function startPolling() {
    stopPolling();
    loadMessages();
    pollTimer = setInterval(loadMessages, 4000);
  }

  function stopPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
  }

  function showPinError(text) {
    pinError.textContent = text;
    pinError.classList.remove("hidden");
  }

  pinForm.addEventListener("submit", async event => {
    event.preventDefault();
    const value = pinInput.value.trim();
    if (!value) return;
    pin = value;
    sessionStorage.setItem("familyChatPin", pin);
    pinError.classList.add("hidden");
    pinGate.classList.add("hidden");
    chatApp.classList.remove("hidden");
    firstRender = true;
    await loadMessages();
    startPolling();
  });

  chatForm.addEventListener("submit", async event => {
    event.preventDefault();
    const body = messageInput.value.trim();
    if (!body) return;
    messageInput.disabled = true;
    chatStatus.textContent = "Sending…";
    try {
      await api("/api/family-chat", {
        method:"POST",
        body:JSON.stringify({ body })
      });
      messageInput.value = "";
      chatStatus.textContent = "Sent to Mum & Dad.";
      await loadMessages();
    } catch (error) {
      chatStatus.textContent = error.message;
    } finally {
      messageInput.disabled = false;
      messageInput.focus();
    }
  });

  $("emojiBtn").addEventListener("click", () => emojiTray.classList.toggle("hidden"));
  emojiTray.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    messageInput.value += button.textContent;
    messageInput.focus();
    emojiTray.classList.add("hidden");
  });

  $("gifBtn").addEventListener("click", () => {
    chatStatus.textContent = "GIF sending will be enabled when the WhatsApp media connection is configured.";
  });


  const gifPanel=$("gifPanel"),gifGrid=$("gifGrid"),gifSearch=$("gifSearch"),stickerPanel=$("stickerPanel"),stickerGrid=$("stickerGrid"),stickerStage=$("stickerStage"),stickerLarge=$("stickerLarge");
  const mediaItems=[
    ['😂','Laughing','funny laugh lol'],['🤣','Rolling','funny laugh lol'],['😎','Cool','cool awesome'],['🤩','Wow','wow excited'],['🥳','Party','party celebrate'],['🎉','Celebrate','party celebrate'],['❤️','Love','love heart'],['😍','Love it','love heart'],['🥰','Cute','cute love'],['👍','Thumbs up','yes good'],['👏','Clap','clap celebrate'],['🙌','Yay','happy celebrate'],['😱','OMG','wow surprise'],['🤯','Mind blown','wow surprise'],['😴','Sleepy','sleep tired'],['🤪','Silly','funny silly'],['🐶','Dog','dog animal puppy'],['🐱','Cat','cat animal kitten'],['🐰','Bunny','rabbit animal cute'],['🦊','Fox','fox animal'],['🐼','Panda','panda animal cute'],['🐨','Koala','koala animal cute'],['🦁','Lion','lion animal'],['🐯','Tiger','tiger animal'],['🐸','Frog','frog animal'],['🐵','Monkey','monkey animal funny'],['🦄','Unicorn','unicorn magic'],['🦋','Butterfly','butterfly nature'],['🐝','Bee','bee animal'],['🌈','Rainbow','rainbow happy'],['⭐','Star','star wow'],['🔥','Fire','fire cool'],['⚡','Energy','energy wow'],['🚀','Rocket','space rocket'],['🌍','Earth','earth world'],['🍕','Pizza','food pizza'],['🍦','Ice cream','food sweet'],['🍔','Burger','food'],['⚽','Football','sports game'],['🏆','Winner','win champion'],['🎮','Gaming','game play'],['💯','Perfect','good win'],['🙏','Thank you','thanks'],['🤗','Hug','hug happy'],['😇','Angel','angel good'],['💪','Strong','strong power'],['✨','Sparkle','magic sparkle'],['🌟','Superstar','star happy']
  ];
  function renderGifGrid(q=''){const words=q.toLowerCase().trim();const items=mediaItems.filter(x=>!words||x[1].toLowerCase().includes(words)||x[2].includes(words));gifGrid.innerHTML=items.map(x=>'<button class="gif-tile" type="button" data-gif="'+x[0]+'"><span>'+x[0]+'</span><small>'+x[1]+'</small></button>').join('')||'<div class="media-empty">Try another word — animal, funny, happy, food, wow…</div>';}
  renderGifGrid();gifSearch.addEventListener('input',()=>renderGifGrid(gifSearch.value));
  $("gifBtn").addEventListener("click",()=>{gifPanel.classList.toggle("hidden");stickerPanel.classList.add("hidden");if(!gifPanel.classList.contains("hidden")){gifSearch.focus();renderGifGrid();}});
  $("closeGifPanel").addEventListener("click",()=>gifPanel.classList.add("hidden"));
  gifGrid.addEventListener("click",e=>{const b=e.target.closest('.gif-tile');if(!b)return;messageInput.value+=' '+b.dataset.gif;messageInput.focus();gifPanel.classList.add('hidden');chatStatus.textContent='GIF-style sticker added. Send it!';});
  const stickers=[['🐱','Cat Zoom','Meow!'],['🐶','Happy Dog','Woof!'],['🐰','Bunny Hop','Boing!'],['🦊','Fox Dance','Let’s go!'],['🐼','Panda Bounce','Yay!'],['🦄','Magic Unicorn','Sparkle!'],['🐸','Frog Jump','Boing!'],['🦁','Lion Roar','ROAR!'],['🐵','Monkey Fun','Ooh ooh!'],['🦋','Butterfly','Flutter!'],['🚀','Rocket','3…2…1!'],['🎉','Party','Woohoo!'],['🏆','Champion','I did it!'],['⚡','Super Energy','Zap!'],['🌈','Rainbow','So colourful!'],['🍕','Pizza Time','Yummy!'],['⚽','Goal','GOAL!'],['💯','Perfect','Amazing!'],['😂','Big Laugh','Hahaha!'],['🤩','Wow','WOW!']];
  stickerGrid.innerHTML=stickers.map((x,i)=>'<button class="sticker-tile" type="button" data-sticker="'+i+'"><span>'+x[0]+'</span><small>'+x[1]+'</small></button>').join('');
  $("stickerBtn").addEventListener("click",()=>{stickerPanel.classList.toggle("hidden");gifPanel.classList.add("hidden")});$("closeStickerPanel").addEventListener("click",()=>stickerPanel.classList.add("hidden"));
  stickerGrid.addEventListener("click",e=>{const b=e.target.closest('.sticker-tile');if(!b)return;const x=stickers[+b.dataset.sticker];stickerPanel.classList.add('hidden');stickerLarge.innerHTML='<div class="sticker-big-emoji">'+x[0]+'</div><strong>'+x[1]+'</strong><small>'+x[2]+'</small>';stickerStage.classList.remove('hidden');stickerStage.classList.add('sticker-playing');setTimeout(()=>{stickerStage.classList.remove('sticker-playing');setTimeout(()=>stickerStage.classList.add('hidden'),800)},60000);});

  if (pin) {
    pinGate.classList.add("hidden");
    chatApp.classList.remove("hidden");
    startPolling();
  }
})();