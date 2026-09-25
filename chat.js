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

  if (pin) {
    pinGate.classList.add("hidden");
    chatApp.classList.remove("hidden");
    startPolling();
  }
})();