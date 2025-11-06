# 🛡️ Admin Dashboard Documentation

## 🎯 Overview

Complete admin panel to manage all orders. View, filter, search, and update order statuses with a beautiful, responsive interface.

---

## 🚀 Quick Access

**URL**: `admin.html`

**Direct Link**: Available in navbar on all pages: **🛡️ Admin**

---

## ✨ Features

### 📊 Dashboard Stats

Real-time statistics displayed at the top:
- **Total Orders**: All orders placed
- **Pending Orders**: Orders waiting to be processed
- **Completed Orders**: Finished orders
- **Total Revenue**: Sum of all order prices

### 🔍 Filters & Search

**Filter by Status:**
- All
- En attente (Pending)
- En cours (Processing)
- Complété (Completed)
- Annulé (Cancelled)

**Filter by Plan:**
- All
- Standard
- Instant
- Premium

**Search:**
- Email
- Order ID
- UDID
- Username

### 📋 Orders Table

**Columns:**
1. **ID** - Order ID with promo tag if applicable
2. **Date** - Order creation date and time
3. **Client** - Email and username (if logged in)
4. **Plan** - Plan type with colored badge
5. **Price** - Amount paid
6. **Status** - Current order status
7. **Actions** - Quick action buttons

### ⚡ Quick Actions

**For each order:**
- ✅ **Compléter** - Mark as completed
- ⚙️ **En cours** - Set to processing
- ❌ **Annuler** - Cancel order
- 👁️ **Voir** - View full details

### 📱 Order Details Modal

Click "Voir" to open detailed view with:
- Complete order information
- UDID (click to copy)
- Customer details
- Plan information
- Promo status
- Quick status update buttons

---

## 🎨 Visual Design

### Status Badges

- 🟡 **En attente** (Pending) - Yellow
- 🔵 **En cours** (Processing) - Blue
- 🟢 **Complété** (Completed) - Green
- 🔴 **Annulé** (Cancelled) - Red

### Plan Badges

- ✅ **Standard** - Green gradient
- ⚡ **Instant** - Yellow gradient
- 👑 **Premium** - Gold gradient

### Launch Promo Tag

Orders with launch promo show: **🎉 PROMO**

---

## 🔄 Order Status Flow

```
Pending (En attente)
    ↓
Processing (En cours)
    ↓
Completed (Complété)

Any status → Cancelled (Annulé)
```

### Status Descriptions

**Pending** (En attente):
- New order received
- Waiting to be processed
- Customer notified

**Processing** (En cours):
- UDID being added to Apple Developer
- Certificate being generated
- Work in progress

**Completed** (Complété):
- Certificate generated and sent
- Customer received files
- Order fulfilled

**Cancelled** (Annulé):
- Order cancelled
- Could be refunded
- No certificate provided

---

## 🛠️ Usage Guide

### View All Orders

1. Open `admin.html`
2. See all orders in table
3. Stats update automatically

### Filter Orders

1. Select **Status** filter
2. Select **Plan** filter
3. Use **Search** box for specific orders
4. Filters combine for precise results

### Update Order Status

**Method 1: Table Actions**
1. Find order in table
2. Click appropriate button (✅ Compléter, ⚙️ En cours, ❌ Annuler)
3. Confirm action
4. Status updated instantly

**Method 2: Detail Modal**
1. Click "👁️ Voir" on any order
2. View complete details
3. Click status button at bottom
4. Confirm and close

### Copy UDID

1. Click "👁️ Voir" on order
2. Click on UDID text
3. UDID copied to clipboard
4. Paste in Apple Developer portal

### Refresh Data

Click **🔄 Rafraîchir** button to reload all orders and update stats.

---

## 📊 API Endpoints Used

### Get All Orders

```javascript
GET http://localhost:3000/api/orders

Response:
{
  orders: [
    {
      id: "...",
      email: "...",
      status: "pending",
      // ... other fields
    }
  ]
}
```

### Update Order Status

```javascript
PATCH http://localhost:3000/api/orders/:orderId/status

Body:
{
  status: "completed"  // pending, processing, completed, cancelled
}

Response:
{
  success: true,
  message: "Statut mis à jour",
  order: { ... }
}
```

---

## 🔒 Security Notes

**⚠️ IMPORTANT FOR PRODUCTION:**

The admin dashboard currently has **NO AUTHENTICATION**. Anyone can access it.

### Production Security Checklist:

- [ ] Add admin authentication (separate from user auth)
- [ ] Use admin-only JWT tokens
- [ ] Protect API endpoints with middleware
- [ ] Add role-based access control (RBAC)
- [ ] Log all admin actions
- [ ] Rate limit status updates
- [ ] Add CSRF protection
- [ ] Use HTTPS only

### Example Authentication (server.js):

```javascript
// Admin authentication middleware
function requireAdmin(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Non autorisé' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Accès refusé' });
        }
        
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalide' });
    }
}

// Protect admin routes
app.get('/api/orders', requireAdmin, async (req, res) => { ... });
app.patch('/api/orders/:orderId/status', requireAdmin, async (req, res) => { ... });
```

---

## 📱 Responsive Design

**Desktop (> 768px):**
- Multi-column stats grid
- Full table visible
- Side-by-side filters

**Mobile (< 768px):**
- Single-column stats
- Horizontal scroll table
- Stacked filters
- Touch-friendly buttons

---

## 🎯 Workflow Examples

### Processing New Order

