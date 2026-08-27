/* ============================================================
   李鑫阳 · 求职主页 — 交互脚本
   ============================================================ */

(() => {
  "use strict";

  /* ---------- 多语言切换（简体中文 / English） ---------- */
  const I18N = window.I18N || {};
  const urlLang = new URLSearchParams(location.search).get("lang");
  const savedLang = urlLang || "zh";
  let currentLang = savedLang === "en" ? "en" : "zh";

  const syncLinks = (lang) => {
    document.querySelectorAll("a[href]").forEach((a) => {
      const raw = a.getAttribute("href");
      if (!raw || /^(https?:|mailto:|tel:|data:|javascript:)/.test(raw)) return;
      const parts = raw.split("#");
      const base = parts[0];
      if (!base.endsWith(".html")) return;
      const hash = parts.length > 1 ? "#" + parts.slice(1).join("#") : "";
      const url = new URL(base, location.href);
      if (lang === "en") url.searchParams.set("lang", "en");
      else url.searchParams.delete("lang");
      a.setAttribute("href", url.pathname.split("/").pop() + (url.search || "") + hash);
    });
  };

  const syncResume = (lang) => {
    const frame = document.querySelector(".pdf-frame iframe");
    if (frame) frame.src = lang === "en" ? "assets/resume-en.pdf" : "assets/resume.pdf";
    document.querySelectorAll("[data-resume-download]").forEach((a) => {
      a.href = lang === "en" ? "assets/resume-en.pdf" : "assets/resume.pdf";
      a.setAttribute("download", lang === "en" ? "Li-Xinyang-Resume-EN.pdf" : "李鑫阳-产品运营-简历.pdf");
    });
  };

  const applyLang = (lang) => {
    const dict = I18N[lang] || I18N.zh || {};
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const val = dict[el.dataset.i18n];
      if (val !== undefined) el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const val = dict[el.dataset.i18nHtml];
      if (val !== undefined) el.innerHTML = val;
    });

    const titleKey = document.body.dataset.titleKey;
    if (titleKey && dict[titleKey]) document.title = dict[titleKey];

    const metaKey = document.body.dataset.metaKey;
    if (metaKey && dict[metaKey]) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.content = dict[metaKey];
    }

    document.querySelectorAll(".lang-switch button[data-lang]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });

    syncLinks(lang);
    syncResume(lang);

    const url = new URL(location.href);
    if (lang === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    if (url.href !== location.href) history.replaceState(null, "", url.href);
  };

  document.querySelectorAll(".lang-switch button[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang === "en" ? "en" : "zh";
      localStorage.setItem("site-lang", currentLang);
      applyLang(currentLang);
    });
  });

  applyLang(currentLang);

  /* ---------- 联系面板（来聊聊，不跳转） ---------- */
  let contactModal = null;

  const buildContactModal = () => {
    if (contactModal) return contactModal;
    contactModal = document.createElement("div");
    contactModal.className = "contact-modal";
    contactModal.setAttribute("aria-hidden", "true");
    contactModal.innerHTML = `
      <div class="contact-modal-card" role="dialog" aria-modal="true">
        <button type="button" class="lb-btn lb-close" data-contact-close aria-label="Close">×</button>
        <p class="contact-kicker" data-i18n="contact.modal.kicker">来聊聊 ✉</p>
        <h3 data-i18n="contact.modal.title">随时欢迎拍一拍我 🐰</h3>
        <div class="contact-item">
          <span class="contact-item-label" data-i18n="contact.modal.email">📮 邮箱</span>
          <a class="contact-item-value" href="mailto:320589552@qq.com">320589552@qq.com</a>
          <button type="button" class="contact-copy" data-copy="320589552@qq.com" data-i18n="contact.modal.copy">复制</button>
        </div>
        <div class="contact-item">
          <span class="contact-item-label" data-i18n="contact.modal.phone">📞 电话</span>
          <a class="contact-item-value" href="tel:15317270326">15317270326</a>
          <button type="button" class="contact-copy" data-copy="15317270326" data-i18n="contact.modal.copy">复制</button>
        </div>
        <div class="contact-modal-actions">
          <a class="btn btn-primary" href="mailto:320589552@qq.com" data-i18n="contact.modal.mail">写封邮件</a>
        </div>
        <p class="contact-copied" data-i18n="contact.modal.copied">✓ 已复制</p>
      </div>`;
    document.body.appendChild(contactModal);

    contactModal.addEventListener("click", (e) => {
      if (e.target === contactModal || e.target.closest("[data-contact-close]")) closeContact();
    });

    contactModal.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.dataset.copy;
        const done = () => {
          const tip = contactModal.querySelector(".contact-copied");
          tip.classList.add("show");
          clearTimeout(tip._t);
          tip._t = setTimeout(() => tip.classList.remove("show"), 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
        } else {
          fallbackCopy(text, done);
        }
      });
    });

    return contactModal;
  };

  const fallbackCopy = (text, done) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  };

  const openContact = () => {
    const modal = buildContactModal();
    applyLang(currentLang);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeContact = () => {
    if (!contactModal) return;
    contactModal.classList.remove("open");
    contactModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  document.querySelectorAll("[data-contact-open]").forEach((btn) => {
    btn.addEventListener("click", openContact);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && contactModal && contactModal.classList.contains("open")) closeContact();
  });

  /* ---------- 移动端导航 ---------- */
  const burger = document.querySelector(".nav-burger");
  const navLinks = document.querySelector(".nav-links");

  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 当前页导航高亮 ---------- */
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a[data-page]").forEach((a) => {
    if (a.dataset.page === path) a.classList.add("active");
  });

  /* ---------- 滚动渐显 ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- 返回顶部 ---------- */
  const backTop = document.getElementById("backTop");
  if (backTop) {
    const onScroll = () => {
      backTop.classList.toggle("show", window.scrollY > 480);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- 页脚年份 ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 贴纸随机倾斜 ---------- */
  document.querySelectorAll(".sticker").forEach((s) => {
    if (!s.style.getPropertyValue("--r")) {
      const deg = (Math.random() * 16 - 8).toFixed(1);
      s.style.setProperty("--r", deg + "deg");
    }
  });

  /* ---------- 照片轻微鼠标视差 ---------- */
  const polaroid = document.querySelector(".polaroid");
  if (polaroid && window.matchMedia("(pointer: fine)").matches) {
    polaroid.addEventListener("mousemove", (e) => {
      const rect = polaroid.getBoundingClientRect();
      const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
      polaroid.style.transform = `rotate(${dx * 0.3}deg) translate(${dx}px, ${dy}px)`;
    });
    polaroid.addEventListener("mouseleave", () => {
      polaroid.style.transform = "";
    });
  }

  /* ---------- 海报案例 Lightbox（点击图片放大） ---------- */
  const posterGrid = document.querySelector(".poster-grid");
  const lightbox = document.getElementById("lightbox");

  if (posterGrid && lightbox) {
    const imgs = Array.from(posterGrid.querySelectorAll("img[data-full]"));
    const lbImg = lightbox.querySelector("img");
    const lbCount = lightbox.querySelector(".lb-count");
    let current = 0;

    const open = (i) => {
      if (!imgs.length) return;
      current = (i + imgs.length) % imgs.length;
      lbImg.src = imgs[current].dataset.full;
      lbImg.alt = imgs[current].alt || "海报案例";
      if (lbCount) lbCount.textContent = (current + 1) + " / " + imgs.length;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const close = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    posterGrid.addEventListener("click", (e) => {
      const thumb = e.target.closest("img[data-full]");
      if (thumb) open(imgs.indexOf(thumb));
    });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.closest(".lb-close")) close();
      else if (e.target.closest(".lb-prev")) open(current - 1);
      else if (e.target.closest(".lb-next")) open(current + 1);
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") open(current - 1);
      else if (e.key === "ArrowRight") open(current + 1);
    });
  }
})();
