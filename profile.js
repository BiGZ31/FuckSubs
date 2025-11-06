// Profile page - Load user orders and allow access to specific order dashboards
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = 'login.html';
        return;
    }

    // Show admin link if admin
    const userRole = localStorage.getItem('userRole');
    const adminLink = document.getElementById('adminLink');
    if (adminLink && userRole === 'admin') {
        adminLink.style.display = 'block';
    }

    // Hide loading section and show profile content
    const loadingSection = document.getElementById('loadingSection');
    const profileContent = document.getElementById('profileContent');
    
    // Load user profile
    await loadUserProfile(username);
    
    // Load user orders
    await loadUserOrders(username);
    
    // Setup filters (if filter buttons exist)
    setupFilters();
    
    // Show content
    if (loadingSection) loadingSection.style.display = 'none';
    if (profileContent) profileContent.style.display = 'block';
});

async function loadUserProfile(username) {
    try {
        const response = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!response.ok) throw new Error('User not found');
        
        const data = await response.json();
        const user = data.user || data.profile;
        
        // Update profile info - use existing IDs
        const usernameElement = document.getElementById('profileUsername');
        if (usernameElement) {
            usernameElement.textContent = user.username || username;
        }
        
        // Update status badge
        const statusBadges = {
            'free': '🆓',
            'standard': '✅',
            'instant': '⚡',
            'premium': '👑'
        };
        
        const statusLabels = {
            'free': 'Gratuit',
            'standard': 'Standard',
            'instant': 'Instant',
            'premium': 'Premium'
        };
        
        const statusClass = user.status || 'free';
        const statusBadgeElement = document.getElementById('statusBadge');
        const statusLabelElement = document.getElementById('statusLabel');
        const profileStatusElement = document.getElementById('profileStatus');
        
        if (statusBadgeElement) {
            statusBadgeElement.textContent = statusBadges[statusClass];
        }
        if (statusLabelElement) {
            statusLabelElement.textContent = statusLabels[statusClass];
        }
        if (profileStatusElement) {
            profileStatusElement.className = `profile-status status-${statusClass}`;
        }
        
    } catch (error) {
        console.error('Error loading profile:', error);
        const usernameElement = document.getElementById('profileUsername');
        if (usernameElement) {
            usernameElement.textContent = username;
        }
    }
}

async function loadUserOrders(username) {
    // Use existing purchasesList element
    const ordersContainer = document.getElementById('purchasesList');
    
    if (!ordersContainer) {
        console.error('purchasesList element not found');
        return;
    }
    
    try {
        // Fetch user's orders directly (optimized endpoint)
        const response = await fetch(`http://localhost:3000/api/orders/user/${username}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        let userOrders = data.orders;
        
        if (userOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="no-purchases">
                    <div class="no-purchases-icon">📦</div>
                    <h3>Aucune commande</h3>
                    <p>Vous n'avez pas encore passé de commande</p>
                    <a href="index.html#pricing" class="cta-button">Commander un certificat</a>
                </div>
            `;
            updateStats(userOrders);
            return;
        }
        
        // Display orders
        displayOrders(userOrders);
        updateStats(userOrders);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersContainer.innerHTML = `
            <div class="no-purchases">
                <div class="no-purchases-icon">❌</div>
                <h3>Erreur de chargement</h3>
                <p>Impossible de charger vos commandes</p>
                <button onclick="location.reload()" class="cta-button">Réessayer</button>
            </div>
        `;
    }
}

function displayOrders(orders) {
    const ordersContainer = document.getElementById('purchasesList');
    
    if (!ordersContainer) return;
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Aucune commande trouvée</p>';
        return;
    }
    
    ordersContainer.innerHTML = orders.map(order => createOrderCard(order)).join('');
}

function createOrderCard(order) {
    const statusConfig = {
        'pending': {
            badge: '🕐 En attente',
            class: 'status-pending',
            text: 'Commande reçue, en attente de traitement'
        },
        'processing': {
            badge: '⚡ En cours',
            class: 'status-processing',
            text: 'UDID en cours d\'enregistrement'
        },
        'completed': {
            badge: '✅ Complétée',
            class: 'status-completed',
            text: 'Certificat prêt à télécharger'
        },
        'cancelled': {
            badge: '❌ Annulée',
            class: 'status-cancelled',
            text: 'Commande annulée'
        }
    };
    
    const planIcons = {
        'standard': '✅',
        'instant': '⚡',
        'premium': '👑'
    };
    
    const planNames = {
        'standard': 'Standard',
        'instant': 'Instant',
        'premium': 'Premium'
    };
    
    const status = statusConfig[order.status] || statusConfig['pending'];
    const planIcon = planIcons[order.planType] || '📦';
    const planName = planNames[order.planType] || order.planType;
    
    const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Check if order has launch promo
    const promoTag = order.isLaunchPromo ? '<span class="promo-tag">🎉 Offre de lancement</span>' : '';
    
    return `
        <div class="purchase-card" data-status="${order.status}" onclick="goToOrderDashboard('${order.id}')" style="cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                    <strong style="font-size: 1.1rem; color: var(--text-color);">#${order.id.slice(-8)}</strong>
                    ${promoTag}
                </div>
                <div class="order-status-badge ${status.class}">
                    ${status.badge}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px;">
                <div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">Plan</div>
                    <div style="color: var(--text-color); font-weight: 600;">${planIcon} ${planName}</div>
                </div>
                <div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">Prix</div>
                    <div style="color: var(--text-color); font-weight: 600;">${order.price}€</div>
                </div>
                <div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">Appareil</div>
                    <div style="color: var(--text-color); font-weight: 600;">${order.deviceName || 'Non spécifié'}</div>
                </div>
                <div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">Date</div>
                    <div style="color: var(--text-color); font-weight: 600; font-size: 0.9rem;">${orderDate}</div>
                </div>
            </div>
            
            <div style="padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0 0 15px;">${status.text}</p>
                <button class="cta-button" onclick="event.stopPropagation(); goToOrderDashboard('${order.id}')" style="width: 100%; padding: 12px; font-size: 0.95rem;">
                    ${order.status === 'completed' ? '📥 Télécharger certificat' : '👁️ Voir détails'} →
                </button>
            </div>
        </div>
    `;
}

function goToOrderDashboard(orderId) {
    // Navigate to dashboard with order ID
    window.location.href = `dashboard.html?order=${orderId}`;
}

function updateStats(orders) {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.price || 0), 0);
    
    // Update stats if elements exist
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalSpentEl = document.getElementById('totalSpent');
    const activeCertificatesEl = document.getElementById('activeCertificates');
    
    if (totalOrdersEl) {
        totalOrdersEl.textContent = totalOrders;
    }
    
    if (totalSpentEl) {
        totalSpentEl.textContent = totalSpent + '€';
    }
    
    if (activeCertificatesEl) {
        activeCertificatesEl.textContent = completedOrders;
    }
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (filterButtons.length === 0) {
        // No filter buttons, skip setup
        return;
    }
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filter = this.getAttribute('data-filter');
            
            // Filter orders
            const orderCards = document.querySelectorAll('.purchase-card');
            
            orderCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else {
                    const cardStatus = card.getAttribute('data-status');
                    card.style.display = cardStatus === filter ? 'block' : 'none';
                }
            });
        });
    });
}

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}
