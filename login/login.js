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

    // Handle signup form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.message);
                container.classList.remove("active"); // Switch to login form after successful signup
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred during signup');
        });
    });

    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                console.log("visgsy");
                window.location.href = "../staffDashboard/staff.html";  // Corrected line for redirection
                console.log('Logged in user:', data.user);  // You can handle user session here
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred during login');
        });
    });

    updateMobileToggleText();
});
