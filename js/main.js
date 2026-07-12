(function () {
  const data = window.PORTFOLIO_DATA;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const toast = $("#toast");
  let activeCategory = "全部";

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function safeText(text) {
    return String(text || "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  }

  function safeUrl(url) {
    return encodeURI(String(url || "")).replace(/"/g, "%22");
  }

  function placeholderSvg(title, category) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 506"><rect width="900" height="506" fill="#eaf5f9"/><rect x="60" y="54" width="780" height="398" rx="30" fill="#fffdf8" stroke="#b8d9e8" stroke-width="3"/><circle cx="450" cy="225" r="62" fill="#d3e8f0"/><path d="M430 190l82 48-82 48z" fill="#5f8fa7"/><rect x="180" y="342" width="540" height="18" rx="9" fill="#b8d9e8"/><text x="450" y="405" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" fill="#253038">${safeText(title)}</text><text x="450" y="96" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="#5f8fa7">${safeText(category || "作品待上传")}</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function renderHero() {
    $("#heroRole").textContent = data.profile.role;
    $("#heroName").textContent = data.profile.name;
    $("#heroTitle").textContent = data.profile.title;
    $("#heroIntro").textContent = data.profile.intro;
    $("#heroStats").innerHTML = data.profile.stats.map((item) => `<div class="stat-item"><strong>${safeText(item.value)}</strong><span>${safeText(item.label)}</span></div>`).join("");
  }

  function renderAbout() {
    $("#aboutText").innerHTML = data.about.paragraphs.map((text) => `<p>${safeText(text)}</p>`).join("");
    $("#traits").innerHTML = data.about.traits.map((trait) => `<span>${safeText(trait)}</span>`).join("");
  }

  function renderFilters() {
    $("#workFilters").innerHTML = data.categories.map((category) => `<button class="${category === activeCategory ? "active" : ""}" type="button" data-category="${safeText(category)}">${safeText(category)}</button>`).join("");
  }

  function renderWorks() {
    const list = activeCategory === "全部" ? data.works : data.works.filter((work) => work.category === activeCategory);
    $("#worksGrid").innerHTML = list.map((work) => {
      const index = data.works.indexOf(work);
      const hasVideo = work.videoReady === true && work.video && !work.contactOnly;
      const coverMarkup = `<img loading="lazy" src="${safeUrl(work.cover || placeholderSvg(work.title, work.category))}" alt="${safeText(work.title)}封面">`;
      const statusText = hasVideo ? "点击播放" : "联系查看";
      const primaryText = hasVideo ? "在线播放" : "联系查看";
      const noteText = hasVideo ? "网页视频为压缩预览版，高清原片可联系本人获取。" : "该作品视频可能因 GitHub 文件大小限制暂未上传，高清原片可通过邮箱联系本人查看。";
      return `<article class="work-card reveal visible"><div class="cover" data-open-work="${index}">${coverMarkup}<span>${statusText}</span></div><div class="work-body"><p class="chip">${safeText(work.category)}</p><h3>${safeText(work.title)}</h3><dl><div><dt>时长</dt><dd>${safeText(work.duration)}</dd></div><div><dt>软件</dt><dd>${safeText(work.software)}</dd></div><div><dt>负责</dt><dd>${safeText(work.responsibility)}</dd></div></dl><p>${safeText(work.summary)}</p><p class="quality-inline">${noteText}</p><div class="card-actions"><button class="btn btn-primary" type="button" data-open-work="${index}">${primaryText}</button><button class="btn btn-ghost" type="button" data-open-work="${index}">查看制作思路</button></div></div></article>`;
    }).join("");
    $$(".cover img").forEach((img) => {
      img.addEventListener("error", () => { img.src = placeholderSvg(img.alt.replace("封面", ""), "作品待上传"); }, { once: true });
    });
  }

  function initVideoCovers() {
    $$(".cover-frame").forEach((frame) => {
      const video = document.createElement("video");
      const targetTime = Number(frame.dataset.previewTime) || 1.5;
      const fallback = $("img", frame);
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.src = frame.dataset.videoSrc;
      video.addEventListener("loadedmetadata", () => {
        const maxTime = Math.max(video.duration - 0.2, 0.1);
        const safeTime = Math.min(Math.max(targetTime, 0.1), maxTime);
        try { video.currentTime = safeTime; } catch (error) {}
      }, { once: true });
      video.addEventListener("seeked", () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
          const context = canvas.getContext("2d");
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = document.createElement("img");
          img.src = canvas.toDataURL("image/jpeg", 0.82);
          img.alt = fallback ? fallback.alt : "作品封面";
          frame.innerHTML = "";
          frame.appendChild(img);
        } catch (error) {
          if (fallback) fallback.classList.add("cover-fallback");
        }
      }, { once: true });
      video.addEventListener("error", () => {
        if (fallback) fallback.classList.add("cover-fallback");
      }, { once: true });
      video.load();
    });
  }

  function openWork(index) {
    const work = data.works[index];
    const hasVideo = work.videoReady === true && work.video && !work.contactOnly;
    $("#modalVideo").innerHTML = hasVideo ? `<video controls preload="metadata" poster="${safeUrl(work.cover)}"><source src="${safeUrl(work.video)}" type="video/mp4">当前浏览器不支持视频播放。</video>` : `<div class="empty-video contact-video">视频暂未公开上传<br><span>可通过邮箱联系本人查看高清原片</span></div>`;
    const qualityText = hasVideo ? "当前视频为压缩预览版，可能存在画质不清晰；如需查看高清原片，可通过邮箱联系本人单独提供。" : "该视频因 GitHub 文件大小限制可能暂未上传，高清原片可通过邮箱联系本人单独查看。";
    $("#modalText").innerHTML = `<p class="chip">${safeText(work.category)}</p><h3>${safeText(work.title)}</h3><p class="quality-note modal-quality-note">${qualityText}</p><div class="modal-grid"><p><strong>视频类型：</strong>${safeText(work.category)}</p><p><strong>制作目的：</strong>${safeText(work.purpose)}</p><p><strong>素材来源：</strong>${safeText(work.source)}</p><p><strong>制作软件：</strong>${safeText(work.software)}</p><p><strong>负责环节：</strong>${safeText(work.responsibility)}</p></div><details open><summary>制作思路</summary><p>${safeText(work.thinking)}</p></details><details open><summary>剪辑亮点</summary><ul>${work.highlights.map((item) => `<li>${safeText(item)}</li>`).join("")}</ul></details>`;
    $("#workModal").classList.add("show");
    $("#workModal").setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    $("#workModal").classList.remove("show");
    $("#workModal").setAttribute("aria-hidden", "true");
    $("#modalVideo").innerHTML = "";
    document.body.classList.remove("modal-open");
  }

  function renderAccountData() {
    $("#accountMetrics").innerHTML = data.accountData.map((item) => `<article class="metric-card"><span>${safeText(item.platform)}</span><strong>${safeText(item.value)}</strong><p>${safeText(item.label)}</p></article>`).join("");
    $("#barChart").innerHTML = data.accountData.map((item) => `<div class="bar-row"><span>${safeText(item.platform)} · ${safeText(item.label)}</span><div><i style="width:${Number(item.number) || 0}%"></i></div><b>${safeText(item.value)}</b></div>`).join("");
    const qrcodes = data.qrcodes.map((item) => `<article class="qrcode-card"><img loading="lazy" src="${safeText(item.path)}" alt="${safeText(item.title)}"><h3>${safeText(item.title)}</h3><p>${safeText(item.note)}</p></article>`).join("");
    $("#qrcodeGrid").innerHTML = qrcodes;
    $("#contactQrcodes").innerHTML = qrcodes;
    $$(".qrcode-card img").forEach((img) => img.addEventListener("error", () => img.classList.add("missing"), { once: true }));
  }

  function renderTimeline(target, list) {
    $(target).innerHTML = list.map((item) => `<article class="timeline-card reveal visible"><span>${safeText(item.period)}</span><h3>${safeText(item.title)}</h3>${item.company ? `<p class="muted">${safeText(item.company)}</p>` : ""}<ul>${item.points.map((point) => `<li>${safeText(point)}</li>`).join("")}</ul></article>`).join("");
  }

  function renderSkills() {
    $("#skillsGrid").innerHTML = data.skills.map((group) => `<article class="skill-card reveal visible"><h3>${safeText(group.group)}</h3><div>${group.items.map(([name, level]) => `<span><b>${safeText(name)}</b><em>${safeText(level)}</em></span>`).join("")}</div></article>`).join("");
  }

  function renderContact() {
    const contact = data.contact;
    const rows = [`<p><strong>姓名：</strong>${safeText(data.profile.name)}</p>`, `<p><strong>求职方向：</strong>${safeText(data.profile.jobTargets.join(" / "))}</p>`, `<p><strong>工作地点：</strong>${safeText(data.profile.location)}</p>`];
    if (contact.showEmail) rows.push(`<p><strong>邮箱：</strong><a href="mailto:${safeText(contact.email)}">${safeText(contact.email)}</a></p>`);
    if (contact.showPhone) rows.push(`<p><strong>手机号：</strong><a href="tel:${safeText(contact.phone)}">${safeText(contact.phone)}</a></p>`);
    if (contact.showWechat) rows.push(`<p><strong>微信：</strong><span id="wechatText">${safeText(contact.wechat)}</span></p>`);
    rows.push(`<p class="muted"><strong>隐私说明：</strong>手机号、微信和完整简历需投递简历后或经本人同意后提供。</p>`);
    $("#contactInfo").innerHTML = rows.join("");
  }

  function handleResume() {
    if (data.site.resumeRequiresPermission) { showToast(data.site.resumeNotice || "简历需经作者本人同意后提供，请先通过邮箱联系。"); return; }
    if (!data.site.resumeUploaded) { showToast("简历文件暂未上传，请通过联系方式获取。"); return; }
    const link = document.createElement("a");
    link.href = safeUrl(data.site.resumePath);
    link.download = data.site.resumePath.split("/").pop();
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function bindEvents() {
    $(".menu-toggle").addEventListener("click", (event) => {
      const button = event.currentTarget;
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      $("#navPanel").classList.toggle("open");
    });
    $("#navPanel").addEventListener("click", () => { $("#navPanel").classList.remove("open"); $(".menu-toggle").setAttribute("aria-expanded", "false"); });
    $("#workFilters").addEventListener("click", (event) => { const button = event.target.closest("button"); if (!button) return; activeCategory = button.dataset.category; renderFilters(); renderWorks(); });
    $("#worksGrid").addEventListener("click", (event) => { const button = event.target.closest("[data-open-work]"); if (button) openWork(Number(button.dataset.openWork)); });
    $$("[data-close]").forEach((node) => node.addEventListener("click", closeModal));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
    $$(".js-resume").forEach((button) => button.addEventListener("click", handleResume));
    const copyWechatButton = $(".js-copy-wechat");
    if (copyWechatButton) {
      copyWechatButton.addEventListener("click", () => showToast("微信需经本人同意后提供，请先通过邮箱联系。"));
    }
    $(".back-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => $(".back-top").classList.toggle("show", window.scrollY > 600), { passive: true });
  }

  function observeSections() {
    if (!("IntersectionObserver" in window)) return;
    const navLinks = $$(".nav-panel a");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    $$("[data-section]").forEach((section) => observer.observe(section));
  }

  function init() {
    if (!data) return;
    document.title = data.site.name;
    renderHero(); renderAbout(); renderFilters(); renderWorks(); renderAccountData();
    renderTimeline("#projectsList", data.projects); renderTimeline("#experienceList", data.experiences);
    renderSkills(); renderContact(); bindEvents(); observeSections();
  }

  init();
})();