1. Customer places order
2. Order appears in admin with status "Pending"
3. Admin sees notification (email to fucksubs@proton.me)
4. Admin opens admin dashboard
5. Finds order (newest at top)
6. Clicks "⚙️ En cours" to mark as processing
7. Adds UDID to Apple Developer (copy from detail view)
8. Generates certificate
9. Sends files to customer
10. Clicks "✅ Compléter"
11. Customer notified

### Handling Cancellation

1. Customer requests cancellation
2. Admin opens order details
3. Clicks "❌ Annuler"
4. Confirms action
5. Processes refund if needed
6. Order marked as cancelled

### Launch Promo Orders

Orders with launch promo show special tag: **🎉 PROMO**

**Indicates:**
- Customer paid Standard/Instant price
- But receives Premium certificate
- First 10 orders only
- Special handling required

---

## 🎨 Customization

### Change Colors

Edit `admin.html` style section:

```css
/* Status colors */
.status-pending { color: #FFD60A; }
.status-processing { color: #0A84FF; }
.status-completed { color: #30D158; }
.status-cancelled { color: #FF453A; }

/* Plan colors */
.plan-standard { background: linear-gradient(135deg, #30D158, #28A745); }
.plan-instant { background: linear-gradient(135deg, #FFD60A, #FFC107); }
.plan-premium { background: linear-gradient(135deg, #FFD700, #FFA500); }
```

### Add More Stats

In `updateStats()` function:

```javascript
// Add average order value
const avgOrder = totalRevenue / orders.length;
document.getElementById('avgOrder').textContent = avgOrder.toFixed(0) + '€';

// Add pending premium orders
const pendingPremium = orders.filter(o => 
    o.status === 'pending' && o.planType === 'premium'
).length;
document.getElementById('pendingPremium').textContent = pendingPremium;
```

### Add Export Function

```javascript
function exportOrders() {
    const csv = allOrders.map(o => 
        `${o.id},${o.email},${o.planType},${o.price},${o.status}`
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
}
```

---

## 🐛 Troubleshooting

### Orders not loading

**Check:**
1. Server is running (`node server.js`)
2. Console for errors (F12)
3. API endpoint working (test in browser: `http://localhost:3000/api/orders`)

**Fix:**
- Restart server
- Check `data/orders.json` exists
- Verify CORS enabled

### Status not updating

**Check:**
1. Console for error messages
2. Network tab (F12) for failed requests
3. Server logs for errors

**Fix:**
- Verify order ID is correct
- Check status value is valid
- Ensure `writeOrders()` has write permissions

### Modal not closing

**Check:**
- JavaScript errors in console
- Click outside modal to close
- Press Escape key

**Fix:**
- Refresh page
- Clear browser cache

### Stats not accurate

**Fix:**
- Click "Rafraîchir" button
- Hard refresh page (Ctrl+F5)
- Check filter settings (set to "All")

---

## ✅ Best Practices

### Order Management

1. **Respond quickly** - Process pending orders within 24h
2. **Update status** - Keep customers informed
3. **Copy UDID carefully** - Double-check before adding to Apple
4. **Mark completed** - Only after customer receives files
5. **Document cancellations** - Note reason in email

### Dashboard Usage

1. **Refresh regularly** - Check for new orders
2. **Use filters** - Find orders faster
3. **Search by email** - Quick customer lookup
4. **Check promo tags** - Special handling for launch promos
5. **Monitor stats** - Track business metrics

### Security

1. **Log out when done** - Click "Déconnexion"
2. **Don't share access** - Keep admin credentials private
3. **Use HTTPS** - Secure connection in production
4. **Monitor activity** - Check for suspicious orders
5. **Backup data** - Regular backups of `orders.json`

---

## 📈 Future Enhancements

### Ideas to Implement:

1. **Email from Dashboard**
   - Send status updates directly
   - Template library
   - Track email opens

2. **Bulk Actions**
   - Select multiple orders
   - Batch status updates
   - Bulk export

3. **Advanced Filters**
   - Date range picker
   - Price range
   - Device type

4. **Order Notes**
   - Add internal notes
   - Track communication
   - Attach files

5. **Customer History**
   - View all orders from customer
   - Track repeat customers
   - Customer lifetime value

6. **Analytics Dashboard**
   - Revenue charts
   - Order trends
   - Popular plans

7. **Notifications**
   - Desktop notifications for new orders
   - Sound alerts
   - Push notifications

8. **Certificate Upload**
   - Upload certificate files
   - Link to orders
   - Auto-send to customers

---

## 🎓 Keyboard Shortcuts

- **Escape** - Close modal
- **Ctrl+F** - Focus search box
- **F5** - Refresh page
- **Ctrl+C** - Copy (on UDID)

---

## 📞 Support

### Common Actions

**New Order:**
1. Check email (fucksubs@proton.me)
2. Open admin dashboard
3. Find order (top of list)
4. Click "En cours"
5. Process order
6. Click "Compléter"

**Customer Issue:**
1. Search by email
2. View order details
3. Check status and plan
4. Verify UDID
5. Take appropriate action

**Launch Promo:**
1. Look for 🎉 PROMO tag
2. Note customer paid less
3. Provide Premium certificate
4. Process as Premium tier

---

## 📋 Summary

**Admin Dashboard Features:**
✅ View all orders in table
✅ Real-time statistics
✅ Filter by status and plan
✅ Search orders
✅ Update order status
✅ View detailed order info
✅ Copy UDID with one click
✅ Mobile responsive
✅ Beautiful UI with gradients

**Quick Start:**
1. Navigate to `admin.html`
2. View all orders
3. Click buttons to update status
4. Use filters to find specific orders

**All set! 🚀**
