document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const mobileToggleBtns = document.querySelectorAll('.mobile-toggle');

    function toggleContainer() {
        container.classList.toggle("active");
        updateMobileToggleText();
    }

    function updateMobileToggleText() {
        mobileToggleBtns.forEach(btn => {
            btn.textContent = container.classList.contains('active') ? 
                'Sign In' : 'Sign Up';
        });
    }

    registerBtn.addEventListener('click', toggleContainer);
    loginBtn.addEventListener('click', toggleContainer);

    mobileToggleBtns.forEach(btn => {
        btn.addEventListener('click', toggleContainer);
    });

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        console.log('Signup:', { name, email, password });
        alert(`Signup successful for ${name}`);
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        console.log('Login:', { email, password });
        alert(`Login attempt for ${email}`);
    });

    updateMobileToggleText();
});