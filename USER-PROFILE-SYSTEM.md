# 👤 User Profile & Purchase Tracking System

## 🎯 Overview

A complete user profile system that tracks purchases, displays status badges, and shows purchase history. When a user buys a certificate, their account is automatically updated with their status badge (Standard ✅, Instant ⚡, or Premium 👑).

---

## 🏗️ Architecture

### User Data Structure

```javascript
{
  id: "1699123456789",
  username: "john_doe",
  password: "hashed_password",  // Should be bcrypt in production
  email: "john@example.com",
  role: "user",
  status: "premium",           // free, standard, instant, premium
  badge: "👑",                  // 🆓, ✅, ⚡, 👑
  purchases: [                 // Array of all purchases
    {
      orderId: "1699123456789",
      planType: "premium",
      price: 60,
      isPremium: true,
      isLaunchPromo: false,
      purchaseDate: "2025-11-06T10:30:00Z"
    }
  ],
  lastPurchase: "2025-11-06T10:30:00Z",
  createdAt: "2025-11-01T08:00:00Z"
}
```

### Order Linking

Orders now include a `username` field to link them to user accounts:

```javascript
{
  id: "1699123456789",
  email: "john@example.com",
  udid: "00008030-000123456789ABCD",
  username: "john_doe",        // ✨ NEW: Links order to user
  planType: "premium",
  price: 60,
  status: "pending",
  isPremium: true,
  // ... other fields
}
```

---

## 🔄 Status Update Flow

### When a user makes a purchase:

1. **Order Created**: User submits order form with username (from localStorage)
2. **Order Saved**: Order is saved with `username` field
3. **Profile Updated**: Backend automatically:
   - Adds purchase to user's `purchases` array
   - Updates user's `status` to highest tier purchased
   - Assigns appropriate badge
   - Updates `lastPurchase` timestamp

### Status Priority

```javascript
Premium (👑)  >  Instant (⚡)  >  Standard (✅)  >  Free (🆓)
```

Once a user reaches a higher status, they keep it even if they make a lower-tier purchase later.

---

## 🎨 Badge System

### Badge Definitions

