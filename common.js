document.addEventListener("DOMContentLoaded", () => {
  /* ===== MOBILE MENU ===== */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileMenuClose = document.querySelector(".mobile-menu-close");
  const body = document.body;
  const menuLinks = document.querySelectorAll("[data-menu-link]");

  function openMenu() {
    mobileMenu.classList.add("is-open");
    body.classList.add("no-scroll");
    mobileMenu.setAttribute("aria-hidden", "false");
  }

  function closeMenu() {
    mobileMenu.classList.remove("is-open");
    body.classList.remove("no-scroll");
    mobileMenu.setAttribute("aria-hidden", "true");
  }

  if (navToggle) {
    navToggle.addEventListener("click", openMenu);
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", closeMenu);
  }

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  /* Optional: close on Escape */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  /* ===== WAITLIST FORM SUBMISSION ===== */
  (function () {
    const form = document.querySelector(".waitlist-form");
    if (!form) return;

    const input = form.querySelector(".waitlist-input");
    const submitBtn = form.querySelector(".waitlist-submit");
    const spinner = form.querySelector(".svg-spinner");
    const msgError = document.querySelector(".error-message");
    const msgSuccess = document.querySelector(".success-message");

    // button icons inside the submit button
    const iconDefault = submitBtn.querySelector("img.default");
    const iconError = submitBtn.querySelector("img.error");
    const iconSuccess = submitBtn.querySelector("img.success");

    // Helper: email validator
    function isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
      return re.test(email.trim());
    }

    // UI helpers
    function clearMessages() {
      if (msgError) msgError.style.display = "none";
      if (msgSuccess) msgSuccess.style.display = "none";
    }

    function showError(message) {
      if (msgError) {
        msgError.textContent = message || "Please enter a valid email address.";
        msgError.style.display = "block";
      }
      if (iconDefault) iconDefault.style.display = "none";
      if (iconSuccess) iconSuccess.style.display = "none";
      if (iconError) iconError.style.display = "block";
    }

    function showSuccess(message) {
      if (msgSuccess) {
        msgSuccess.textContent = message || "Awesome! You’re in. You’ll shortly receive an email with the next steps.";
        msgSuccess.style.display = "block";
      }
      if (iconDefault) iconDefault.style.display = "none";
      if (iconError) iconError.style.display = "none";
      if (iconSuccess) iconSuccess.style.display = "block";
    }

    function setLoading(loading) {
      if (loading) {
        if (spinner) spinner.style.display = "block";
        if (iconDefault) iconDefault.style.display = "none";
        if (iconError) iconError.style.display = "none";
        if (iconSuccess) iconSuccess.style.display = "none";
        submitBtn.setAttribute("aria-busy", "true");
      } else {
        if (spinner) spinner.style.display = "none";
        submitBtn.removeAttribute("aria-busy");
      }
    }

    function setControlsEnabled(enabled) {
      input.disabled = !enabled;
      submitBtn.disabled = !enabled;
    }

    // ---- Supabase helper (fetch-only) ----
    // Replace the URL and anon key
    async function saveEmailToSupabase(email) {
      // return { ok: true };
      const SUPABASE_URL = "https://bzxradkuuuckbdnfxhgy.supabase.co"; // <- replace
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6eHJhZGt1dXVja2JkbmZ4aGd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNDkwOTYsImV4cCI6MjA4MDkyNTA5Nn0.hkJwZzJ3YRyXcLvSXqnoWZgwcLl6Fz2di7KnWc-Vgfc"; // <- replace

      const endpoint = `${SUPABASE_URL}/rest/v1/waitlist_signups`;

      // Timeout via AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({ email: email.trim() }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.ok) return { ok: true };

        const text = await res.text();

        if (res.status === 409 || /duplicate/i.test(text)) {
          // return { ok: false, code: "duplicate", message: "This email is already on the waitlist." };
          return { ok: true };
        }
        if (res.status === 401 || res.status === 403) {
          return { ok: false, code: "auth", message: "Permission denied. Check RLS/policy and anon key." };
        }

        return { ok: false, code: "error", message: text || `Insert failed (status ${res.status})` };
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === "AbortError") {
          return { ok: false, code: "timeout", message: "Request timed out. Try again." };
        }
        return { ok: false, code: "network", message: "Network error. Check connection." };
      }
    }
    // ---- end supabase helper ----

    // Initial state
    clearMessages();
    if (spinner) spinner.style.display = "none";
    if (iconError) iconError.style.display = "none";
    if (iconSuccess) iconSuccess.style.display = "none";
    if (iconDefault) iconDefault.style.display = "block";

    // Submit handler
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      clearMessages();

      const email = input.value || "";
      if (!isValidEmail(email)) {
        showError("Please enter a valid email address.");
        input.focus();
        return;
      }

      // Prepare UI for request
      setControlsEnabled(false);
      setLoading(true);

      // Call Supabase helper
      const result = await saveEmailToSupabase(email);

      setLoading(false);

      if (result.ok) {
        showSuccess();
        input.value = "";
        setControlsEnabled(false); // keep disabled to avoid spamming — change if you want
        localStorage.setItem('email', email);
        setTimeout(() => {
          window.location.href = "/add-funds";
        }, 2000);
        return;
      }

      // Handle error cases
      if (result.code === "duplicate") {
        showError("This email is already on the waitlist.");
      } else if (result.code === "auth") {
        showError("Server permission issue. Please contact the admin.");
        console.error("Supabase auth/policy error:", result.message);
      } else if (result.code === "timeout" || result.code === "network") {
        showError(result.message);
      } else {
        showError("Something went wrong. Please try again.");
        console.error("Supabase insert error:", result);
      }

      setControlsEnabled(true);
    });
  })();
});
