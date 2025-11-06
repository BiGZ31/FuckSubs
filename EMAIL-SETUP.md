# 📧 Email Notification Setup Guide

## 🎯 Overview

The system automatically sends email notifications to **fucksubs@proton.me** whenever someone places an order. Both admin and customer receive beautifully formatted emails with all order details.

---

## 📦 Required Packages

The email system uses **Nodemailer**. Install it with:

```powershell
npm install nodemailer dotenv
```

---

## ⚙️ Configuration

### Step 1: Create `.env` file

Copy `.env.example` to `.env`:

```powershell
cp .env.example .env
```

### Step 2: Configure Email Settings

Edit `.env` file:

```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-app-password
PORT=3000
```

---

## 🔑 Email Provider Setup

### Option 1: Outlook/Hotmail (Recommended)

1. **Go to**: https://account.microsoft.com/security
2. **Enable Two-Factor Authentication**
3. **Generate App Password**:
   - Go to "Security" → "Advanced security options"
   - Click "Create a new app password"
   - Copy the generated password
4. **Update `.env`**:
   ```env
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASS=xxxx-xxxx-xxxx-xxxx  # Your app password
   ```

**SMTP Settings:**
- Host: `smtp-mail.outlook.com`
- Port: `587`
- Secure: `false`

---

### Option 2: Gmail

1. **Enable 2FA**: https://myaccount.google.com/security
2. **Create App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other"
   - Copy the 16-character password
3. **Update `.env`**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx-xxxx-xxxx-xxxx
   ```

**Update `server.js`** (line ~55):
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Changed from smtp-mail.outlook.com
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
```

---

### Option 3: ProtonMail Bridge (Advanced)

ProtonMail doesn't support direct SMTP access. You need **ProtonMail Bridge**:

1. **Download Bridge**: https://proton.me/mail/bridge
2. **Install and Configure Bridge**
3. **Get SMTP Credentials** from Bridge
4. **Update `.env`**:
   ```env
   EMAIL_USER=fucksubs@proton.me
   EMAIL_PASS=your-bridge-password
   ```
5. **Update `server.js`**:
   ```javascript
   const transporter = nodemailer.createTransport({
       host: '127.0.0.1',  // ProtonMail Bridge runs locally
       port: 1025,         // Default Bridge SMTP port
       secure: false,
       auth: {
           user: process.env.EMAIL_USER,
           pass: process.env.EMAIL_PASS
       }
   });
   ```

**Note**: ProtonMail Bridge requires a paid ProtonMail account.

---

## 📧 Email Templates

### Admin Email (fucksubs@proton.me)

**Subject**: `🎉 Nouvelle Commande #12345678 - Premium (60€)`

**Content Includes:**
- 💰 Price paid
- 🏷️ Plan type badge (Standard/Instant/Premium)
- 🎉 Launch promo notification (if applicable)
- 📋 Complete order details:
  - Order ID
  - Customer email
  - Username (if logged in)
  - UDID (full device ID)
  - Device name
  - Plan type
  - Revocation protection status
  - Order date
  - Expiry date
- ✅ Action checklist:
  - Add UDID to Apple Developer account
  - Generate certificate
  - Send files to customer
  - Mark order as completed

### Customer Email

**Subject**: `✅ Commande confirmée - FuckSubs #12345678`

**Content Includes:**
- 🎉 Success message
- 🎁 Launch promo upgrade notice (if applicable)
- 📋 Order summary
- ⏰ Next steps timeline
- 📞 Support contact info

---

## 🎨 Email Features

### Professional Design
- Responsive HTML layout
- Gradient headers
- Color-coded badges
- Mobile-friendly
- Dark mode compatible

### Dynamic Content
- Plan-specific emojis (✅ ⚡ 👑)
- Color-coded badges
- Conditional sections (promo, upgrade, etc.)
- Formatted dates (French locale)
- Truncated order IDs

### Status Badges

```html
Standard:  <span class="badge-standard">✅ STANDARD</span>
Instant:   <span class="badge-instant">⚡ INSTANT</span>
Premium:   <span class="badge-premium">👑 PREMIUM</span>
Promo:     <span class="badge-promo">🎉 OFFRE LANCEMENT</span>
```

---

## 🔍 Testing

### Test Email Sending

```powershell
node server.js
```

Then make a test order through the website. Check:
1. **Console logs**: `✅ Email envoyé à fucksubs@proton.me`
2. **Admin inbox**: fucksubs@proton.me
3. **Customer inbox**: Email used in order form

### Test Without Real Email

If you want to test without sending real emails, use **Ethereal** (fake SMTP):

```javascript
// In server.js, replace transporter with:
const testAccount = await nodemailer.createTestAccount();
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
        user: testAccount.user,
        pass: testAccount.pass
    }
});

// After sending, log preview URL:
console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
```

---

## 🚨 Troubleshooting

### Error: "Invalid login"

**Solution**:
- Make sure 2FA is enabled
- Use an **App Password**, not your regular password
- Check email/password are correct in `.env`

### Error: "Connection timeout"

