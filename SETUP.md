# ANTIGRAVITY Setup Instructions

## Quick Start - Get Your Site Running

### Step 1: Set Up Database Tables

1. Go to: https://supabase.com/dashboard/project/xtpsjcbgsjcavxzztura/sql
2. Click **"New Query"**
3. Open `supabase/schema.sql` in this project
4. Copy ALL the contents
5. Paste into Supabase SQL Editor
6. Click **"Run"** button
7. Wait for "Success" message

### Step 2: Seed Sample Data

Run this command in PowerShell:

```powershell
cd "d:\ANTIGRAVITY\STREET WEAR"
npx tsx scripts/seed.ts
```

You should see:
```
🌱 Starting database seed...
📁 Creating categories...
✅ Created 4 categories
🛍️  Creating products...
✅ Created 6 products
📦 Creating product variants...
✅ Created variants
✨ Seed completed successfully!
```

### Step 3: Refresh Your Browser

Go to http://localhost:3000 and you should see:
- ✅ Products displayed
- ✅ Categories working
- ✅ Full functional e-commerce site

---

## What's Working Now:

✅ Dev server running on http://localhost:3000
✅ Supabase connected
✅ Environment variables configured
✅ TypeScript (with some warnings - non-blocking)

## What You Still Need:

⚠️ **Database tables** - Run `schema.sql` in Supabase (see Step 1 above)
⚠️ **Sample data** - Run seed script (see Step 2 above)
⚠️ **Stripe keys** - Add to `.env.local` if you want checkout to work
⚠️ **Product images** - Will show placeholders until you upload actual images

---

## After Setup:

### Create an Admin Account:
1. Go to http://localhost:3000
2. Click "Sign In"
3. Sign up with an email
4. Go to Supabase Dashboard → Authentication → Users
5. Find your user and manually set `role` to `admin` in the `users` table

### Upload Product Images:
1. Go to http://localhost:3000/admin
2. Navigate to Products
3. Edit a product
4. Upload images

---

## Troubleshooting:

**"Table doesn't exist" error:**
- Run `supabase/schema.sql` in Supabase SQL Editor

**"No products showing":**
- Run `npx tsx scripts/seed.ts` to add sample data

**"Missing images":**
- Normal - products don't have images yet
- Add them via admin panel or they'll show placeholders

**"Stripe errors":**
- Add Stripe test keys to `.env.local`
- Get from: https://dashboard.stripe.com/test/apikeys

---

Need help? Check the terminal output for specific error messages.
