/* =========================================================
   법무법인 정감 — 인터랙션
   ========================================================= */
(function () {
  "use strict";

  /* ---- 0. 유입페이지 판별 (경로/파라미터 기반) ---- */
  window.__leadSource = (function () {
    var p = location.pathname.toLowerCase();
    if (p.indexOf("cafe") > -1) return "카페";
    if (p.indexOf("blog") > -1) return "블로그";
    var q = new URLSearchParams(location.search).get("src");
    if (q === "cafe") return "카페";
    if (q === "blog") return "블로그";
    return "메인";
  })();

  /* ---- 0-2. 구글시트 전송 ---- */
  /* ↓↓↓ 앱스스크립트 웹앱 URL(.../exec)을 아래 따옴표 안에 붙여넣으세요 ↓↓↓ */
  var SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwVKpHSg1U1v19vxtNtXRirN11DfZFWddF1SkPH6GDHIc84ZWhGxRGPBf0OHHSiHGxq/exec";
  function postLead(data) {
    if (!SHEET_ENDPOINT) return;
    try {
      fetch(SHEET_ENDPOINT, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) }).catch(function () {});
    } catch (e) {}
  }

  /* ---- 1. 헤더 스크롤 상태 ---- */
  var header = document.getElementById("header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 10) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- 1-2. 히어로 배경 영상 (모바일 자동재생 보정) ---- */
  var heroVideo = document.querySelector(".hero__video");
  if (heroVideo) {
    heroVideo.muted = true;            // 자동재생 조건
    heroVideo.setAttribute("muted", "");
    var tryPlay = function () {
      var p = heroVideo.play();
      if (p && p.catch) p.catch(function () {});
    };
    tryPlay();
    // 일부 모바일(저전력 모드 등)은 자동재생을 막으므로 첫 상호작용 시 재시도
    ["touchstart", "click", "scroll"].forEach(function (ev) {
      window.addEventListener(ev, tryPlay, { once: true, passive: true });
    });
    // 탭 복귀 시 재생 재개
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) tryPlay();
    });
    heroVideo.addEventListener("canplay", tryPlay);
  }

  /* ---- 1-3. 2번 섹션 중앙 점: 스크롤에 따라 위→아래 이동 ---- */
  var scGrid = document.querySelector(".showcase__grid");
  if (scGrid) {
    var moveDot = function () {
      var rect = scGrid.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // 섹션이 화면에 들어오기 시작하면 0, 다 지나가면 1
      var p = (vh - rect.top) / (vh + rect.height);
      p = Math.max(0, Math.min(1, p));
      scGrid.style.setProperty("--dot", (p * 100).toFixed(2) + "%");
    };
    moveDot();
    window.addEventListener("scroll", moveDot, { passive: true });
    window.addEventListener("resize", moveDot, { passive: true });
  }

  /* ---- 1-4. 5단계 번호 순차 점등 ---- */
  var processEl = document.querySelector(".process");
  if (processEl && "IntersectionObserver" in window) {
    var lio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { processEl.classList.add("is-lit"); lio.unobserve(processEl); }
      });
    }, { threshold: 0.3 });
    lio.observe(processEl);
  } else if (processEl) {
    processEl.classList.add("is-lit");
  }

  /* ---- 1-5. 자가진단 체크리스트 순차 체크 효과 ---- */
  var checklist = document.getElementById("checklist");
  if (checklist && "IntersectionObserver" in window) {
    var kio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { checklist.classList.add("is-checked"); kio.unobserve(checklist); }
      });
    }, { threshold: 0.3 });
    kio.observe(checklist);
  } else if (checklist) {
    checklist.classList.add("is-checked");
  }

  /* ---- 2. 모바일 드로어 ---- */
  var toggle = document.getElementById("navToggle");
  var drawer = document.getElementById("mobileDrawer");
  var scrim = document.getElementById("drawerScrim");

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    scrim.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  if (toggle && drawer && scrim) {
    var openDrawer = function () {
      drawer.classList.add("is-open");
      scrim.classList.add("is-open");
      toggle.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      drawer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    toggle.addEventListener("click", function () {
      drawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
    });
    scrim.addEventListener("click", closeDrawer);
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
  }

  /* ---- 3. FAQ 아코디언 ---- */
  document.querySelectorAll(".faq__item").forEach(function (item) {
    var btn = item.querySelector(".faq__q");
    var ans = item.querySelector(".faq__a");
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      // 다른 항목 닫기 (한 번에 하나)
      document.querySelectorAll(".faq__item.is-open").forEach(function (o) {
        if (o !== item) {
          o.classList.remove("is-open");
          o.querySelector(".faq__q").setAttribute("aria-expanded", "false");
          o.querySelector(".faq__a").style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        ans.style.maxHeight = null;
      } else {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        ans.style.maxHeight = ans.scrollHeight + "px";
      }
    });
  });

  /* ---- 4. 스크롤 등장 애니메이션 ---- */
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- 5. 통계 숫자 카운트업 ---- */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var dur = 1400, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString("ko-KR");
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString("ko-KR");
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var heroIsMobile = window.matchMedia("(max-width: 600px)").matches;
    if (heroIsMobile) {
      /* 모바일: 카운트업 효과 없이 최종 값만 바로 표시 */
      counters.forEach(function (el) {
        var t = parseInt(el.getAttribute("data-count"), 10);
        el.textContent = t.toLocaleString("ko-KR");
      });
    } else {
      var cio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              cio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---- 5-2. 통계 숫자 카운트업 (화면에 보이는 동안 반복) ---- */
  var agCounts = document.querySelectorAll(".ag-count");
  if (agCounts.length) {
    var agAnimate = function (el) {
      var target = parseInt(el.getAttribute("data-agcount"), 10);
      var dur = 1500, startTs = null;
      function tick(ts) {
        if (!startTs) startTs = ts;
        var p = Math.min((ts - startTs) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString("ko-KR");
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString("ko-KR");
      }
      requestAnimationFrame(tick);
    };
    var agRunAll = function () { agCounts.forEach(agAnimate); };
    var agTimer = null;
    var statsSec = document.getElementById("stats");
    if ("IntersectionObserver" in window && statsSec) {
      var aio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            agRunAll();
            if (!agTimer) agTimer = window.setInterval(agRunAll, 4500);
          } else if (agTimer) {
            window.clearInterval(agTimer); agTimer = null;
          }
        });
      }, { threshold: 0.3 });
      aio.observe(statsSec);
    } else {
      agRunAll();
      window.setInterval(agRunAll, 4500);
    }
  }

  /* ---- 6. 상담 신청 폼 (데모: 실제 전송 백엔드 연동 필요) ---- */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#cf-name").value.trim();
      var phone = form.querySelector("#cf-phone").value.trim();
      var agree = form.querySelector("#cf-agree").checked;

      note.className = "contact-form__note";
      if (!name || !phone) {
        note.textContent = "성함과 연락처를 입력해 주세요.";
        note.classList.add("is-err");
        return;
      }
      if (!agree) {
        note.textContent = "개인정보 수집 및 이용에 동의해 주세요.";
        note.classList.add("is-err");
        return;
      }
      postLead({
        name: name,
        phone: phone,
        debt: (form.querySelector("#cf-debt") || {}).value || "",
        time: (form.querySelector("#cf-time") || {}).value || "",
        source: window.__leadSource || "메인"
      });
      note.textContent = "상담 신청이 접수되었습니다. 곧 연락드리겠습니다. 감사합니다.";
      note.classList.add("is-ok");
      form.reset();
    });
  }

  /* ---- 7. 맨 위로 버튼 ---- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 500) toTop.classList.add("is-visible");
      else toTop.classList.remove("is-visible");
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- 8-2. 상담 폼 신규/재상담 토글 ---- */
  var cfToggle = document.getElementById("cfToggle");
  if (cfToggle) {
    var cfBtns = cfToggle.querySelectorAll(".cf-toggle__btn");
    cfBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        cfBtns.forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
      });
    });
  }

  /* ---- 9. 게시판 탭 활성화 ---- */
  var boardTabs = document.getElementById("boardTabs");
  if (boardTabs) {
    var tabs = boardTabs.querySelectorAll(".board__tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
      });
    });
  }

  /* ---- 10. 주소 복사 ---- */
  var copyBtn = document.getElementById("copyAddr");
  var addrText = document.getElementById("addrText");
  if (copyBtn && addrText) {
    copyBtn.addEventListener("click", function () {
      var text = addrText.textContent.trim();
      var done = function () {
        var orig = copyBtn.textContent;
        copyBtn.textContent = "✓";
        setTimeout(function () { copyBtn.textContent = orig; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    });
  }

  /* ---- 11. 상담 신청 팝업 (모달) ---- */
  var cmodal = document.getElementById("consultModal");
  if (cmodal) {
    var cmForm = document.getElementById("cmodalForm");
    var cmDone = document.getElementById("cmodalDone");
    var consultForm = document.getElementById("consultForm");

    var openCmodal = function (e) {
      if (e) e.preventDefault();
      cmForm.hidden = false;
      cmDone.hidden = true;
      cmodal.classList.add("is-open");
      cmodal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    var closeCmodal = function () {
      cmodal.classList.remove("is-open");
      cmodal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    document.querySelectorAll('[data-modal="consult"]').forEach(function (o) {
      o.addEventListener("click", openCmodal);
    });
    cmodal.querySelectorAll("[data-close]").forEach(function (c) {
      c.addEventListener("click", closeCmodal);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && cmodal.classList.contains("is-open")) closeCmodal();
    });

    if (consultForm) {
      consultForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var nm = document.getElementById("cm-name").value.trim();
        var ph = document.getElementById("cm-phone").value.trim();
        var ag = document.getElementById("cm-agree").checked;
        if (!nm || !ph) { alert("성함과 연락처를 입력해 주세요."); return; }
        if (!ag) { alert("개인정보 수집·이용에 동의해 주세요."); return; }
        postLead({
          name: nm,
          phone: ph,
          debt: (document.getElementById("cm-debt") || {}).value || "",
          time: (document.getElementById("cm-time") || {}).value || "",
          source: window.__leadSource || "메인"
        });
        cmForm.hidden = true;
        cmDone.hidden = false;
      });
    }
  }
})();