**Solution**:
- Check firewall settings (allow port 587)
- Try different SMTP port (465 with `secure: true`)
- Verify SMTP host is correct

### Error: "Self signed certificate"

**Solution**:
```javascript
const transporter = nodemailer.createTransport({
    // ... existing config
    tls: {
        rejectUnauthorized: false
    }
});
```

### Emails go to spam

**Solution**:
- Use a professional email (not gmail free)
- Set up SPF/DKIM records
- Send from same domain as website
- Avoid spam trigger words

### Emails not received

**Check**:
1. ✅ Console shows "Email envoyé"
2. ✅ No errors in terminal
3. ✅ Check spam folder
4. ✅ Verify email address is correct
5. ✅ Test with different email provider

---

## 📊 Email Flow

```
User places order
    ↓
Backend creates order
    ↓
Backend saves to orders.json
    ↓
Backend calls sendOrderNotification()
    ↓
┌─────────────────────┬─────────────────────┐
│  Admin Email        │  Customer Email     │
│  (fucksubs@...)     │  (customer email)   │
├─────────────────────┼─────────────────────┤
│  Order details      │  Confirmation       │
│  UDID               │  Next steps         │
│  Action items       │  Support info       │
└─────────────────────┴─────────────────────┘
    ↓
Order response sent to frontend
    ↓
User sees success message
```

---

## 🎯 Customization

### Change Admin Email

In `server.js` (line ~120):

```javascript
to: 'fucksubs@proton.me',  // Change this
```

### Change Email Design

Edit HTML in `sendOrderNotification()` function:
- Colors: Modify `.header`, `.badge-*` styles
- Layout: Change grid/flex layouts
- Content: Edit text and sections

### Add More Recipients

```javascript
to: 'fucksubs@proton.me, admin2@example.com',  // Multiple emails
```

Or send separately:

```javascript
// Admin 1
await transporter.sendMail({ to: 'admin1@...', ... });

// Admin 2
await transporter.sendMail({ to: 'admin2@...', ... });
```

### Disable Customer Emails

Comment out the customer email section:

```javascript
// Don't send to customer
// await transporter.sendMail(customerMailOptions);
```

---

## 🔐 Security Best Practices

### ✅ DO:
- Use environment variables (`.env`)
- Use app-specific passwords
- Enable 2FA on email account
- Keep `.env` in `.gitignore`
- Use HTTPS in production
- Limit failed login attempts

### ❌ DON'T:
- Hardcode passwords in code
- Commit `.env` to Git
- Use personal email password
- Disable SSL/TLS in production
- Log email credentials
- Send sensitive data in emails

---

## 📋 Checklist

Before going live:

- [ ] Install nodemailer and dotenv
- [ ] Create `.env` file with credentials
- [ ] Test email sending with test order
- [ ] Verify admin receives emails
- [ ] Verify customer receives emails
- [ ] Check emails aren't going to spam
- [ ] Test with different email providers
- [ ] Set up email monitoring/logging
- [ ] Configure email rate limiting
- [ ] Add `.env` to `.gitignore`

---

## 🎓 Advanced Features

### Email Queue (Future)

For high volume, use a queue system:

```bash
npm install bull redis
```

```javascript
const Queue = require('bull');
const emailQueue = new Queue('email');

// Add to queue instead of sending directly
emailQueue.add({ order });

// Process queue
emailQueue.process(async (job) => {
    await sendOrderNotification(job.data.order);
});
```

### Email Templates (Future)

Use template engines like Handlebars:

```bash
npm install handlebars
```

```javascript
const Handlebars = require('handlebars');
const template = Handlebars.compile(emailTemplate);
const html = template({ order });
```

### Email Analytics

Track opens and clicks:

```javascript
// Add tracking pixel
<img src="https://yoursite.com/track/open/${order.id}" width="1" height="1" />

// Add tracking links
<a href="https://yoursite.com/track/click/${order.id}">Link</a>
```

---

## 💡 Quick Start

**Fastest setup (Outlook)**:

1. Install packages:
   ```powershell
   npm install nodemailer dotenv
   ```

2. Create `.env`:
   ```env
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASS=your-app-password
   ```

3. Get app password:
   - https://account.microsoft.com/security
   - "Advanced security" → "Create app password"

4. Start server:
   ```powershell
   node server.js
   ```

5. Make test order!

**Done!** 🎉

---

## 📞 Support

If emails aren't working:

1. Check server console for errors
2. Verify `.env` credentials
3. Test with Ethereal (fake SMTP)
4. Check email provider documentation
5. Review firewall/network settings

**Email working?** You'll see:
```
✅ Email envoyé à fucksubs@proton.me
✅ Email de confirmation envoyé à customer@example.com
```

---

## 🎉 Summary

**What happens when order is placed:**
1. ✅ Order saved to database
2. 📧 Email sent to **fucksubs@proton.me** (admin)
3. 📧 Email sent to **customer** (confirmation)
4. 💾 User profile updated (if logged in)
5. 🎉 Success response to frontend

**Email contains:**
- All order details
- UDID for Apple Developer
- Action checklist
- Customer info
- Launch promo status
- Beautiful HTML design

**You're all set!** 🚀
