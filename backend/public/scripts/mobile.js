document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('emailForm');
        const emailInput = document.getElementById('emailInput');
        
        const errorBox = document.getElementById('errorBox');
        const errorMessage = errorBox.querySelector('.auth-error-message');

        function scrollToTop() {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }

        form.addEventListener('submit', function(e) {
            const value = emailInput.value.trim();
            let hasError = false;

            if (!value) {
                hasError = true;
                errorMessage.textContent = "Escriba su correo electrónico o su número de teléfono móvil";
            } 
            else if (!value.includes('@')) {
                hasError = true;
                errorMessage.textContent = "La dirección de correo electrónico no es válida";
            }

            if (hasError) {
                e.preventDefault(); 
                errorBox.classList.add('show-error'); 
                emailInput.focus();
                scrollToTop();
            } else {
                errorBox.classList.remove('show-error');
            }
        });
        
        emailInput.addEventListener('input', function() {
             errorBox.classList.remove('show-error');
        });
    });
