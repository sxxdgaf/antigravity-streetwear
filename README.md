# ANTIGRAVITY Streetwear E-commerce Platform

Premium streetwear e-commerce platform built with Next.js, Supabase, and Framer Motion.

![ANTIGRAVITY](./public/images/og-image.jpg)

## 🚀 Tech Stack

- **Frontend:** Next.js 14 (App Router) + React 18
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion + Canvas (mouse trail)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **State Management:** Zustand
- **Validation:** Zod
- **Hosting:** Vercel (Frontend) + Supabase (Backend)

## 📁 Project Structure

```
antigravity-streetwear/
├── public/
│   └── images/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth routes (login, signup)
│   │   ├── (shop)/             # Shop routes
│   │   ├── admin/              # Admin dashboard
│   │   ├── api/                # API routes
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── layout/             # Layout components (Navbar, Footer)
│   │   ├── shop/               # Shop-specific components
│   │   ├── admin/              # Admin-specific components
│   │   └── animations/         # Animation components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and configurations
│   │   ├── supabase/           # Supabase clients
│   │   ├── constants.ts
│   │   ├── formatting.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── store/                  # Zustand stores
│   └── types/                  # TypeScript types
├── supabase/
│   ├── schema.sql              # Database schema
│   ├── storage.sql             # Storage buckets setup
│   └── seed.sql                # Sample data
├── .env.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
cd "d:\ANTIGRAVITY\STREET WEAR"
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the scripts in order:
   - `supabase/schema.sql` - Creates all tables, functions, and RLS policies
   - `supabase/storage.sql` - Sets up storage buckets
   - `supabase/seed.sql` - Populates sample data (optional)

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find your credentials in Supabase Dashboard → Settings → API

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Tables Overview

| Table | Description |
|-------|-------------|
| `users` | Extended user profiles (linked to Supabase auth) |
| `categories` | Product categories with hierarchical support |
| `products` | Main product catalog |
| `product_variants` | Size/color variants with individual stock |
| `product_images` | Additional product images |
| `wishlist` | User wishlists |
| `orders` | Order records |
| `order_items` | Individual items in orders |
| `inventory_logs` | Stock change tracking |
| `cart_items` | Persistent shopping carts |
| `lookbook` | Lookbook collections |
| `site_settings` | Dynamic site configuration |

### Entity Relationship

```
users (1) ──── (n) orders
users (1) ──── (n) wishlist
users (1) ──── (n) cart_items

categories (1) ──── (n) products
products (1) ──── (n) product_variants
products (1) ──── (n) product_images

orders (1) ──── (n) order_items
product_variants (1) ──── (n) inventory_logs
```

## 🔐 Security

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Public read:** Categories, active products, lookbook
- **User-specific:** Wishlist, cart, order history
- **Admin-only:** User management, inventory logs, all CRUD operations

### Admin Access

Admins are identified by the `role` field in the `users` table:
- `customer` - Regular users
- `admin` - Admin access
- `super_admin` - Full access

## 🎨 Design System

### Colors

```css
--brand-black: #0a0a0a
--brand-white: #fafafa
--brand-accent: #c9a962 (gold)
--brand-grey-*: Neutral scale
```

### Typography

- **Display:** Space Grotesk (headings)
- **Body:** Inter (content)
- **Mono:** JetBrains Mono (code)

### Components

Pre-built components include:
- Buttons (primary, secondary, ghost, accent)
- Inputs with validation states
- Product cards with hover effects
- Badges (new, sale, sold out)
- Loading skeletons
- Glassmorphism cards

## 📦 Development Phases

- [x] **Phase 1:** Database + Supabase setup
- [ ] **Phase 2:** Auth + Admin panel
- [ ] **Phase 3:** Storefront UI
- [ ] **Phase 4:** Cart + Checkout
- [ ] **Phase 5:** Animations + polish
- [ ] **Phase 6:** Deployment

## 🚀 Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Supabase (Backend)

Already hosted - just ensure RLS policies are properly configured.

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed database (requires setup)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

Private - All rights reserved.

---

Built with ❤️ for ANTIGRAVITY Streetwear
