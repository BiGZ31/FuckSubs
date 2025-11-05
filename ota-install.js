// OTA Installation System
// Handles app installation via itms-services protocol

// Configuration
const OTA_CONFIG = {
    domain: window.location.origin, // Automatically get current domain
    manifestPath: '/manifests/',
    ipaPath: '/ipas/',
    apiEndpoint: '/api'
};

// Check if user is on iOS device
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Check if user has valid certificate (UDID is registered)
async function checkUDIDAuthorization() {
    try {
        const response = await fetch(`${OTA_CONFIG.apiEndpoint}/check-authorization`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        return data.authorized;
    } catch (error) {
        console.error('Error checking authorization:', error);
        return false;
    }
}

// Install app via OTA
function installApp(appId, appName) {
    if (!isIOS()) {
        showNotification('⚠️ Installation disponible uniquement sur iOS', 'warning');
        return;
    }
    
    // Show loading
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner"></span> Installation...';
    button.disabled = true;
    
    // Create itms-services URL
    const manifestUrl = `${OTA_CONFIG.domain}${OTA_CONFIG.manifestPath}${appId}.plist`;
    const installUrl = `itms-services://?action=download-manifest&url=${encodeURIComponent(manifestUrl)}`;
    
    // Log installation attempt
    logInstallation(appId, appName);
    
    // Trigger installation
    window.location.href = installUrl;
    
    // Show success message
    setTimeout(() => {
        showNotification(`📲 Installation de ${appName} lancée ! Vérifiez votre écran d'accueil.`, 'success');
        button.innerHTML = originalText;
        button.disabled = false;
    }, 2000);
}

// Download IPA directly (backup method)
function downloadIPA(appId, appName) {
    const ipaUrl = `${OTA_CONFIG.domain}${OTA_CONFIG.ipaPath}${appId}.ipa`;
    
    showNotification(`📥 Téléchargement de ${appName}...`, 'info');
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = ipaUrl;
    link.download = `${appId}.ipa`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Log download
    logDownload(appId, appName);
}

// Log installation to backend
async function logInstallation(appId, appName) {
    try {
        await fetch(`${OTA_CONFIG.apiEndpoint}/installations/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                appId,
                appName,
                action: 'install',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            })
        });
    } catch (error) {
        console.error('Error logging installation:', error);
    }
}

// Log download to backend
async function logDownload(appId, appName) {
    try {
        await fetch(`${OTA_CONFIG.apiEndpoint}/installations/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                appId,
                appName,
                action: 'download',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            })
        });
    } catch (error) {
        console.error('Error logging download:', error);
    }
}

// Show notification to user
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotif = document.querySelector('.ota-notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `ota-notification ${type}`;
    notification.innerHTML = `
        <span class="notif-icon">${getNotificationIcon(type)}</span>
        <span class="notif-message">${message}</span>
        <button class="notif-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Get icon for notification type
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return '📱';
    }
}

// Check authorization on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is authorized
    const isAuthorized = await checkUDIDAuthorization();
    
    if (!isAuthorized) {
        // Show warning message
        const appsContainer = document.querySelector('.apps-grid');
        if (appsContainer) {
            const warningBanner = document.createElement('div');
            warningBanner.className = 'auth-warning';
            warningBanner.innerHTML = `
                <div class="warning-content">
                    <span class="warning-icon">🔒</span>
                    <div class="warning-text">
                        <strong>UDID non autorisé</strong>
                        <p>Vous devez acheter un certificat pour installer les applications.</p>
                    </div>
                    <a href="index.html" class="warning-btn">Acheter un certificat</a>
                </div>
            `;
            appsContainer.parentElement.insertBefore(warningBanner, appsContainer);
            
            // Disable all install buttons
            document.querySelectorAll('.install-btn').forEach(btn => {
                btn.disabled = true;
                btn.innerHTML = '🔒 Certificat requis';
            });
        }
    }
    
    // Show device info
    if (isIOS()) {
        console.log('✅ iOS Device detected - OTA installation available');
    } else {
        console.log('ℹ️ Non-iOS device - Download only mode');
        
        // Change install buttons to download buttons for non-iOS
        document.querySelectorAll('.install-btn').forEach(btn => {
            const appId = btn.getAttribute('data-app-id');
            const appName = btn.getAttribute('data-app-name');
            btn.innerHTML = '📥 Télécharger IPA';
            btn.onclick = function() { downloadIPA(appId, appName); };
        });
    }
});

// Refresh manifest files (admin function)
async function refreshManifests() {
    try {
        const response = await fetch(`${OTA_CONFIG.apiEndpoint}/admin/refresh-manifests`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        if (data.success) {
            showNotification('✅ Manifests rafraîchis avec succès', 'success');
        }
    } catch (error) {
        showNotification('❌ Erreur lors du rafraîchissement', 'error');
    }
}
