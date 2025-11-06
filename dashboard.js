// Dashboard script - Check order status and display downloads
document.addEventListener('DOMContentLoaded', async function() {
    // Get order ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('order');
    const orderIdFromStorage = localStorage.getItem('orderId');
    const purchaseData = JSON.parse(localStorage.getItem('purchaseData') || '{}');
    
    const orderId = orderIdFromUrl || orderIdFromStorage;
    
    if (!orderId) {
        // No order found, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    // Fetch order details from server
    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}`);
        
        if (!response.ok) {
            throw new Error('Order not found');
        }
        
        const data = await response.json();
        const order = data.order;
        
        // Display order information
        displayOrderInfo(order);
        
        // Check if order is completed
        if (order.status === 'completed') {
            showCompletedView(order);
        } else {
            showPendingView(order);
        }
        
    } catch (error) {
        console.error('Error loading order:', error);
        // Fallback to localStorage data
        displayFallbackData(purchaseData);
    }
});

function displayOrderInfo(order) {
    // Update order date
    const orderDate = new Date(order.createdAt);
    document.getElementById('orderDate').textContent = orderDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Update device info
    document.getElementById('userEmail').textContent = order.email;
    document.getElementById('userUDID').textContent = order.udid;
    document.getElementById('deviceName').textContent = order.deviceName || 'Non spécifié';
    
    const planTypes = {
        'standard': '✅ Standard',
        'instant': '⚡ Instant',
        'premium': '👑 Premium'
    };
    document.getElementById('planType').textContent = planTypes[order.planType] || order.planType;
}

function showCompletedView(order) {
    const welcomeSection = document.querySelector('.welcome-section');
    const dashboardGrid = document.querySelector('.dashboard-grid');
    
    // Update welcome message
    welcomeSection.innerHTML = `
        <div class="completed-message">
            <div style="font-size: 4rem; margin-bottom: 20px;">🎉</div>
            <h2>Votre certificat est prêt !</h2>
            <p style="font-size: 1.1rem; opacity: 0.9; margin: 10px 0 0;">
                Commande #${order.id.slice(-8)} ${order.isLaunchPromo ? '• <strong>Offre de lancement</strong>' : ''}
            </p>
        </div>
    `;
    
    // Update status badge
    const statusBadge = document.querySelector('.status-badge');
    statusBadge.className = 'status-badge completed';
    statusBadge.innerHTML = '<span>✅</span> Certificat prêt';
    
    const statusText = document.querySelector('.status-text');
    statusText.innerHTML = `
        <strong style="color: #30D158;">Félicitations !</strong> Votre certificat iOS a été généré avec succès. 
        Téléchargez vos fichiers ci-dessous et suivez le guide d'installation.
    `;
    
    // Update timeline
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        if (index === 0 || index === 1 || index === 2) {
            item.classList.add('completed');
            item.classList.remove('active');
        }
    });
    
    timelineItems[2].querySelector('span').textContent = new Date(order.updatedAt || order.createdAt).toLocaleString('fr-FR');
    
    // Add download section
    const downloadSection = document.createElement('div');
    downloadSection.className = 'download-section';
    downloadSection.innerHTML = `
        <h2>📥 Téléchargez vos fichiers</h2>
        <p style="text-align: center; color: var(--text-secondary); margin-bottom: 30px;">
            Tous les fichiers nécessaires pour installer votre certificat iOS
        </p>
        
        <div class="download-grid">
            <div class="download-card">
                <div class="download-icon">📜</div>
                <h3>Certificat .p12</h3>
                <p>Fichier de certificat Apple<br>principal pour signer les apps</p>
                <a href="/downloads/certificate-${order.id}.p12" class="download-btn" download>
                    📥 Télécharger
                </a>
            </div>
            
            <div class="download-card">
                <div class="download-icon">📋</div>
                <h3>Profil .mobileprovision</h3>
                <p>Profil de provisionnement<br>pour votre appareil</p>
                <a href="/downloads/profile-${order.id}.mobileprovision" class="download-btn" download>
                    📥 Télécharger
                </a>
            </div>
            
            <div class="download-card">
                <div class="download-icon">📖</div>
                <h3>Guide d'installation</h3>
                <p>Instructions détaillées<br>étape par étape</p>
                <a href="/downloads/guide-installation.pdf" class="download-btn" download>
                    📥 Télécharger
                </a>
            </div>
        </div>
        
        <div class="installation-guide">
            <h3>📱 Installation rapide</h3>
            <ol>
                <li><strong>Téléchargez les 3 fichiers</strong> ci-dessus sur votre ordinateur</li>
                <li><strong>Connectez votre iPhone</strong> à votre ordinateur via USB</li>
                <li><strong>Ouvrez iTunes/Finder</strong> et sélectionnez votre appareil</li>
                <li><strong>Glissez-déposez</strong> le fichier .mobileprovision sur votre appareil</li>
                <li><strong>Allez dans Réglages > Général > VPN et gestion des appareils</strong></li>
                <li><strong>Faites confiance</strong> au profil de développeur</li>
                <li><strong>Installez vos apps</strong> depuis notre section Apps disponibles</li>
            </ol>
            <p style="margin-top: 15px; color: var(--text-secondary);">
                📧 Besoin d'aide ? Répondez à l'email de confirmation ou contactez-nous : <strong>fucksubs@proton.me</strong>
            </p>
        </div>
        
        ${order.isPremium ? `
        <div style="background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; padding: 20px; border-radius: 15px; margin-top: 30px; text-align: center;">
            <h3 style="margin: 0 0 10px;">👑 Certificat Premium</h3>
            <p style="margin: 0;">
                <strong>Sans risque de révocation</strong> • Valable 1 an • Support VIP 24/7
            </p>
        </div>
        ` : ''}
    `;
    
    // Insert after dashboard grid
    dashboardGrid.parentNode.insertBefore(downloadSection, dashboardGrid.nextSibling);
    
    // Update page title
    document.title = 'Certificat prêt - FuckSubs';
}

function showPendingView(order) {
    // Update status based on order status
    const statusBadge = document.querySelector('.status-badge');
    const statusText = document.querySelector('.status-text');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (order.status === 'processing') {
        statusBadge.className = 'status-badge processing';
        statusBadge.innerHTML = '<span class="pulse"></span> En cours de traitement';
        
        statusText.innerHTML = `
            Votre UDID est actuellement en cours d'enregistrement sur notre compte développeur Apple. 
            Notre équipe travaille activement sur votre commande.
        `;
        
        timelineItems[1].classList.add('active');
        timelineItems[1].classList.add('completed');
        timelineItems[1].querySelector('span').textContent = 'En cours...';
    } else {
        // Pending status
        statusBadge.className = 'status-badge pending';
        statusBadge.innerHTML = '<span class="pulse"></span> En attente';
        
        statusText.innerHTML = `
            Votre commande a été reçue et est en attente de traitement. 
            Vous recevrez vos fichiers de certificat dans les <strong>24-48 heures</strong>.
        `;
    }
}

function displayFallbackData(purchaseData) {
    // Fallback to localStorage data if API fails
    if (purchaseData.email) {
        document.getElementById('userEmail').textContent = purchaseData.email;
    }
    if (purchaseData.udid) {
        document.getElementById('userUDID').textContent = purchaseData.udid;
    }
    if (purchaseData.deviceName) {
        document.getElementById('deviceName').textContent = purchaseData.deviceName;
    }
    if (purchaseData.planType) {
        const planTypes = {
            'standard': '✅ Standard',
            'instant': '⚡ Instant',
            'premium': '👑 Premium'
        };
        document.getElementById('planType').textContent = planTypes[purchaseData.planType] || purchaseData.planType;
    }
    
    const purchaseDate = localStorage.getItem('purchaseDate');
    if (purchaseDate) {
        const date = new Date(purchaseDate);
        document.getElementById('orderDate').textContent = date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

// Auto-refresh every 30 seconds to check for status updates
setInterval(async () => {
    const orderId = localStorage.getItem('orderId');
    if (orderId) {
        try {
            const response = await fetch(`http://localhost:3000/api/orders/${orderId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.order.status === 'completed') {
                    // Reload page to show completed view
                    location.reload();
                }
            }
        } catch (error) {
            console.error('Auto-refresh error:', error);
        }
    }
}, 30000); // Every 30 seconds
