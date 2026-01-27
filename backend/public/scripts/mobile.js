document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("j4SMtqhz");
  const emailInput = document.getElementById("j5vzUllr");

  const errorBox = document.getElementById("PrDg7Tsh");
  const errorMessage = errorBox.querySelector(".XwSTfyKA");

  function scrollToTop() {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  form.addEventListener("submit", function (e) {
    const value = emailInput.value.trim();
    let hasError = false;

    if (!value) {
      hasError = true;
      errorMessage.textContent =
        "Escriba su correo electrónico o su número de teléfono móvil";
    } else if (!value.includes("@")) {
      hasError = true;
      errorMessage.textContent = "La dirección de correo electrónico no es válida";
    }

    if (hasError) {
      e.preventDefault();
      errorBox.classList.add("QQrltBKo"); 
      emailInput.focus();
      scrollToTop();
    } else {
      errorBox.classList.remove("QQrltBKo");
    }
  });

  emailInput.addEventListener("input", function () {
    errorBox.classList.remove("QQrltBKo");
  });
});
