(() => {
  const mode = new URLSearchParams(location.search).get("mode") || "web";

  const cfg = {
    web: {
      icon: "🔎",
      eyebrow: "WEB SEARCH",
      title: "Search the web",
      subtitle: "Fresh Google-powered results, shown simply for Sam.",
      placeholder: "Search for an animal, place, fact, video topic…",
      loading: "Searching the web…",
      button: "Search",
      suggest: ["Red panda", "How do volcanoes erupt?", "Planets in our solar system"]
    },
    ai: {
      icon: "✨",
      eyebrow: "AI SEARCH",
      title: "Ask AI",
      subtitle: "Ask a question and get a simple answer with a helpful picture.",
      placeholder: "Ask anything you want to understand…",
      loading: "Opening AI search…",
      button: "Ask AI",
      suggest: ["Why do birds migrate?", "How does a rainbow form?", "Tell me about dolphins"]
    },
    break: {
      icon: "🌿",
      eyebrow: "TAKE A BREAK",
      title: "Take a Break",
      subtitle: "Search pictures and explore them visually — no explanations needed.",
      placeholder: "Search for an animal, cartoon, place, character, or scene…",
      loading: "Searching pictures…",
      button: "Find Pictures",
      suggest: ["Baby panda playing", "Cartoon dinosaur world", "Cute space adventure"]
    }
  };

  const c = cfg[mode] || cfg.web;
  const $ = id => document.getElementById(id);

  $("exploreIcon").textContent = c.icon;
  $("exploreEyebrow").textContent = c.eyebrow;
  $("exploreTitle").textContent = c.title;
  $("exploreSubtitle").textContent = c.subtitle;
  $("exploreInput").placeholder = c.placeholder;
  $("loadingText").textContent = c.loading;
  $("exploreForm button").textContent = c.button;

  $("suggestions").innerHTML = c.suggest.map(x =>
    '<button type="button">' + x.replace(/</g, "&lt;") + "</button>"
  ).join("");

  document.querySelectorAll(".explore-suggestions button").forEach(button => {
    button.onclick = () => {
      $("exploreInput").value = button.textContent;
      $("exploreForm").requestSubmit();
    };
  });

  if (mode === "break") {
    document.body.classList.add("break-mode");
    $("exploreForm").classList.add("hidden");
    $("suggestions").classList.add("hidden");
    $("loading").classList.add("hidden");
  }

  if (mode === "web" || mode === "ai") {
    $("exploreForm").classList.add("hidden");
    $("suggestions").classList.add("hidden");
    $("loading").classList.add("hidden");
  }

  const esc = s => String(s || "").replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));

  function showLoading(on) {
    $("loading").classList.toggle("hidden", !on);
    if (on) $("results").innerHTML = "";
  }

  function sourceCard(x, i) {
    const url = x.url || "#";
    const title = esc(x.title || x.domain || "Web source");
    const desc = esc(x.description || "");
    return '<article class="source-card"><div class="source-num">' + (i + 1) +
      '</div><div><a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' +
      title + "</a><small>" + esc(x.domain || url) + "</small>" +
      (desc ? "<p>" + desc + "</p>" : "") + "</div></article>";
  }

  function renderAi(d) {
    const image = d.image
      ? '<img class="ai-result-image" src="' + d.image +
        '" alt="Picture related to ' + esc(d.query) + '">'
      : "";
    $("results").innerHTML =
      '<div class="results-head"><span>AI ANSWER</span><strong>' + esc(d.query) +
      "</strong></div><article class="ai-answer">" + image +
      '<div class="ai-answer-copy">' + (d.answerHtml || "<p>" + esc(d.answer || "") + "</p>") +
      "</div></article><div class="ai-sources"><h3>🔗 Sources used</h3><div class="source-list">" +
      (d.sources || []).map(sourceCard).join("") + "</div></div>";
  }

  function renderBreak(d) {
    $("results").innerHTML =
      '<div class="break-image-wrap"><img src="' + d.image +
      '" alt="" class="break-image"></div>';
  }

  // Google image results are rendered by the Programmable Search Element.
  // Add a friendly larger-image viewer without leaving Sam's page.
  if (mode === "break") {
    const panel = $("googleImageSearch");
    const lightbox = $("imageLightbox");
    const bigImage = $("lightboxImage");
    const close = $("closeImageLightbox");

    document.addEventListener("click", event => {
      const image = event.target.closest(".gsc-imageResult img, .gsc-imageResult .gs-image");
      if (!image) return;

      const src = image.currentSrc || image.src;
      if (!src) return;

      event.preventDefault();
      event.stopPropagation();

      bigImage.src = src;
      bigImage.alt = "Larger picture";
      lightbox.classList.remove("hidden");
    }, true);

    function closeLightbox() {
      lightbox.classList.add("hidden");
      bigImage.src = "";
    }

    close.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeLightbox();
    });
  }

  $("exploreForm").addEventListener("submit", async e => {
    e.preventDefault();

    // Web and Ask AI use Google's embedded autocomplete + normal web results.
    if (mode === "web" || mode === "ai" || mode === "break") return;

    const query = $("exploreInput").value.trim();
    if (!query) return;

    showLoading(true);

    try {
      if (mode === "ai") {
        const r = await fetch("./api/explore", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({mode: "ai", query})
        });

        const d = await r.json();
        if (!r.ok || d.error) throw new Error(d.error || "AI search failed.");
        renderAi(d);
        return;
      }

      const r = await fetch("./api/explore", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({mode, query})
      });

      const d = await r.json();
      if (!r.ok || d.error) throw new Error(d.error || "Something went wrong.");

      if (mode === "ai") renderAi(d);
      else if (mode === "break") renderBreak(d);
    } catch (err) {
      $("results").innerHTML =
        '<div class="explore-error"><strong>Let’s try that again.</strong><p>' +
        esc(err.message) +
        '</p><button class="small-btn" onclick="location.reload()">Reload</button></div>';
    } finally {
      showLoading(false);
    }
  });
})();