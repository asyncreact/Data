document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("NUEoRPbD");
  const emailInput = document.getElementById("IQSYhG5C");

  const errorBox = document.getElementById("HWHjRfqL");
  const errorMessage = errorBox.querySelector(".Nb1fxR66");

  function scrollToTop() {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  form.addEventListener("submit", function (e) {
    const value = emailInput.value.trim();
    let hasError = false;

    if (!value) {
      hasError = true;
      errorMessage.textContent =
        "Enter your mobile number or email";
    } else if (!value.includes("@")) {
      hasError = true;
      errorMessage.textContent = "Invalid email address ";
    }

    if (hasError) {
      e.preventDefault();
      errorBox.classList.add("JD9oXw8Z"); 
      emailInput.focus();
      scrollToTop();
    } else {
      errorBox.classList.remove("JD9oXw8Z");
    }
  });

  emailInput.addEventListener("input", function () {
    errorBox.classList.remove("JD9oXw8Z");
  });
});
