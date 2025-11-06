// Dynamic pricing based on remaining time until Nov 5, 2026
function calculateDynamicPrice(basePrice) {
    const today = new Date();
    const expiryDate = new Date('2026-11-05');
    const startDate = new Date('2025-11-05');
    
    // Calculate total months between start and expiry (12 months)
    const totalMonths = 12;
    
    // Calculate remaining months
    const remainingTime = expiryDate - today;
    const remainingMonths = remainingTime / (1000 * 60 * 60 * 24 * 30.44); // Average days per month
    
    // Calculate price proportionally
    const pricePerMonth = basePrice / totalMonths;
    const dynamicPrice = Math.ceil(pricePerMonth * remainingMonths);
    
    // Ensure minimum price of 10€
    return Math.max(dynamicPrice, 10);
}

function getRemainingMonths() {
    const today = new Date();
    const expiryDate = new Date('2026-11-05');
    const remainingTime = expiryDate - today;
    const remainingMonths = Math.ceil(remainingTime / (1000 * 60 * 60 * 24 * 30.44));
    return Math.max(remainingMonths, 0);
}

async function updateAllPrices() {
    const standardPrice = calculateDynamicPrice(35);
    const instantPrice = calculateDynamicPrice(45);
    const premiumPrice = 60; // Prix fixe, pas de dégressivité (certificat officiel)
    const remainingMonths = getRemainingMonths();
    
    // Update all price displays
    document.querySelectorAll('.price-standard').forEach(el => {
        el.textContent = standardPrice + '€';
    });
    
    document.querySelectorAll('.price-instant').forEach(el => {
        el.textContent = instantPrice + '€';
    });
    
    document.querySelectorAll('.price-premium').forEach(el => {
        el.textContent = premiumPrice + '€';
    });
    
    // Update hero button
    const heroButton = document.querySelector('.hero .cta-button');
    if (heroButton) {
        heroButton.textContent = `Acheter un Certificat - ${standardPrice}€`;
    }
    
    // Update remaining time info
    document.querySelectorAll('.remaining-months').forEach(el => {
        el.textContent = remainingMonths;
    });
    
    // Update launch promo counter
    try {
        const response = await fetch('/api/pricing');
        const data = await response.json();
        
        if (data.launchPromo) {
            const remainingSlotsEl = document.getElementById('remainingSlots');
            if (remainingSlotsEl) {
                remainingSlotsEl.textContent = data.launchPromo.remaining;
            }
            
            // Masquer la bannière si plus de places
            const promoBanner = document.querySelector('.launch-promo-banner');
            if (promoBanner && data.launchPromo.remaining === 0) {
                promoBanner.style.display = 'none';
            }
        }
    } catch (error) {
        console.log('Could not fetch promo info:', error);
    }
    
    return { standardPrice, instantPrice };
}

// Modal functions
function openModal(planType = 'standard') {
    const modal = document.getElementById('purchaseModal');
    const planTypeInput = document.getElementById('planType');
    const submitButton = document.querySelector('#purchaseForm button[type="submit"]');

    // Set plan type
    planTypeInput.value = planType;

    // Calculate and update button text with dynamic price
    const prices = updateAllPrices();
    if (planType === 'instant') {
        submitButton.textContent = `Payer ${prices.instantPrice}€`;
    } else if (planType === 'premium') {
        submitButton.textContent = `Payer 60€`;
        submitButton.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
        submitButton.style.color = '#000';
    } else {
        submitButton.textContent = `Payer ${prices.standardPrice}€`;
        submitButton.style.background = '';
        submitButton.style.color = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('purchaseModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('purchaseModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.target);
    const data = {
        email: formData.get('email'),
        udid: formData.get('udid'),
        deviceName: formData.get('deviceName'),
        planType: formData.get('planType'),
        username: localStorage.getItem('username') || null // Include username if logged in
    };

    // Get submit button
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.textContent = 'Traitement en cours...';
    submitButton.disabled = true;

    try {
        // Send order to backend
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // Store order info in localStorage
            localStorage.setItem('purchaseData', JSON.stringify(data));
            localStorage.setItem('orderId', result.orderId);
            localStorage.setItem('purchaseDate', new Date().toISOString());

            // Show success message
            submitButton.textContent = '✓ Commande créée !';
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            throw new Error(result.error || 'Erreur lors de la commande');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Erreur lors de la création de la commande: ' + error.message);
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// UDID validation
document.getElementById('udid')?.addEventListener('input', function(e) {
    const udid = e.target.value;
    const isValid = /^[0-9a-fA-F-]{25,40}$/.test(udid);

    if (udid.length > 0 && !isValid) {
        e.target.style.borderColor = '#FF3B30';
    } else {
        e.target.style.borderColor = '#d2d2d7';
    }
});

// Fetch prices from backend
async function fetchPricesFromBackend() {
    try {
        const response = await fetch('/api/pricing');
        if (response.ok) {
            const pricing = await response.json();
            
            // Update all price displays
            document.querySelectorAll('.price-standard').forEach(el => {
                el.textContent = pricing.standardPrice + '€';
            });
            
            document.querySelectorAll('.price-instant').forEach(el => {
                el.textContent = pricing.instantPrice + '€';
            });
            
            // Update hero button
            const heroButton = document.querySelector('.hero .cta-button');
            if (heroButton) {
                heroButton.innerHTML = `Acheter un Certificat - <span class="price-standard">${pricing.standardPrice}€</span>`;
            }
            
            // Update remaining time info
            document.querySelectorAll('.remaining-months').forEach(el => {
                el.textContent = pricing.remainingMonths;
            });
            
            return pricing;
        }
    } catch (error) {
        console.error('Error fetching prices from backend:', error);
        // Fallback to client-side calculation
        return updateAllPrices();
    }
}

// Update prices on page load
document.addEventListener('DOMContentLoaded', function() {
    // Try to fetch from backend first, fallback to client-side calculation
    fetchPricesFromBackend().catch(() => {
        updateAllPrices();
    });
});