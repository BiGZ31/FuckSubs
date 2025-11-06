# 🚀 Quick Email Setup

## Step 1: Install Dependencies

```powershell
npm install
```

## Step 2: Create .env File

Create a file named `.env` in the root folder with:

```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-app-password
PORT=3000
```

## Step 3: Get App Password

### For Outlook/Hotmail:
1. Go to: https://account.microsoft.com/security
2. Click "Advanced security options"
3. Under "App passwords", click "Create a new app password"
4. Copy the password (format: xxxx-xxxx-xxxx-xxxx)
5. Paste it as `EMAIL_PASS` in your `.env` file

### For Gmail:
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Click "Generate"
4. Copy the 16-character password
5. Paste it as `EMAIL_PASS` in your `.env` file
6. Update `server.js` line 55: change `smtp-mail.outlook.com` to `smtp.gmail.com`

## Step 4: Test It!

```powershell
node server.js
```

Then place a test order on your website. You should see:

```
✅ Email envoyé à fucksubs@proton.me
✅ Email de confirmation envoyé à customer@example.com
```

Check your inbox at **fucksubs@proton.me** for the order notification!

---

## 📧 What You'll Receive

**Admin Email (fucksubs@proton.me):**
- Complete order details
- Customer UDID for Apple Developer
- Action checklist
- Price paid
- Launch promo status

**Customer Email:**
- Order confirmation
- Next steps
- Support contact

---

## ⚠️ Important Notes

- **Never commit your `.env` file to Git!**
- Use an **app password**, not your regular email password
- Enable **2-Factor Authentication** on your email account
- The email will be sent **automatically** when someone places an order

---

## 🔧 Troubleshooting

**"Invalid login" error:**
- Make sure you're using an app password, not your regular password
- Verify the email and password are correct in `.env`

**Emails not arriving:**
- Check spam folder
- Verify the email address is correct
- Check server console for error messages

**Need help?** Read `EMAIL-SETUP.md` for detailed instructions!
