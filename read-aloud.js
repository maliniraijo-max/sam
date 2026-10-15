(function () {
  "use strict";
  const currentFile = location.pathname.split("/").pop() || "";
  const selectedSubject = (new URLSearchParams(location.search).get("subject") || "").toLowerCase();
  if (/^(hindi|malayalam)/i.test(currentFile) || /^(hindi|malayalam|malayalam1|malayalam2)$/.test(selectedSubject)) return;
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
  const STYLE_ID = "sam-read-aloud-style";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = ".sam-read-aloud-btn{display:inline-flex;align-items:center;gap:6px;min-height:34px;margin:6px 5px 3px 0;padding:7px 11px;border:1px solid #b8d7e6;border-radius:999px;background:#f0f9ff;color:#24536b;font:700 12px/1.2 Arial,sans-serif;cursor:pointer;touch-action:manipulation;vertical-align:middle}.sam-read-aloud-btn:hover{background:#e0f2fe}.sam-read-aloud-btn:focus-visible{outline:3px solid #60a5fa;outline-offset:2px}.sam-read-aloud-btn[aria-pressed=true]{background:#dff7e8;border-color:#8ac9a1;color:#185b39}@media(prefers-reduced-motion:reduce){.sam-read-aloud-btn{transition:none}}@media print{.sam-read-aloud-btn{display:none!important}}";
    document.head.appendChild(style);
  }
  let activeButton = null, activeUtterance = null, observer = null;
  const BLOCK_SELECTOR = "h1,h2,h3,h4,h5,p,li,blockquote,dt,dd,figcaption,.question,.q,.qcard,.overview,.summary,.reading-panel,.activity,.explanation,.prompt,.review-block,.answer-key,.story-door,.stage,.model,.discovery-text,.gym-principle";
  const EXTRA_BLOCK_SELECTOR = ".chapter-body,.panel,.card,.section,.worksheet-section,.reading-block,.lesson-block";
  const CONTAINER_SELECTOR = ".question,.q,.qcard,.overview,.summary,.reading-panel,.activity,.explanation,.prompt,.review-block,.answer-key,.story-door,.stage,.model,.discovery-text,.gym-principle";
  function cleanText(el) {
    const copy = el.cloneNode(true);
    copy.querySelectorAll("button,input,textarea,select,option,script,style,.sam-read-aloud-btn,[aria-hidden=true],.sr-only,.visually-hidden").forEach(n => n.remove());
    return (copy.innerText || copy.textContent || "").replace(/\s+/g, " ").trim();
  }
  function hasReadableChild(el) { return !!el.querySelector(BLOCK_SELECTOR); }
  function suitable(el) {
    if (!(el instanceof HTMLElement) || el.dataset.samReadAloudReady === "1") return false;
    if (el.closest("nav,header nav,footer,form,button,a,script,style,svg,table thead,[data-no-read-aloud]")) return false;
    if (el.matches("input,textarea,select,option,button,a,script,style,small,.sam-read-aloud-btn")) return false;
    if (el.closest(".sam-read-aloud-btn") || el.querySelector(".sam-read-aloud-btn")) return false;
    const text = cleanText(el);
    if (text.length < 16 || text.length > 1800) return false;
    if ((el.matches(EXTRA_BLOCK_SELECTOR) || el.matches(CONTAINER_SELECTOR)) && hasReadableChild(el)) return false;
    return true;
  }
  function bestVoice() {
    const voices = window.speechSynthesis.getVoices() || [];
    const english = voices.filter(v => /^en([-_]|$)/i.test(v.lang || ""));
    const candidates = english.length ? english : voices;
    const femaleHints = /female|woman|zira|samantha|susan|karen|moira|tessa|ava|jenny|aria|sara|veena|heera|priya|neerja|google uk english female/i;
    const indian = candidates.filter(v => /en[-_]in/i.test(v.lang || ""));
    return indian.find(v => femaleHints.test(v.name)) || candidates.find(v => femaleHints.test(v.name)) || indian[0] || candidates.find(v => /natural|neural|premium/i.test(v.name)) || candidates[0] || null;
  }
  function stopSpeech() {
    window.speechSynthesis.cancel();
    if (activeButton) {
      activeButton.textContent = "🔊 Read aloud";
      activeButton.setAttribute("aria-pressed", "false");
      activeButton.setAttribute("aria-label", "Read this block aloud");
    }
    activeButton = null; activeUtterance = null;
  }
  function speakBlock(el, button) {
    if (activeButton === button) { stopSpeech(); return; }
    stopSpeech();
    const text = cleanText(el);
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = bestVoice();
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang || "en-IN"; }
    else utterance.lang = document.documentElement.lang || "en-IN";
    utterance.rate = 0.68; utterance.pitch = 1.08; utterance.volume = 1;
    activeButton = button; activeUtterance = utterance;
    button.textContent = "⏹ Stop reading";
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", "Stop reading this block");
    utterance.onend = utterance.onerror = function () { if (activeUtterance === utterance) stopSpeech(); };
    window.speechSynthesis.speak(utterance);
  }
  function addButton(el) {
    if (!suitable(el)) return;
    if (!cleanText(el)) return;
    el.dataset.samReadAloudReady = "1";
    const button = document.createElement("button");
    button.type = "button"; button.className = "sam-read-aloud-btn"; button.textContent = "🔊 Read aloud";
    button.setAttribute("aria-label", "Read this block aloud"); button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", function (event) { event.preventDefault(); event.stopPropagation(); speakBlock(el, button); });
    el.appendChild(button);
  }
  function scan(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    if (root instanceof Element && root.matches(BLOCK_SELECTOR + "," + EXTRA_BLOCK_SELECTOR)) addButton(root);
    root.querySelectorAll(BLOCK_SELECTOR + "," + EXTRA_BLOCK_SELECTOR).forEach(addButton);
  }
  function start() {
    scan(document);
    observer = new MutationObserver(function (records) {
      records.forEach(function (record) { record.addedNodes.forEach(function (node) {
        if (node.nodeType === 1 && !node.classList.contains("sam-read-aloud-btn")) scan(node);
      }); });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("pagehide", function () { stopSpeech(); if (observer) observer.disconnect(); }, { once: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start();
})();