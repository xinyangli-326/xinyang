/* ============================================================
   李鑫阳 · 求职主页 — 交互脚本
   ============================================================ */

(() => {
  "use strict";

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
})();
