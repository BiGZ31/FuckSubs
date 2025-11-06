// Slideshow control
let currentSlide = 1;
let slideInterval;
const totalSlides = 4;
const slideDuration = 3500; // 3.5 seconds per slide

// Show specific slide
function showSlide(slideNumber) {
    // Hide all slides
    for (let i = 1; i <= totalSlides; i++) {
        const slide = document.getElementById(`slide${i}`);
        if (slide) {
            slide.classList.remove('active');
        }
    }
    
    // Show current slide
    const currentSlideEl = document.getElementById(`slide${slideNumber}`);
    if (currentSlideEl) {
        currentSlideEl.classList.add('active');
    }
    
    // Update progress dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
        if (index + 1 === slideNumber) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    currentSlide = slideNumber;
}

// Next slide
function nextSlide() {
    if (currentSlide < totalSlides) {
        showSlide(currentSlide + 1);
    } else {
        // End of slideshow, show login
        stopSlideshow();
        showLogin();
    }
}

// Start slideshow
function startSlideshow() {
    showSlide(1);
    slideInterval = setInterval(nextSlide, slideDuration);
}

// Stop slideshow
function stopSlideshow() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

// Show login screen
function showLogin() {
    stopSlideshow();
    const introScreen = document.getElementById('introScreen');
    const loginScreen = document.getElementById('loginScreen');
    
    // Hide intro screen completely
    introScreen.classList.remove('active');
    introScreen.style.display = 'none';
    introScreen.style.visibility = 'hidden';
    introScreen.style.pointerEvents = 'none';
    
    // Show login screen
    setTimeout(() => {
        loginScreen.classList.add('active');
    }, 300);
}

// Click on dots to jump to slide
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopSlideshow();
            showSlide(index + 1);
            // Restart slideshow after manual navigation
            setTimeout(() => {
                slideInterval = setInterval(nextSlide, slideDuration);
            }, 100);
        });
    });
});

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = event.target.querySelector('button[type="submit"]');
    const loginBtnText = document.getElementById('loginBtnText');
    
    // Clear previous error
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
    
    // Disable button
    loginBtn.disabled = true;
    loginBtnText.textContent = 'Connexion en cours...';
    
    // Try to login with backend, fallback to demo mode
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Success
            loginBtnText.textContent = '✓ Connexion réussie !';
            
            // Store session
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', result.username);
            localStorage.setItem('token', result.token);
            localStorage.setItem('userRole', result.role || 'user');
            localStorage.setItem('userStatus', result.status || 'free');
            localStorage.setItem('userBadge', result.badge || '🆓');
            localStorage.setItem('loginTime', new Date().toISOString());
            
            // Redirect to main site
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
        } else {
            showError(result.error || 'Identifiants incorrects');
            loginBtn.disabled = false;
            loginBtnText.textContent = 'Se connecter';
        }
    } catch (error) {
        // Backend not available, use demo mode
        console.log('Backend not available, using demo mode');
        
        if (username && password) {
            // Success in demo mode
            loginBtnText.textContent = '✓ Connexion réussie (mode démo) !';
            
            // Store session
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('loginTime', new Date().toISOString());
            
            // Redirect to main site
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
        } else {
            // Error
            showError('Veuillez remplir tous les champs');
            loginBtn.disabled = false;
            loginBtnText.textContent = 'Se connecter';
        }
    }
    
    /* 
    // Production code with backend API:
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', result.username);
            localStorage.setItem('token', result.token);
            window.location.href = 'index.html';
        } else {
            showError(result.error || 'Identifiants incorrects');
            loginBtn.disabled = false;
            loginBtnText.textContent = 'Se connecter';
        }
    } catch (error) {
        showError('Erreur de connexion. Veuillez réessayer.');
        loginBtn.disabled = false;
        loginBtnText.textContent = 'Se connecter';
    }
    */
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function showRegisterInfo(event) {
    event.preventDefault();
    alert('Pour obtenir un accès au site privé, veuillez contacter l\'administrateur à : admin@ioscertifs.com\n\nEn mode démo, utilisez n\'importe quel identifiant pour vous connecter.');
}

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (isLoggedIn === 'true') {
        // User already logged in, redirect
        window.location.href = 'index.html';
    } else {
        // Show intro and start slideshow
        setTimeout(() => {
            document.getElementById('introScreen').classList.add('active');
            startSlideshow();
        }, 300);
    }
});
