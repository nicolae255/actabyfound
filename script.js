const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Bot protection — injects Web3Forms' honeypot checkbox into every form on
// the page that submits through Web3Forms (contact). It's hidden from real
// visitors via CSS; bots that auto-fill every field tend to check it, and
// Web3Forms silently discards those submissions.
document.querySelectorAll('form:has(input[name="access_key"])').forEach((form) => {
  if (form.querySelector('input[name="botcheck"]')) return;
  const honeypot = document.createElement("input");
  honeypot.type = "checkbox";
  honeypot.name = "botcheck";
  honeypot.style.display = "none";
  honeypot.setAttribute("aria-hidden", "true");
  honeypot.tabIndex = -1;
  honeypot.autocomplete = "off";
  form.appendChild(honeypot);
});

// Custom cursor
const cursorDot = document.querySelector(".cursor-dot");

if (cursorDot && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.body.classList.add("cursor-ready");

  window.addEventListener("mousemove", (e) => {
    cursorDot.style.left = e.clientX + "px";
    cursorDot.style.top = e.clientY + "px";
  });
}

// Story section visibility (drives bar-chart + other in-view effects)
const storySections = document.querySelectorAll(".story-section");

const storyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.3 }
);

storySections.forEach((el) => storyObserver.observe(el));

// Page transition (fade out before internal navigation)
const pageTransition = document.querySelector(".page-transition");

if (pageTransition && !prefersReducedMotion) {
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    const isInternal =
      href &&
      !href.startsWith("#") &&
      !href.startsWith("http") &&
      !href.startsWith("mailto:") &&
      link.target !== "_blank";

    if (!isInternal) return;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      pageTransition.classList.add("is-active");
      window.setTimeout(() => {
        window.location.href = href;
      }, 380);
    });
  });
}

// Intro loader
const loader = document.getElementById("loader");

if (loader) {
  window.setTimeout(() => {
    loader.classList.add("is-hidden");
  }, 700);
}

// Scroll reveal — threshold is a fraction of the target's own height, so a
// tall single-wrapped container (a full blog article body, for example) can
// need more simultaneous on-screen height than a mobile viewport can ever
// show, permanently failing to reveal. Trigger on first pixel instead so it
// works regardless of element height.
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0, rootMargin: "0px 0px -80px 0px" }
);

revealEls.forEach((el) => revealObserver.observe(el));

// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".navbar nav, .story-nav nav");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("is-open");
  });
}

// Magnetic buttons (rect cached on enter, not recomputed every mousemove)
if (window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".btn-primary").forEach((btn) => {
    let rect = null;

    btn.addEventListener("mouseenter", () => {
      rect = btn.getBoundingClientRect();
    });

    btn.addEventListener("mousemove", (e) => {
      if (!rect) return;
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      rect = null;
      btn.style.transform = "";
    });
  });
}

// Cookie consent banner + Google Consent Mode v2
(function () {
  const CONSENT_KEY = "actaCookieConsent";
  const banner = document.getElementById("cookieBanner");
  const acceptBtn = document.getElementById("cookieAccept");
  const declineBtn = document.getElementById("cookieDecline");
  const prefsLinks = document.querySelectorAll(".cookie-prefs-link");

  function updateConsent(granted) {
    if (typeof gtag !== "function") return;
    const state = granted ? "granted" : "denied";
    gtag("consent", "update", {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state,
    });
  }

  function showBanner() {
    if (banner) banner.classList.add("is-visible");
  }

  function hideBanner() {
    if (banner) banner.classList.remove("is-visible");
  }

  const saved = localStorage.getItem(CONSENT_KEY);
  if (saved === "granted") {
    updateConsent(true);
  } else if (saved === "denied") {
    updateConsent(false);
  } else if (banner) {
    showBanner();
  }

  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "granted");
      updateConsent(true);
      hideBanner();
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "denied");
      updateConsent(false);
      hideBanner();
    });
  }

  prefsLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showBanner();
    });
  });
})();

// Main contact forms (Contact page + homepage embedded form) — submits via
// Web3Forms instead of a mailto fallback (access_key lives in each form's
// hidden field — set to Acta's own Web3Forms key before launch).
document.querySelectorAll("#contact-form, #story-contact-form").forEach((form) => {
  const status = form.nextElementSibling && form.nextElementSibling.classList.contains("form-status")
    ? form.nextElementSibling
    : null;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "...";
    if (status) status.textContent = "";
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("Request failed");
      form.reset();
      if (status) status.textContent = status.dataset.success || "Thanks — we'll be in touch soon.";
    } catch (err) {
      if (status) status.textContent = status.dataset.error || "Something went wrong. Please try again.";
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
});

// CTA click tracking — pushes a labeled event to dataLayer for every button-styled
// element clicked (nav, hero, service pages, forms, cookie banner).
// GTM picks this up via a Custom Event trigger listening for "cta_click" and forwards
// cta_label/cta_location/cta_href to GA4 as event parameters.
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-primary, .btn-ghost");
  if (!btn) return;

  const section = btn.closest("[id]");
  let location = "unknown";
  if (btn.closest("header")) {
    location = "header_nav";
  } else if (btn.closest("footer")) {
    location = "footer";
  } else if (btn.closest(".cookie-banner")) {
    location = "cookie_banner";
  } else if (section) {
    location = section.id;
  } else if (btn.closest(".page-hero")) {
    location = "page_hero";
  } else if (btn.closest(".cta-band")) {
    location = "cta_band";
  } else if (btn.closest(".contact-layout")) {
    location = "contact_form_area";
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "cta_click",
    cta_label: btn.textContent.trim(),
    cta_location: location,
    cta_href: btn.getAttribute("href") || null,
  });
});
