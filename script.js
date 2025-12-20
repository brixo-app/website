// script.js

console.log('testing..');

document.addEventListener("DOMContentLoaded", () => {
  /* ===== FAQ ACCORDION (one open at a time) ===== */
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector(".faq-question");
    const icon = item.querySelector(".faq-icon");

    questionBtn.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Close all
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove("is-open");
          const btn = other.querySelector(".faq-question");
          const icn = other.querySelector(".faq-icon");
          btn.classList.remove("accent");
          btn.setAttribute("aria-expanded", "false");
          icn.textContent = "+";
        }
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add("is-open");
        questionBtn.classList.add("accent");
        questionBtn.setAttribute("aria-expanded", "true");
        icon.textContent = "−";
      } else {
        item.classList.remove("is-open");
        questionBtn.classList.remove("accent");
        questionBtn.setAttribute("aria-expanded", "false");
        icon.textContent = "+";
      }
    });
  });

  // highlight-on-scroll observer (paste inside your DOMContentLoaded)
  (function () {
    const items = document.querySelectorAll(".highlight-on-scroll");
    if (!items.length) return;

    const options = {
      root: null,
      // trigger when ~40% of the element is visible around the viewport center
      rootMargin: "0px 0px -40% 0px",
      threshold: 0
    };

    const onIntersect = (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add("is-active");
        } else {
          el.classList.remove("is-active");
        }
      });
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(onIntersect, options);
      items.forEach((el) => io.observe(el));
    } else {
      // fallback: throttled scroll check
      let ticking = false;
      const check = () => {
        const vh = window.innerHeight;
        const triggerLine = vh * 0.55; // element top should be above ~55% of viewport
        items.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < triggerLine && rect.bottom > vh * 0.15) {
            el.classList.add("is-active");
          } else {
            el.classList.remove("is-active");
          }
        });
        ticking = false;
      };

      window.addEventListener("scroll", () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(check);
        }
      }, { passive: true });

      // initial
      check();
    }
  })();
});
