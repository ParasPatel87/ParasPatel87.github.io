"use strict";
(() => {
  const menu = document.querySelector(".menu-toggle");
  const navigation = document.getElementById("navigation");
  const closeMenu = () => {
    navigation.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  };
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("open", open);
  });
  navigation.addEventListener("click", (event) => { if (event.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") { closeMenu(); menu.focus(); }
  });
  const publications = window.PROFILE_PUBLICATIONS || [];
  const list = document.getElementById("publication-list");
  const count = document.getElementById("publication-count");
  const search = document.getElementById("publication-search");
  const yearButtons = [...document.querySelectorAll("[data-year]")];
  if (!list || !search || !count) return;
  document.querySelector(".publication-controls").hidden = false;
  let selectedYear = "all";
  let toastTimer;
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const showToast = (message) => {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
  };
  const paperUrl = (paper) => paper.url || "https://scholar.google.com/scholar?q=" + encodeURIComponent(paper.title);
  const externalLink = (label, url, className) => {
    const link = element("a", className, label);
    link.href = url; link.target = "_blank"; link.rel = "noopener";
    return link;
  };
  const fold = (text) => text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  function render() {
    const query = fold(search.value.trim());
    const filtered = publications.filter((paper) =>
      (selectedYear === "all" || String(paper.year) === selectedYear) &&
      fold([paper.title, paper.authors, paper.journal, paper.details, paper.type, paper.year].join(" ")).includes(query)
    );
    list.replaceChildren();
    const journalCount = filtered.filter(p => p.type === "journal").length;
    const preprintCount = filtered.filter(p => p.type === "preprint").length;
    count.textContent = journalCount + " journal article" + (journalCount === 1 ? "" : "s") +
      " · " + preprintCount + " preprint" + (preprintCount === 1 ? "" : "s") +
      (query || selectedYear !== "all" ? " matching your filters" : "");
    if (!filtered.length) { list.append(element("p", "empty-state", "No publications match. Try another search or select All years.")); return; }
    filtered.forEach((paper) => {
      const article = element("article", "publication");
      const meta = element("div", "publication-meta");
      meta.append(element("div", "publication-year", String(paper.year)), element("span", "publication-id", paper.id));
      const content = element("div", "publication-content");
      const title = element("h2");
      if (paper.type === "preprint") title.append(element("span", "preprint-tag", "PREPRINT"));
      title.append(document.createTextNode(paper.title));
      const authors = element("p", "publication-authors");
      const authorPieces = paper.authors.split("Paras Patel");
      authorPieces.forEach((part, index) => {
        authors.append(document.createTextNode(part));
        if (index < authorPieces.length - 1) authors.append(element("strong", "", "Paras Patel"));
      });
      const journal = element("p", "publication-journal", paper.journal + " · " + paper.details + " (" + paper.year + ")");
      const actions = element("div", "paper-actions");
      const citationButton = element("button", "copy-citation", "Copy citation");
      citationButton.type = "button";
      citationButton.setAttribute("aria-label", "Copy citation for " + paper.title);
      citationButton.addEventListener("click", async () => {
        const citation = paper.authors + '. "' + paper.title.replace(/\.$/, "") + '." ' + paper.journal + " " + paper.details + " (" + paper.year + ").";
        try { await navigator.clipboard.writeText(citation); showToast("Citation copied"); }
        catch {
          let fallback = content.querySelector(".citation-fallback");
          if (!fallback) {
            fallback = element("textarea", "citation-fallback");
            fallback.readOnly = true;
            fallback.setAttribute("aria-label", "Citation text; select and copy");
            content.append(fallback);
          }
          fallback.value = citation; fallback.focus(); fallback.select();
          showToast("Citation selected — use Ctrl+C or Copy");
        }
      });
      actions.append(externalLink(paper.url ? "Read preprint" : "Find on Scholar", paperUrl(paper)), citationButton);
      content.append(title, authors, journal, actions);
      article.append(meta, content);
      list.append(article);
    });
  }
  yearButtons.forEach(button => button.addEventListener("click", () => {
    selectedYear = button.dataset.year;
    yearButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active); item.setAttribute("aria-pressed", String(active));
    });
    render();
  }));
  search.addEventListener("input", render); render();
})();