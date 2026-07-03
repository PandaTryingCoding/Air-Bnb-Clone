# Airbnb Clone

A full-stack short-term rental marketplace inspired by Airbnb. Users can discover properties, book stays, pay securely, manage listings, and leave reviews — all in one application.

Built as a production-style learning project with real integrations for authentication, payments, image storage, and analytics.

---

## Executive Summary

**This App** connects two sides of a rental marketplace:

- **Guests** browse listings, save favourites, book dates, pay online, and review stays.
- **Hosts** create and manage property listings, track reservations, and view earnings.
- **Admins** monitor platform growth through a dedicated analytics dashboard.

The product covers the core vacation-rental loop — **discover → book → pay → manage** — with INR-based payments via Razorpay, Clerk-powered authentication, and PostgreSQL-backed persistence.

---

## What the Application Does

### For Guests (Travelers)

| Capability | Description |
|------------|-------------|
| **Browse & search** | Filter properties by category or search by name on the home page |
| **Property details** | View image galleries, amenities, country map, reviews, and pricing breakdown |
| **Favourites** | Save properties for later from cards or detail pages |
| **Booking** | Select check-in/check-out dates on an interactive calendar (blocked dates reflect confirmed bookings) |
| **Checkout** | Pay via Razorpay to confirm a reservation |
| **My bookings** | View and manage confirmed (paid) bookings |
| **Reviews** | Rate and review properties after a stay; manage reviews from a dedicated page |

### For Hosts (Property Owners)

| Capability | Description |
|------------|-------------|
| **Create listings** | Add property details, amenities, pricing, country, and up to 6 images |
| **Manage rentals** | Edit or delete listings; add/remove property images |
| **Reservations** | View incoming paid bookings on owned properties |
| **Revenue stats** | See total properties, nights booked, and cumulative earnings (INR) |

### For Platform Admins

| Capability | Description |
|------------|-------------|
| **Dashboard** | View total users, properties, and confirmed bookings |
| **Analytics chart** | Monthly bookings bar chart (last 12 months, paid bookings only) |
| **Access control** | Admin routes restricted to a designated Clerk user via environment configuration |

---

## User Roles & Journeys

There is no separate role system in the database — any authenticated user can act as both guest and host. Admin access is environment-based.

### Guest booking flow

```
Browse home → Open property → Pick dates → Reserve
  → Checkout (Razorpay) → Payment verified → Booking confirmed → View in /bookings
```

### Host listing flow

```
Create profile → Create rental → Upload images → Publish
  → Receive paid reservations → Track stats on /reservations
```

### Admin flow

```
Sign in as admin user → Navigate to /admin → View platform metrics & charts
```

---

## Pricing Model

Booking totals are calculated automatically:

- **Subtotal** = nightly rate × number of nights
- **Cleaning fee** = ₹200 (fixed)
- **Service fee** = ₹500 (fixed)
- **Tax** = 12% of subtotal