| Status | Badge | Color | Description |
|--------|-------|-------|-------------|
| **Free** | 🆓 | Gray (#888888) | No purchases yet |
| **Standard** | ✅ | Green (#30D158) | Standard certificate |
| **Instant** | ⚡ | Yellow (#FFD60A) | Instant certificate |
| **Premium** | 👑 | Gold (#FFD700) | Premium certificate (no revocation) |

### Badge Display

Badges appear in:
- **Navbar**: Next to username on all pages
- **Profile Header**: Large badge in profile page
- **Order Cards**: Shows purchase tier

---

## 📄 Pages

### 1. Profile Page (`profile.html`)

**Features:**
- User avatar and status badge
- Membership duration
- Statistics cards:
  - Total orders
  - Total spent
  - Active certificates
  - Amount saved (from promos)
- Complete purchase history with:
  - Order ID
  - Plan type with icon
  - Price paid
  - Purchase date
  - Order status
  - Launch promo badge (if applicable)
  - Device name
  - Protection status (Premium)

**Access:**
- Available to logged-in users
- Navbar link: "Mon Profil"
- Direct URL: `profile.html`

### 2. Updated Navigation

All pages now include profile link:
```html
<nav class="navbar">
    <div class="nav-links">
        <a href="index.html">Accueil</a>
        <a href="apps.html">Apps disponibles</a>
        <a href="profile.html">Mon Profil</a>  <!-- ✨ NEW -->
        <a href="#prix">Prix</a>
        <a href="#faq">FAQ</a>
    </div>
</nav>
```

---

## 🔌 API Endpoints

### Get User Profile

```javascript
GET /api/users/:username

Response:
{
  success: true,
  profile: {
    id: "...",
    username: "john_doe",
    email: "john@example.com",
    role: "user",
    status: "premium",
    badge: "👑",
    purchases: [...],
    lastPurchase: "2025-11-06T10:30:00Z",
    createdAt: "2025-11-01T08:00:00Z",
    totalOrders: 3,
    orders: [...]  // Full order details
  }
}
```

### Create Order (Updated)

```javascript
POST /api/orders

Body:
{
  email: "john@example.com",
  udid: "00008030-000123456789ABCD",
  deviceName: "iPhone 15 Pro",
  planType: "premium",
  username: "john_doe"  // ✨ NEW: Links to user account
}

// Backend automatically:
// 1. Creates order
// 2. Updates user profile
// 3. Adds purchase to purchases array
// 4. Updates user status/badge
```

### Login (Updated)

```javascript
POST /api/auth/login

Response:
{
  success: true,
  username: "john_doe",
  role: "user",
  status: "premium",     // ✨ NEW
  badge: "👑",           // ✨ NEW
  purchases: [...],      // ✨ NEW
  token: "..."
}
```

---

## 🎨 UI Components

### Navbar Badge

```html
<div id="userDisplay">
    <div style="display: flex; align-items: center; gap: 8px;">
        <span>👤 john_doe</span>
        <span class="status-badge status-premium">
            👑 PREMIUM
        </span>
    </div>
    <a href="#" onclick="logout()">Déconnexion</a>
</div>
```

**Styling:**
- Gradient background matching status
- Box shadow for depth
- Uppercase text
- Responsive font sizes

### Profile Statistics

```html
<div class="stat-card">
    <div class="stat-value">3</div>
    <div class="stat-label">Commandes</div>
</div>
```

**Features:**
- Hover effects (lift up)
- Color-coded values
- Grid layout (responsive)

### Purchase Cards

```html
<div class="purchase-card">
    <div class="purchase-header">
        <div class="purchase-plan">
            👑 Premium
            🎉 Offre de lancement  <!-- If isLaunchPromo -->
        </div>
        <div class="purchase-price">35€</div>
    </div>
    <div class="purchase-details">
        <!-- Order ID, date, status, device, etc. -->
    </div>
</div>
```

---

## 💾 localStorage Updates

### Stored Data (Updated)

```javascript
localStorage.setItem('isLoggedIn', 'true');
localStorage.setItem('username', 'john_doe');
localStorage.setItem('userStatus', 'premium');     // ✨ NEW
localStorage.setItem('userBadge', '👑');           // ✨ NEW
localStorage.setItem('token', '...');
localStorage.setItem('loginTime', '...');
```

### Usage in Frontend

```javascript
const username = localStorage.getItem('username');
const userStatus = localStorage.getItem('userStatus');
const userBadge = localStorage.getItem('userBadge');

// Send with orders
fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
        ...orderData,
        username: username  // Link order to account
    })
});
```

---

## 🔄 Auto-Update Logic

### Backend (server.js)

When an order is created:

```javascript
// Update user profile if logged in
if (username) {
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
        // Add purchase
        users[userIndex].purchases.push({
            orderId: order.id,
            planType: order.planType,
            price: order.price,
            isPremium: order.isPremium,
            isLaunchPromo: order.isLaunchPromo,
            purchaseDate: order.createdAt
        });
        
        // Update status (only upgrade, never downgrade)
        if (planType === 'premium') {
            users[userIndex].status = 'premium';
            users[userIndex].badge = '👑';
        } else if (planType === 'instant' && users[userIndex].status !== 'premium') {
            users[userIndex].status = 'instant';
            users[userIndex].badge = '⚡';
        } else if (!users[userIndex].status) {
            users[userIndex].status = 'standard';
            users[userIndex].badge = '✅';
        }
        
        users[userIndex].lastPurchase = order.createdAt;
        await writeUsers(users);
    }
}
```

### Frontend (auth.js)

On page load, fetch latest profile:

```javascript
const response = await fetch(`http://localhost:3000/api/users/${username}`);
const data = await response.json();

// Update localStorage with latest status
localStorage.setItem('userStatus', data.profile.status);
localStorage.setItem('userBadge', data.profile.badge);

// Update navbar display
displayStatusBadge(data.profile.status, data.profile.badge);
```

---

## 📊 Statistics Calculations

### Total Spent

```javascript
const totalSpent = orders.reduce((sum, order) => sum + order.price, 0);
```

### Saved Amount (from promos)

```javascript
const savedAmount = orders.reduce((sum, order) => {
    if (order.isLaunchPromo && order.isPremium) {
        return sum + (60 - order.price);  // Premium = 60€
    }
    return sum;
}, 0);
```

### Active Certificates

```javascript
const activeCerts = orders.filter(o => o.status === 'completed').length;
```

---

## 🎯 User Experience Flow

### New User Journey

1. **Registration**: Create account → Status: Free 🆓
2. **Browse Apps**: Explore available apps
3. **Purchase**: Buy Standard certificate → Status: Standard ✅
4. **Profile Updated**: Automatically upgraded, badge visible
5. **View Profile**: See purchase in history
6. **Status Displayed**: Badge shown in navbar on all pages

### Returning User Journey

1. **Login**: See current status badge in navbar
2. **Make Purchase**: Buy Instant or Premium
3. **Auto-Upgrade**: Status upgraded to highest tier
4. **Profile History**: All purchases tracked

### Launch Promo User

1. **Purchase Standard (35€)**
2. **Auto-Upgrade to Premium** (first 10 orders)
3. **Status**: Premium 👑
4. **Profile**: Shows "Offre de lancement" badge
5. **Savings**: 25€ saved (60€ - 35€)

---

## 🔒 Security Considerations

### Production Checklist

- [ ] **Hash passwords**: Use bcrypt instead of plain text
- [ ] **JWT tokens**: Replace demo tokens with real JWT
- [ ] **Session expiry**: Implement token expiration
- [ ] **Rate limiting**: Prevent abuse of profile endpoint
- [ ] **Input validation**: Sanitize all user inputs
- [ ] **HTTPS only**: Enforce secure connections
- [ ] **CORS**: Configure proper CORS policies
- [ ] **SQL injection**: Use parameterized queries (if using SQL)

### Current State (Demo)

⚠️ **NOT FOR PRODUCTION**:
- Passwords stored in plain text
- No session expiry
- Demo tokens
- No rate limiting

---

## 🎨 Customization

### Change Badge Emojis

In `server.js` and `auth.js`:

```javascript
// Current badges
const badges = {
    free: '🆓',
    standard: '✅',
    instant: '⚡',
    premium: '👑'
};

// Alternative options
const altBadges = {
    free: '👤',
    standard: '🌟',
    instant: '⚡',
    premium: '💎'
};
```

### Change Status Colors

In `profile.html` and `auth.js`:

```javascript
const statusColors = {
    'free': '#888888',      // Gray
    'standard': '#30D158',  // Green
    'instant': '#FFD60A',   // Yellow
    'premium': '#FFD700'    // Gold
};
```

### Add New Status Tier

1. **Update user creation**:
```javascript
// server.js - Add new tier
if (planType === 'enterprise') {
    users[userIndex].status = 'enterprise';
    users[userIndex].badge = '🏢';
}
```

2. **Update UI colors/labels**:
```javascript
// profile.html & auth.js
const statusLabels = {
    // ... existing
    'enterprise': 'Enterprise'
};
```

---

## 📈 Future Enhancements

### Ideas to implement:

1. **Loyalty Points**
   - Earn points for each purchase
   - Redeem for discounts

2. **Referral System**
   - Share referral code
   - Get discount when friends purchase

3. **Achievements**
   - Badges for milestones
   - "Early Adopter", "VIP Member", etc.

4. **Order Notifications**
   - Email when certificate is ready
   - Push notifications

5. **Order Status Tracking**
   - Real-time updates
   - Progress bar

6. **Download Section**
   - Download certificate files
   - Installation guides

7. **Profile Customization**
   - Avatar upload
   - Bio/description
   - Favorite apps

8. **Admin Dashboard**
   - View all users
   - Manage orders
   - Analytics

---

## ✅ Testing Checklist

### Test Scenarios

- [ ] New user registration creates `status: 'free'`
- [ ] Login returns user status and badge
- [ ] Purchasing Standard updates status to `standard`
- [ ] Purchasing Premium updates status to `premium`
- [ ] Profile page loads without errors
- [ ] Purchase history displays correctly
- [ ] Statistics calculate accurately
- [ ] Status badge appears in navbar
- [ ] Launch promo orders flagged correctly
- [ ] Multiple purchases tracked properly
- [ ] Status never downgrades (only upgrades)
- [ ] Profile page handles no purchases gracefully
- [ ] Mobile responsive layout works

---

## 🐛 Troubleshooting

### Common Issues

**Badge not showing in navbar**
- Check localStorage: `userStatus` and `userBadge`
- Verify API returns status in login response
- Check auth.js is loaded on page

**Profile page shows loading forever**
- Ensure server is running (`node server.js`)
- Check console for fetch errors
- Verify username in localStorage

**Purchase not updating profile**
- Confirm `username` sent with order
- Check server logs for errors
- Verify users.json has write permissions

**Status not upgrading**
- Check order has correct `planType`
- Verify auto-update logic runs
- Console log userIndex to ensure user found

---

## 📝 Summary

**What was implemented:**
✅ User profile system with status tracking
✅ Purchase history linked to accounts
✅ Status badges (Free, Standard, Instant, Premium)
✅ Profile page with statistics and order history
✅ Auto-upgrade logic when purchasing
✅ Navbar badge display on all pages
✅ API endpoint for user profiles
✅ localStorage integration

**Files modified:**
- `server.js` - Added profile endpoint and auto-update logic
- `auth.js` - Added badge display in navbar
- `script.js` - Send username with orders
- `intro.js` - Store user status on login
- `index.html` - Added profile link
- `apps.html` - Added profile link
- `profile.html` - NEW: Complete profile page
- `users.json` - NEW: User data storage

**Ready to use! 🎉**

Start the server and log in to see your personalized profile with status badges!
