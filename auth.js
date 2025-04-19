// auth.js - Handles authentication related functionality

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        // If not on the login or register page, redirect to login
        if (
            !window.location.pathname.includes('index.html') && 
            !window.location.pathname.includes('register.html') && 
            !window.location.pathname.includes('forgot-password.html')
        ) {
            window.location.href = 'index.html';
        }
        return false;
    }
    
    // If on login or register page and already logged in, redirect to home
    if (
        window.location.pathname.includes('index.html') || 
        window.location.pathname.includes('register.html') || 
        window.location.pathname.includes('forgot-password.html')
    ) {
        window.location.href = 'home.html';
    }
    
    return true;
}

// Handle login form submission
function handleLogin(event) {
    if (event) {
        event.preventDefault();
    }
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple validation
    if (!email || !password) {
        showError('Please enter both email and password.');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Logging in...';
    
    // Make API request to login endpoint
    fetch('php/login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store the token and user info
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to home page
            window.location.href = 'home.html';
        } else {
            showError(data.message || 'Login failed. Please check your credentials.');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showError('An error occurred during login. Please try again.');
    })
    .finally(() => {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Login';
    });
}

// Handle registration form submission
function handleRegister(event) {
    if (event) {
        event.preventDefault();
    }
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Simple validation
    if (!username || !email || !password) {
        showError('Please fill in all fields.');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match.');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Creating account...';
    
    // Make API request to register endpoint
    fetch('php/register.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store the token and user info
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to home page
            window.location.href = 'home.html';
        } else {
            showError(data.message || 'Registration failed. Please try again.');
        }
    })
    .catch(error => {
        console.error('Registration error:', error);
        showError('An error occurred during registration. Please try again.');
    })
    .finally(() => {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Register';
    });
}

// Handle forgot password form submission
function handleForgotPassword(event) {
    if (event) {
        event.preventDefault();
    }
    
    const email = document.getElementById('email').value;
    
    // Simple validation
    if (!email) {
        showError('Please enter your email address.');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#forgotPasswordForm button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';
    
    // Make API request to forgot password endpoint
    fetch('php/forgot-password.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            showSuccess('Password reset instructions have been sent to your email address.');
            document.getElementById('forgotPasswordForm').reset();
        } else {
            showError(data.message || 'Failed to send reset link. Please try again.');
        }
    })
    .catch(error => {
        console.error('Forgot password error:', error);
        showError('An error occurred. Please try again.');
    })
    .finally(() => {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Reset Link';
    });
}

// Handle logout
function handleLogout() {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// Show error message
function showError(message) {
    // Check if error element exists, if not create it
    let errorElement = document.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.color = 'var(--error-color)';
        errorElement.style.padding = '1rem';
        errorElement.style.marginTop = '1rem';
        errorElement.style.backgroundColor = 'rgba(176, 0, 32, 0.1)';
        errorElement.style.borderRadius = '4px';
        
        // Insert after the form
        const form = document.querySelector('form');
        if (form) {
            form.parentNode.insertBefore(errorElement, form.nextSibling);
        }
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    // Check if success element exists, if not create it
    let successElement = document.querySelector('.success-message');
    if (!successElement) {
        successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.style.color = 'var(--secondary-dark)';
        successElement.style.padding = '1rem';
        successElement.style.marginTop = '1rem';
        successElement.style.backgroundColor = 'rgba(3, 218, 198, 0.1)';
        successElement.style.borderRadius = '4px';
        
        // Insert after the form
        const form = document.querySelector('form');
        if (form) {
            form.parentNode.insertBefore(successElement, form.nextSibling);
        }
    }
    
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 5000);
}

// Initialize authentication on document load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    checkAuth();
    
    // Set up event listeners for auth forms
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Set up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // If logged in, set user info in UI
    if (checkAuth()) {
        setupUserInfo();
    }
});

// Set up user info in UI elements
function setupUserInfo() {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) return;
    
    // Set username in header
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = userData.username;
    }
    
    // Set welcome message
    const welcomeUsernameElement = document.getElementById('welcomeUsername');
    if (welcomeUsernameElement) {
        welcomeUsernameElement.textContent = userData.username;
    }
    
    // Set avatar (if available)
    const userAvatarElement = document.getElementById('userAvatar');
    if (userAvatarElement && userData.profile_pic) {
        userAvatarElement.src = userData.profile_pic;
    }
}

// User dropdown toggle
document.addEventListener('DOMContentLoaded', function() {
    const userDropdownBtn = document.getElementById('userDropdownBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userDropdownBtn && userDropdown) {
        userDropdownBtn.addEventListener('click', function(e) {
            e.preventDefault();
            userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userDropdownBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.style.display = 'none';
            }
        });
    }
});