All amounts are displayed and charged in **INR**.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui (Radix primitives) |
| **Authentication** | Clerk |
| **Database** | PostgreSQL with Prisma ORM |
| **File storage** | Supabase Storage (property & profile images) |
| **Payments** | Razorpay (orders, checkout modal, signature verification) |
| **Validation** | Zod |
| **Charts** | Recharts (admin dashboard) |
| **Maps** | Leaflet + OpenStreetMap (country-level markers) |
| **State** | Zustand (booking calendar on property pages) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │  Pages   │  │Components│  │  Server  │  │ API Routes│ │
│  │ (App     │  │ (UI +    │  │ Actions  │  │ /payment  │ │
│  │  Router) │  │  feature)│  │          │  │ /verify   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘ │
└───────┼─────────────┼─────────────┼──────────────┼────────┘
        │             │             │              │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐    ┌────▼────┐
   │  Clerk  │   │Supabase │   │ Prisma  │    │Razorpay │
   │  (Auth) │   │(Images) │   │(Postgres│    │(Payments│
   └─────────┘   └─────────┘   └─────────┘    └─────────┘
```

**Key patterns:**

- **Server Actions** — Centralized in `utils/actions.ts` for CRUD, auth guards, and cache revalidation
- **Middleware** — Public routes for home and property pages; Clerk protection elsewhere; admin route gated by env user ID
- **Payment gate** — Bookings remain `paymentStatus: false` until Razorpay verification; only paid bookings appear in lists, stats, and calendar blocking
- **Form pattern** — Reusable `FormContainer` + server actions with toast feedback

---

## Data Model (High Level)

| Entity | Purpose |
|--------|---------|
| **Profile** | User profile linked to Clerk ID |
| **Property** | Rental listing with pricing, amenities, and cover image |
| **PropertyImage** | Ordered image gallery (up to 6 per property) |
| **Booking** | Reservation with dates, totals, and payment status |
| **Favorite** | Saved property for a user |
| **Review** | Star rating and comment on a property |

---

## Project Structure

```
app/                  # Routes (pages + API)
components/           # Feature UI (admin, booking, checkout, home, navbar, etc.)
utils/                # Server actions, DB client, schemas, integrations
prisma/               # Database schema
public/               # Static assets
```

---

## Pages & Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Home — categories, search, property grid |
| `/properties/[id]` | Public | Property detail, booking widget, reviews |
| `/profile/create` | Auth | First-time profile setup |
| `/profile` | Auth | Edit profile and avatar |
| `/favourites` | Auth | Saved properties |
| `/bookings` | Auth | Guest's confirmed bookings |
| `/checkout` | Auth | Razorpay payment for a pending booking |
| `/reservations` | Auth | Host reservations and earnings stats |
| `/reviews` | Auth | User's submitted reviews |
| `/rentals` | Auth | Host property list |
| `/rentals/create` | Auth | Create a new listing |
| `/rentals/[id]/edit` | Auth | Edit listing and images |
| `/admin` | Admin | Platform analytics dashboard |

---

## Getting Started

### Prerequisites

- Node.js 24.x
- PostgreSQL database
- Accounts: Clerk, Supabase, Razorpay

### Environment variables

```env
# Database
DATABASE_URL=
DIRECT_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase (image storage)
SUPABASE_URL=
SUPABASE_KEY=

# Razorpay (payments)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Admin
ADMIN_USER_ID=

# Optional
NEXT_PUBLIC_WEBSITE_URL=
```

### Run locally

```bash
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Current Status

### Delivered (MVP scope)

- [x] Property discovery with category filters and search
- [x] Full property CRUD for hosts (create, edit, delete, multi-image)
- [x] Favourites
- [x] Reviews (create, list, delete)
- [x] Interactive booking calendar with date blocking
- [x] Razorpay checkout and payment verification
- [x] Guest bookings and host reservations
- [x] Host revenue statistics
- [x] Admin analytics dashboard
- [x] Profile management with image upload
- [x] Dark mode
- [x] Social sharing on property pages

### Known limitations

- Maps show **country-level** markers only (no exact property address / lat-lng)
- Admin is a **single env-configured user**, not a database role system
- Payments are **INR / Razorpay only** — no multi-currency or refunds flow
- Unpaid bookings are cleaned up when a user starts a new reservation
- No in-app messaging between guest and host

---

## Future Improvements

### Product & UX

- [ ] Exact-address maps with lat/lng on property model
- [ ] Host–guest messaging and booking inquiries
- [ ] Booking cancellation and refund policies
- [ ] Email notifications (booking confirmation, reminders)
- [ ] Advanced search (price range, guest count, date availability)
- [ ] Property availability calendar for hosts

### Platform & Admin

- [ ] Multi-admin support with database-backed roles
- [ ] User moderation and listing approval workflow
- [ ] Platform commission / payout tracking for hosts
- [ ] Exportable reports (CSV/PDF)

### Payments & Trust

- [ ] Razorpay webhooks for payment confirmation redundancy
- [ ] Multi-currency support
- [ ] Host payout dashboard
- [ ] Identity verification for hosts

### Engineering & DevOps

- [ ] Prisma migrations in repo (version-controlled schema history)
- [ ] Automated test suite (unit + E2E)
- [ ] CI/CD pipeline with preview deployments
- [ ] Error monitoring (e.g. Sentry)
- [ ] Rate limiting on API routes
- [ ] SEO metadata per property page

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## License

Private project — not licensed for public distribution.
