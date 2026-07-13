(function () {
  const data = window.PORTFOLIO_DATA;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const toast = $("#toast");
  let activeCategory = "全部";
  let reelIndex = 0;
  let reelTimer = null;

  function safeText(text) {
    return String(text || "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  }

  function safeUrl(url) {
    return encodeURI(String(url || "")).replace(/"/g, "%22");
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2300);
  }

  function placeholderSvg(title, category) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760"><rect width="1200" height="760" fill="#f6f2ea"/><rect x="74" y="70" width="1052" height="620" rx="34" fill="#e9edf6" stroke="#c7c3df" stroke-width="3"/><circle cx="600" cy="350" r="86" fill="#fffdf8"/><path d="M570 300l95 56-95 56z" fill="#6d7898"/><text x="92" y="124" font-family="Arial,sans-serif" font-size="26" fill="#6d7898">${safeText(category || "Selected Work")}</text><text x="92" y="650" font-family="Arial,sans-serif" font-size="46" font-weight="700" fill="#242426">${safeText(title)}</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function externalLinks(work) {
    return Array.isArray(work.externalLinks) ? work.externalLinks.filter((link) => link && link.url) : [];
  }

  function renderHero() {
    $("#heroIntro").textContent = data.profile.intro;
    renderReel();
    reelTimer = setInterval(() => {
      reelIndex = (reelIndex + 1) % data.works.length;
      renderReel();
    }, 3600);
  }

  function renderReel() {
    const work = data.works[reelIndex] || data.works[0];
    $("#heroReel").innerHTML = `<img src="${safeUrl(work.cover || placeholderSvg(work.title, work.category))}" alt="${safeText(work.title)}封面"><span>Auto Play Reel</span>`;
    $("#reelCategory").textContent = work.category;
    $("#reelTitle").textContent = work.title;
    $("#reelOpen").onclick = () => openWork(data.works.indexOf(work));
  }

  function renderFilters() {
    $("#workFilters").innerHTML = data.categories.map((category) => `<button class="${category === activeCategory ? "active" : ""}" type="button" data-category="${safeText(category)}">${safeText(category)}</button>`).join("");
  }

  function renderWorks() {
    const list = activeCategory === "全部" ? data.works : data.works.filter((work) => work.category === activeCategory);
    $("#worksGrid").innerHTML = list.map((work, localIndex) => {
      const index = data.works.indexOf(work);
      const links = externalLinks(work);
      const lead = localIndex === 0 && activeCategory === "全部";
      return `<article class="case ${lead ? "case-large" : ""} reveal" data-open-work="${index}">
        <figure>
          <img loading="lazy" src="${safeUrl(work.cover || placeholderSvg(work.title, work.category))}" alt="${safeText(work.title)}封面">
          <figcaption>${links.length ? "Netdisk Preview" : "Contact Preview"}</figcaption>
        </figure>
        <div class="case-copy">
          <p>${safeText(work.category)}</p>
          <h3>${safeText(work.title)}</h3>
          <span>${safeText(work.software)}</span>
          <button class="text-link" type="button">查看网盘视频</button>
        </div>
      </article>`;
    }).join("");
    $$("#worksGrid img").forEach((img) => {
      img.addEventListener("error", () => { img.src = placeholderSvg(img.alt.replace("封面", ""), "Selected Work"); }, { once: true });
    });
    revealNow();
  }

  function renderPerformance() {
    const combined = [...data.profile.stats, ...data.accountData.slice(0, 2)];
    $("#accountMetrics").innerHTML = combined.slice(0, 6).map((item) => `<article class="metric reveal"><strong>${safeText(item.value)}</strong><span>${safeText(item.label || item.platform)}</span></article>`).join("");
  }

  function renderTimeline(target, list) {
    $(target).innerHTML = list.map((item) => `<article class="timeline-item reveal"><time>${safeText(item.period)}</time><div><h3>${safeText(item.title)}</h3>${item.company ? `<p>${safeText(item.company)}</p>` : ""}<ul>${item.points.slice(0, 3).map((point) => `<li>${safeText(point)}</li>`).join("")}</ul></div></article>`).join("");
  }

  function renderSkills() {
    $("#skillsGrid").innerHTML = data.skills.map((group) => `<section class="skill-group reveal"><h3>${safeText(group.group)}</h3><div>${group.items.map(([name, level]) => `<span><b>${safeText(name)}</b><em>${safeText(level)}</em></span>`).join("")}</div></section>`).join("");
  }

  function renderContact() {
    const rows = [
      `<p><b>${safeText(data.profile.name)}</b></p>`,
      `<p>${safeText(data.profile.jobTargets.join(" / "))}</p>`,
      `<p>${safeText(data.profile.location)}</p>`
    ];
    if (data.contact.showEmail) rows.push(`<p><a href="mailto:${safeText(data.contact.email)}">${safeText(data.contact.email)}</a></p>`);
    rows.push(`<p class="muted">手机号、微信和完整简历需投递简历后或经本人同意后提供。</p>`);
    $("#contactInfo").innerHTML = rows.join("");

    $("#contactQrcodes").innerHTML = data.qrcodes.map((item, index) => `<article class="qr-card" tabindex="0" role="button" data-open-qrcode="${index}"><img loading="lazy" src="${safeUrl(item.path)}" alt="${safeText(item.title)}"><span>${safeText(item.title)}</span></article>`).join("");
    $$("#contactQrcodes img").forEach((img) => img.addEventListener("error", () => img.closest(".qr-card").classList.add("missing"), { once: true }));
  }

  function openWork(index) {
    const work = data.works[index];
    const links = externalLinks(work);
    const linkMarkup = links.length ? links.map((link) => `<a class="btn btn-dark" href="${safeUrl(link.url)}" target="_blank" rel="noopener">${safeText(link.platform || "打开网盘")}</a>${link.code ? `<p class="share-code">${safeText(link.platform)}提取码：<b>${safeText(link.code)}</b></p>` : ""}`).join("") : `<p class="empty-note">该作品可通过邮箱联系本人查看高清原片。</p>`;
    $("#modalVisual").innerHTML = `<img src="${safeUrl(work.cover || placeholderSvg(work.title, work.category))}" alt="${safeText(work.title)}封面"><div class="netdisk-panel"><strong>查看作品视频</strong><p>视频以网盘形式提供，便于保留清晰画质。</p><div>${linkMarkup}</div></div>`;
    $("#modalText").innerHTML = `<p class="eyebrow">${safeText(work.category)}</p><h3>${safeText(work.title)}</h3><p>${safeText(work.summary)}</p><dl><div><dt>制作软件</dt><dd>${safeText(work.software)}</dd></div><div><dt>负责内容</dt><dd>${safeText(work.responsibility)}</dd></div><div><dt>制作目的</dt><dd>${safeText(work.purpose)}</dd></div></dl><details open><summary>制作思路</summary><p>${safeText(work.thinking)}</p></details>`;
    $("#workModal").classList.add("show");
    $("#workModal").setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    $("#workModal").classList.remove("show");
    $("#workModal").setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function openQrModal(item) {
    $("#qrModalImage").src = safeUrl(item.path);
    $("#qrModalImage").alt = `${item.title}放大图`;
    $("#qrModalTitle").textContent = item.title;
    $("#qrModalNote").textContent = item.note || "扫码查看作品或联系本人";
    $("#qrModal").classList.add("show");
    $("#qrModal").setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeQrModal() {
    $("#qrModal").classList.remove("show");
    $("#qrModal").setAttribute("aria-hidden", "true");
    $("#qrModalImage").removeAttribute("src");
    document.body.classList.remove("modal-open");
  }

  function handleResume() {
    showToast(data.site.resumeNotice || "简历需经作者本人同意后提供，请先通过邮箱联系。");
  }

  function bindEvents() {
    $(".menu-toggle").addEventListener("click", (event) => {
      const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
      event.currentTarget.setAttribute("aria-expanded", String(!expanded));
      $("#navPanel").classList.toggle("open");
    });
    $("#navPanel").addEventListener("click", () => {
      $("#navPanel").classList.remove("open");
      $(".menu-toggle").setAttribute("aria-expanded", "false");
    });
    $("#workFilters").addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      activeCategory = button.dataset.category;
      renderFilters();
      renderWorks();
    });
    $("#worksGrid").addEventListener("click", (event) => {
      const card = event.target.closest("[data-open-work]");
      if (card) openWork(Number(card.dataset.openWork));
    });
    $("#contactQrcodes").addEventListener("click", (event) => {
      const card = event.target.closest("[data-open-qrcode]");
      if (card) openQrModal(data.qrcodes[Number(card.dataset.openQrcode)]);
    });
    $$("[data-close]").forEach((node) => node.addEventListener("click", closeModal));
    $$("[data-qr-close]").forEach((node) => node.addEventListener("click", closeQrModal));
    $$(".js-resume").forEach((button) => button.addEventListener("click", handleResume));
    $(".back-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => $(".back-top").classList.toggle("show", window.scrollY > 680), { passive: true });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
        closeQrModal();
      }
    });
  }

  function observeSections() {
    const navLinks = $$(".nav-panel a");
    if (!("IntersectionObserver" in window)) return;
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-44% 0px -44% 0px" });
    $$("[data-section]").forEach((section) => sectionObserver.observe(section));

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, { threshold: 0.12 });
    $$(".reveal").forEach((item) => revealObserver.observe(item));
  }

  function revealNow() {
    requestAnimationFrame(() => $$(".reveal").forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight * 0.92) item.classList.add("visible");
    }));
  }

  function init() {
    if (!data) return;
    document.title = data.site.name;
    renderHero();
    renderFilters();
    renderWorks();
    renderPerformance();
    renderTimeline("#experienceList", data.experiences);
    renderTimeline("#projectsList", data.projects);
    renderSkills();
    renderContact();
    bindEvents();
    observeSections();
    revealNow();
  }
  init();
})();
