// Auth protection for all pages
(function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Don't redirect if already on login page
    if (currentPage !== 'login.html' && currentPage !== 'home.html') {
        if (isLoggedIn !== 'true') {
            // Not logged in, redirect to login
            window.location.replace('login.html');
        }
    }
})();

// Logout function
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.clear();
        window.location.replace('logout.html');
    }
}

// Display username in navbar if logged in
document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (username && isLoggedIn === 'true') {
        // Add username display to navbar
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !document.getElementById('userDisplay')) {
            const userDisplay = document.createElement('div');
            userDisplay.id = 'userDisplay';
            userDisplay.style.cssText = 'display: flex; align-items: center; gap: 15px; margin-left: 20px;';
            userDisplay.innerHTML = `
                <span style="color: var(--text-color); font-weight: 600;">👤 ${username}</span>
                <a href="#" onclick="logout(); return false;" style="color: #FF453A; text-decoration: none; font-weight: 600;">Déconnexion</a>
            `;
            navLinks.appendChild(userDisplay);
        }
    }
});
