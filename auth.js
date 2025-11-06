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
document.addEventListener('DOMContentLoaded', async function() {
    const username = localStorage.getItem('username');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole') || 'user';
    
    // Hide admin link if not admin
    const adminLinks = document.querySelectorAll('a[href="admin.html"]');
    adminLinks.forEach(link => {
        if (userRole !== 'admin') {
            link.style.display = 'none';
        }
    });
    
    if (username && isLoggedIn === 'true') {
        // Fetch user profile to get status badge
        let userStatus = localStorage.getItem('userStatus') || 'free';
        let userBadge = localStorage.getItem('userBadge') || '🆓';
        
        try {
            const response = await fetch(`http://localhost:3000/api/users/${username}`);
            if (response.ok) {
                const data = await response.json();
                userStatus = data.profile.status || 'free';
                userBadge = data.profile.badge || '🆓';
                
                // Update localStorage
                localStorage.setItem('userStatus', userStatus);
                localStorage.setItem('userBadge', userBadge);
            }
        } catch (error) {
            console.log('Could not fetch user profile, using cached data');
        }
        
        // Add username display to navbar
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !document.getElementById('userDisplay')) {
            const statusColors = {
                'free': '#888888',
                'standard': '#30D158',
                'instant': '#FFD60A',
                'premium': '#FFD700'
            };
            
            const statusLabels = {
                'free': 'Gratuit',
                'standard': 'Standard',
                'instant': 'Instant',
                'premium': 'Premium'
            };
            
            const userDisplay = document.createElement('div');
            userDisplay.id = 'userDisplay';
            userDisplay.style.cssText = 'display: flex; align-items: center; gap: 15px; margin-left: 20px;';
            userDisplay.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: var(--text-color); font-weight: 600;">👤 ${username}</span>
                    <span style="
                        background: linear-gradient(135deg, ${statusColors[userStatus]}, ${statusColors[userStatus]}dd);
                        color: #000;
                        padding: 4px 10px;
                        border-radius: 12px;
                        font-size: 0.75rem;
                        font-weight: 700;
                        text-transform: uppercase;
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    ">${userBadge} ${statusLabels[userStatus]}</span>
                </div>
                <a href="#" onclick="logout(); return false;" style="color: #FF453A; text-decoration: none; font-weight: 600;">Déconnexion</a>
            `;
            navLinks.appendChild(userDisplay);
        }
    }
});
