# TamalData — Product Requirements Document
**Version:** 1.0.0
**Date:** June 15, 2026
**Prepared by:** Spencer Geee (Cyril Spencer) — IPMC Ghana
**Status:** Draft — Ready for Development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Target Audience & User Personas](#3-target-audience--user-personas)
4. [Technical Stack](#4-technical-stack)
5. [DataMart Ghana API Integration](#5-datamart-ghana-api-integration)
6. [Information Architecture & Site Map](#6-information-architecture--site-map)
7. [Design System & Visual Language](#7-design-system--visual-language)
8. [Motion & Interaction Design](#8-motion--interaction-design)
9. [Page-by-Page Specifications](#9-page-by-page-specifications)
   - 9.1 [Landing Page (Home)](#91-landing-page-home)
   - 9.2 [Buy Data Page](#92-buy-data-page)
   - 9.3 [Order Tracking Page](#93-order-tracking-page)
   - 9.4 [Auth Pages (Register / Login)](#94-auth-pages-register--login)
   - 9.5 [User Dashboard](#95-user-dashboard)
   - 9.6 [Reseller Portal](#96-reseller-portal)
   - 9.7 [Referral & Affiliate Page](#97-referral--affiliate-page)
   - 9.8 [Admin Dashboard](#98-admin-dashboard)
   - 9.9 [Network Status Page](#99-network-status-page)
   - 9.10 [About / FAQ Page](#910-about--faq-page)
10. [Payment Integration](#10-payment-integration)
11. [User Account System](#11-user-account-system)
12. [Reseller / Agent System](#12-reseller--agent-system)
13. [Referral & Affiliate System](#13-referral--affiliate-system)
14. [Admin System](#14-admin-system)
15. [Notification System](#15-notification-system)
16. [Data Model & Schema](#16-data-model--schema)
17. [API Routes (Internal — Next.js)](#17-api-routes-internal--nextjs)
18. [Security & Compliance](#18-security--compliance)
19. [Performance Requirements](#19-performance-requirements)
20. [SEO & Metadata](#20-seo--metadata)
21. [Deployment & Infrastructure](#21-deployment--infrastructure)
22. [Phased Rollout Plan](#22-phased-rollout-plan)
23. [Open Questions & Risks](#23-open-questions--risks)

---

## 1. Project Overview

**TamalData** is a premium data bundle marketplace built for the Ghanaian market, powered by the DataMart Ghana API. It serves both direct retail customers purchasing data for personal use and reseller agents running their own data-selling operations.

The product is not just a functional utility — it is a premium digital experience designed to stand entirely apart from the utilitarian look of competing data platforms in Ghana. The aesthetic direction is cinematic, dark-mode, deep blue/purple space-tech premium, drawing on the visual grammar of world-class fintech and SaaS products with parallax depth, 3D scroll-driven reveals, and micro-interaction polish.

**Core value propositions:**
- Cheapest data bundles in Ghana (MTN, Telecel, AirtelTigo) sourced via DataMart Ghana API
- Instant delivery with real-time order tracking
- Optional account system — buy as a guest or sign up for wallet, history, and referrals
- A tiered reseller programme with wholesale pricing and per-agent storefronts
- A visual and UX experience that converts on first impression

---

## 2. Goals & Success Metrics

### Business Goals

| Goal | Metric | Target (Month 3) |
|---|---|---|
| Drive data purchase conversions | Conversion rate (visits → orders) | ≥ 8% |
| Build repeat user base | Return visitor rate | ≥ 40% |
| Grow reseller network | Active reseller accounts | ≥ 50 agents |
| Referral-driven growth | Orders attributed to referral codes | ≥ 20% of total |
| Operational efficiency | Average order-to-delivery time | < 2 minutes |

### Product Goals

- Zero checkout friction for guest users (max 3 taps from landing to paid)
- Sub-2s page load on mobile (LCP < 2.5s on 4G)
- Full mobile responsiveness with touch-optimised interactions
- Admin can process, refund, and monitor all orders without developer intervention

---

## 3. Target Audience & User Personas

### Persona 1 — Kwame, the Casual Buyer
- Age: 18–35, student or young professional in Accra
- Behaviour: Runs out of data, needs it instantly, does not want to create an account
- Goal: Buy 1GB–5GB in under 2 minutes and go
- Pain point: Competitors have clunky UIs, slow confirmation, and hidden charges
- TamalData entry point: Landing page → guest checkout

### Persona 2 — Abena, the Power User
- Age: 25–40, professional who buys data regularly for herself and family
- Behaviour: Logs in, checks history, tops up multiple numbers
- Goal: Wallet system, quick reorder, track spending
- Pain point: Having to re-enter phone numbers and wait for each confirmation
- TamalData entry point: Registered account → dashboard → quick reorder

### Persona 3 — Kofi, the Data Reseller Agent
- Age: 22–45, side-hustler or full-time data vendor
- Behaviour: Buys data at wholesale price, resells to contacts at markup
- Goal: Fast bulk ordering, per-network pricing visibility, agent storefront link
- Pain point: Existing platforms don't give resellers a clean branded interface
- TamalData entry point: Reseller sign-up → portal → dedicated agent store URL

### Persona 4 — Admin (Client / Internal)
- Goal: View all orders, flag failed deliveries, manage wallet balances, toggle network availability, monitor API health
- TamalData entry point: `/admin` — protected, role-gated

---

## 4. Technical Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + CSS custom properties |
| Animation | Framer Motion (scroll/parallax/transitions) + GSAP (3D scroll, hero sequences) |
| 3D / WebGL | Three.js or React Three Fiber (hero globe/particle background) |
| State Management | Zustand (global cart/auth state) |
| Forms | React Hook Form + Zod (validation) |
| Icons | Lucide React |
| Fonts | `next/font` (Google Fonts — see Design System) |

### Backend / API Layer
| Layer | Technology |
|---|---|
| API routes | Next.js Route Handlers (`/app/api/`) |
| Database | PostgreSQL (via Supabase or Railway) |
| ORM | Prisma |
| Auth | NextAuth.js v5 (credentials + session) |
| External API | DataMart Ghana REST API (see Section 5) |
| Payments | MTN MoMo API, Telecel Cash API, AirtelTigo Money API |
| SMS/Email | Arkesel (Ghana SMS) or Termii for order alerts |
| Caching | Redis (Upstash) — bundle price cache, network status |

### DevOps & Infrastructure
| Layer | Technology |
|---|---|
| Hosting | Vercel (frontend + serverless functions) |
| Database | Supabase / Railway PostgreSQL |
| Domain | Custom `.com.gh` or `.shop` domain |
| CI/CD | GitHub Actions → Vercel preview/production deploys |
| Error Monitoring | Sentry |
| Analytics | Vercel Analytics + PostHog (optional) |

---

## 5. DataMart Ghana API Integration

> **Note:** The DataMart Ghana API documentation lives at `https://www.datamartgh.shop/api-doc`. The site is fully client-rendered so the developer must visit this URL directly to read all available endpoints. The following is derived from known patterns in the Ghana data reseller API ecosystem and from the DataMart Ghana public-facing product. The developer must validate each endpoint, auth method, and response shape against the live documentation before implementing.

### 5.1 Authentication

DataMart Ghana APIs in this class typically use API key authentication passed as a header or query parameter. The developer should:

1. Register as a developer/reseller on `datamartgh.shop`
2. Obtain an API key from the developer dashboard
3. Store the key in a Next.js environment variable: `DATAMART_API_KEY`
4. Never expose this key client-side — all calls to DataMart must be proxied through TamalData's own Next.js API routes

```
DATAMART_API_KEY=your_key_here
DATAMART_BASE_URL=https://www.datamartgh.shop/api
```

### 5.2 Expected Core Endpoints

Based on the DataMart Ghana platform and standard data reseller API patterns, the following endpoints are expected. Confirm exact paths and payloads from the live docs:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/balance` | GET | Fetch current DataMart wallet balance |
| `/api/bundles` or `/api/packages` | GET | List all available bundles per network |
| `/api/order` or `/api/purchase` | POST | Place a data order to a phone number |
| `/api/order/:id` or `/api/status/:ref` | GET | Check order delivery status |
| `/api/networks` | GET | Get network availability / status |

### 5.3 Bundle Object (Expected Shape)

```json
{
  "id": "mtn-1gb-30d",
  "network": "MTN",
  "size": "1GB",
  "validity": "30 days",
  "price": 7.50,
  "type": "non-expiry",
  "available": true
}
```

### 5.4 Order Request (Expected Shape)

```json
{
  "network": "MTN",
  "phone": "0244XXXXXX",
  "bundle_id": "mtn-1gb-30d",
  "reference": "TAMAL-20260615-00123"
}
```

### 5.5 TamalData Proxy Layer

All DataMart API calls must go through TamalData's own route handlers:

```
/app/api/bundles/route.ts       → proxies GET /api/bundles from DataMart
/app/api/order/route.ts         → proxies POST /api/order to DataMart
/app/api/order/[ref]/route.ts   → proxies GET /api/status/:ref
/app/api/balance/route.ts       → proxies GET /api/balance (admin only)
/app/api/networks/route.ts      → proxies GET /api/networks
```

This proxy approach:
- Keeps the API key server-side only
- Allows TamalData to apply its own markup logic before calling DataMart
- Enables caching (bundle prices cached in Redis for 5 minutes)
- Allows TamalData to log every transaction internally

### 5.6 Pricing Markup Strategy

TamalData buys at DataMart's reseller/API price and applies a margin before presenting to the customer. This is configured in an admin-controlled pricing table in the database — not hardcoded. The markup can be set per network, per bundle size, or globally.

```
Customer-facing price = DataMart API price × (1 + markup_percentage)
```

Reseller agents receive a lower markup tier (configurable in the reseller settings).

### 5.7 Error Handling & Fallbacks

- If DataMart API is unreachable: return a friendly error, do not charge the user
- If order is placed but no delivery confirmation within 10 minutes: flag for manual review in admin
- All failed orders must be logged in the `orders` table with status `FAILED` and a reason field
- DataMart balance must be monitored — if it drops below a configurable threshold, alert the admin via SMS/email and display a maintenance banner

---

## 6. Information Architecture & Site Map

```
TamalData/
├── / (Landing Page)
├── /buy (Buy Data — main conversion page)
├── /track (Order Tracking)
├── /status (Network Status)
├── /about (About + FAQ)
├── /auth/
│   ├── /login
│   └── /register
├── /dashboard/ (authenticated users)
│   ├── /dashboard (overview — wallet, recent orders)
│   ├── /dashboard/orders
│   ├── /dashboard/wallet
│   └── /dashboard/referrals
├── /reseller/ (authenticated resellers)
│   ├── /reseller (portal overview)
│   ├── /reseller/orders
│   ├── /reseller/pricing
│   ├── /reseller/storefront
│   └── /reseller/earnings
├── /shop/[agentSlug] (public-facing reseller storefront)
└── /admin/ (role-gated)
    ├── /admin (overview)
    ├── /admin/orders
    ├── /admin/users
    ├── /admin/resellers
    ├── /admin/pricing
    ├── /admin/api-health
    └── /admin/settings
```

---

## 7. Design System & Visual Language

### 7.1 Colour Palette

| Token | Hex | Role |
|---|---|---|
| `--color-bg-base` | `#05060F` | Page background — near-black with a blue cast |
| `--color-bg-surface` | `#0D0F1E` | Cards, modals, elevated surfaces |
| `--color-bg-elevated` | `#141629` | Input fields, nav, secondary surfaces |
| `--color-accent-primary` | `#4F6EF7` | Primary CTA, links, active states — electric indigo |
| `--color-accent-glow` | `#7C9BFF` | Glow halos, gradient midpoint, hover shimmer |
| `--color-accent-purple` | `#8B5CF6` | Secondary accent — violet for gradient sweeps |
| `--color-accent-cyan` | `#22D3EE` | Network status indicators, live badges |
| `--color-text-primary` | `#F0F2FF` | Headings, primary body text |
| `--color-text-secondary` | `#8890B5` | Labels, meta text, captions |
| `--color-text-muted` | `#4B5280` | Placeholders, disabled states |
| `--color-success` | `#10B981` | Successful orders, delivered status |
| `--color-warning` | `#F59E0B` | Pending, processing status |
| `--color-error` | `#EF4444` | Failed orders, error states |
| `--color-border` | `#1E2240` | Subtle borders, dividers |

**Hero gradient:** `linear-gradient(135deg, #05060F 0%, #0D0F2E 50%, #1A0A3D 100%)`
**CTA gradient:** `linear-gradient(90deg, #4F6EF7 0%, #8B5CF6 100%)`
**Glow effect:** `box-shadow: 0 0 40px rgba(79, 110, 247, 0.25), 0 0 80px rgba(139, 92, 246, 0.1)`

### 7.2 Typography

| Role | Typeface | Weight | Usage |
|---|---|---|---|
| Display / Hero | `Space Grotesk` | 700, 800 | Hero headlines, section titles |
| Body | `Inter` | 400, 500 | All body copy, descriptions |
| Mono / Data | `JetBrains Mono` | 400, 500 | Phone numbers, reference codes, prices |
| UI Labels | `Inter` | 600 | Button text, nav items, badges |

**Type scale:**
```
--text-xs:   0.75rem   / 12px
--text-sm:   0.875rem  / 14px
--text-base: 1rem      / 16px
--text-lg:   1.125rem  / 18px
--text-xl:   1.25rem   / 20px
--text-2xl:  1.5rem    / 24px
--text-3xl:  1.875rem  / 30px
--text-4xl:  2.25rem   / 36px
--text-5xl:  3rem      / 48px
--text-6xl:  3.75rem   / 60px
--text-7xl:  4.5rem    / 72px  (hero only)
```

### 7.3 Spacing & Layout

- Base unit: `4px` (`--space-1`)
- Max content width: `1280px` (`--max-w-content`)
- Section padding: `120px` vertical on desktop, `64px` on mobile
- Card border-radius: `16px` (`--radius-card`)
- Button border-radius: `12px` (`--radius-btn`)
- Input border-radius: `10px` (`--radius-input`)

### 7.4 Signature Design Element

The single unforgettable element of TamalData is a **live WebGL particle field rendered in the hero** — a deep space starfield where particles subtly drift and respond to the user's cursor. Behind the headline, a large low-poly 3D sphere (Ghana-blue to purple gradient) rotates slowly and parallaxes at 0.3× scroll speed, creating the sensation that you are looking at a living, breathing digital object. This is not decoration — it says: *this platform is alive, technical, and premium.* No other data reselling platform in Ghana touches this.

### 7.5 Component Library Reference

All components are custom-built in Tailwind + Framer Motion, not a UI kit. Key reusable components:

| Component | Description |
|---|---|
| `<NetworkCard />` | Network selector tile (MTN/Telecel/AirtelTigo) with logo, status badge, animated border on hover |
| `<BundleCard />` | Data bundle option — size, price, validity, selection state with glow ring |
| `<GlowButton />` | Primary CTA button with purple-blue gradient, hover pulse glow |
| `<GlassPanel />` | Frosted glass card — `backdrop-filter: blur(20px)`, semi-transparent border |
| `<StatusBadge />` | Pill badge: Delivered (green), Processing (amber), Failed (red), Pending (muted) |
| `<OrderTimeline />` | Vertical step-by-step order progress indicator |
| `<WalletDisplay />` | Balance card with animated counter |
| `<AgentStoreCard />` | Reseller storefront preview card |
| `<LiveDot />` | Pulsing dot indicator for network status |
| `<ParticleHero />` | WebGL Three.js hero canvas component |

---

## 8. Motion & Interaction Design

### 8.1 Scroll-Driven Parallax System

The entire site uses a layered parallax architecture managed with GSAP ScrollTrigger:

| Layer | Parallax Speed | Elements |
|---|---|---|
| Background | `0.1×` scroll | Particle field, star noise texture |
| Mid-ground | `0.3×` scroll | 3D sphere, floating network logos |
| Foreground | `1×` scroll | Content text, cards, CTAs (normal scroll) |
| Overlay | `1.15×` scroll | Decorative glows, gradient orbs |

**Implementation:** Use `gsap.to(element, { y: parallaxValue, scrollTrigger: { scrub: 1 } })` for smooth, scrub-tied parallax.

### 8.2 3D Scroll Sections

Three sections use 3D perspective transforms on scroll:

1. **Hero globe** — rotates and scales on scroll using Three.js + ScrollTrigger
2. **Network selector** — cards fan out in 3D perspective as section enters viewport (`rotateY(-15deg)` → `rotateY(0deg)`)
3. **Features showcase** — stacked card deck that spreads on scroll (`translateZ(-100px)` → `translateZ(0)`, `rotateX(20deg)` → `rotateX(0deg)`)

### 8.3 Page Transitions

Next.js App Router page transitions using Framer Motion `AnimatePresence`:
- Exit: `opacity: 0, y: 20` over `0.2s`
- Enter: `opacity: 1, y: 0` over `0.3s ease-out`
- Transition stagger on section children: `0.05s` delay per element

### 8.4 Micro-interactions

| Element | Interaction |
|---|---|
| `<GlowButton />` | Hover: glow expands outward, scale 1.02. Active: scale 0.98. |
| `<BundleCard />` | Hover: border lights up gradient, slight translateY(-4px). Selected: persistent glow ring. |
| `<NetworkCard />` | Hover: card tilts subtly in 3D (mouse-tracking tilt, max ±8deg). |
| Input fields | Focus: border transitions to accent blue, glow appears below field. |
| Copy button (ref codes) | Click: icon morphs from copy → checkmark, resets after 2s. |
| Wallet balance | On dashboard load: animated count-up from 0 to current balance. |
| Status badge | Delivered status: brief green pulse on first render. |
| Live network status | Pulse animation on `<LiveDot />` every 2s when network is active. |

### 8.5 Loading States

- Skeleton loaders for bundle lists (shimmer animation, `--color-bg-elevated` base)
- Full-page loading overlay on initial auth check (site logo pulses)
- Order placement: button morphs into spinner, then success/error state
- Reduced motion: all animations respect `prefers-reduced-motion: reduce` media query

---

## 9. Page-by-Page Specifications

### 9.1 Landing Page (Home)

**Route:** `/`
**Purpose:** Convert visitors into buyers. Establish premium brand identity.

#### Sections

**Section 1 — Hero**
- Full-viewport height
- WebGL particle field background (Three.js `<ParticleHero />`)
- 3D rotating globe, low-poly, Ghana-blue to purple gradient
- Headline: `"Ghana's Fastest Data. Lowest Prices."` (Space Grotesk 72px, white)
- Sub-headline: `"MTN, Telecel, AirtelTigo data bundles from GH₵1. Delivered in seconds."` (Inter 20px, secondary)
- Two CTAs: `"Buy Data Now"` (GlowButton, primary) and `"Track Order"` (ghost button)
- Floating social proof badge: `"30,000+ orders delivered"` with animated count
- Scroll indicator: animated chevron with fade-in delay

**Section 2 — Network Selector Teaser**
- Headline: `"Every Network. One Platform."`
- Three oversized network cards (MTN, Telecel, AirtelTigo) with logos, live status dot, and cheapest bundle price shown
- On click: routes to `/buy?network=MTN` etc.
- 3D fan-out reveal on scroll entry

**Section 3 — Why TamalData**
- 4-column feature grid (GlassPanel cards):
  - ⚡ Instant Delivery — data lands in under 2 minutes
  - 💸 Lowest Prices — guaranteed cheapest bundles in Ghana
  - 🔒 Secure Payments — MoMo, Telecel Cash, AirtelTigo Money
  - 📦 No Account Needed — buy as a guest, no sign-up required
- Each card reveals with staggered scroll-triggered fade-up

**Section 4 — Live Order Feed**
- Real-time anonymised order feed (e.g., `"0244***XXX received 2GB MTN — just now"`)
- Vertical scrolling ticker, auto-animates
- Builds FOMO and social proof

**Section 5 — Pricing Preview**
- Tabbed panel: MTN | Telecel | AirtelTigo
- Shows bundle grid (size, price, validity) for the selected network
- CTA per bundle: `"Buy Now"` → routes to `/buy` with bundle pre-selected

**Section 6 — Reseller CTA Banner**
- Full-width section with gradient sweep background
- Headline: `"Sell Data. Earn Daily."`
- Body: `"Join the TamalData reseller programme. Buy wholesale. Set your price. Get paid."`
- CTA: `"Become a Reseller"` → routes to `/auth/register?role=reseller`

**Section 7 — FAQ Accordion**
- 6–8 most common questions (How long does delivery take? Is it non-expiry? etc.)
- Accordion with smooth height animation

**Section 8 — Footer**
- Logo, tagline
- Links: Buy Data, Track Order, Become a Reseller, Network Status, FAQ
- Social: Twitter/X, WhatsApp, Instagram
- Legal: Privacy Policy, Terms of Service
- Copyright: `© 2026 TamalData`

---

### 9.2 Buy Data Page

**Route:** `/buy`
**Purpose:** Core conversion funnel. Guest and authenticated flow.

#### Step Flow

```
Step 1: Select Network (MTN / Telecel / AirtelTigo)
Step 2: Select Bundle (size + price grid)
Step 3: Enter phone number
Step 4: Select payment method
Step 5: Confirm & Pay
Step 6: Order confirmation + tracking reference
```

#### Layout

- Left column (60%): Step-by-step form
- Right column (40%): Order summary panel (sticky on desktop) — network, bundle, price, phone number, total

#### Step 1 — Network Selection
- Three cards: MTN (yellow accent), Telecel (red accent), AirtelTigo (blue accent)
- Live network status badge on each card
- Selected state: glowing border ring, card slightly elevated

#### Step 2 — Bundle Selection
- Grid of `<BundleCard />` components loaded from DataMart API (cached)
- Filter chips: `All | 1GB–5GB | 5GB+ | Non-Expiry`
- Sorted by price ascending by default
- Skeleton loader while bundles fetch

#### Step 3 — Phone Number
- Input: Ghana phone number (`0XX XXXX XXXX` format)
- Auto-detects network from prefix (0244/0245/0246 → MTN, 0200/0202 → Telecel, 0260/0261 → AirtelTigo)
- Warning if detected network doesn't match selected network
- Checkbox: `"Save this number to my account"` (authenticated users only)
- For registered users: `"Send to a saved number"` quick-select dropdown

#### Step 4 — Payment Method
- Three options: MTN MoMo | Telecel Cash | AirtelTigo Money
- Each shown as a card with logo, subtle disabled state if network balance insufficient
- MoMo number input field (pre-filled if saved on account)

#### Step 5 — Confirm & Pay
- Full order summary recap
- Terms acknowledgement checkbox
- `<GlowButton />` — `"Pay GH₵X.XX"`
- On click: initiates payment prompt on user's phone

#### Step 6 — Order Confirmation
- Animated success state (checkmark draws in, particles burst)
- Order reference number (monospace, copyable)
- Delivery estimate: `"Your data will arrive within 2 minutes"`
- CTA: `"Track This Order"` → `/track?ref=TAMAL-XXXX`
- Secondary CTA: `"Buy Another"` resets form

#### Guest vs Authenticated Differences
| | Guest | Authenticated |
|---|---|---|
| Phone number save | No | Yes |
| Order history | Via reference only | Full dashboard |
| Wallet payment | No | Yes |
| Faster reorder | No | Yes (1-click reorder) |
| Referral discount | No | Yes |

---

### 9.3 Order Tracking Page

**Route:** `/track`
**Query params:** `?ref=TAMAL-XXXX`

- Single input: order reference number
- On submit: queries DataMart API `/api/status/:ref` via TamalData's proxy
- Shows `<OrderTimeline />` component:
  ```
  ✅ Order Placed       — 2:14 PM
  ✅ Payment Confirmed  — 2:14 PM
  ⏳ Dispatching Data  — 2:15 PM
  ○  Delivered          — pending
  ```
- Auto-refreshes every 30 seconds while status is `PENDING` or `PROCESSING`
- Delivered: green timeline, confetti animation, `"Data successfully delivered to 0244XXXXXX"`
- Failed: red state, reason shown, `"Contact Support"` CTA

---

### 9.4 Auth Pages (Register / Login)

**Routes:** `/auth/login`, `/auth/register`

#### Login
- Email or phone number input
- Password input
- `"Forgot password?"` link
- `"Login"` CTA
- `"Don't have an account? Register"` link
- Social login: none (keep it simple, MoMo-native users)

#### Register
- Full name
- Phone number (becomes username / primary contact)
- Email (optional — for order receipts)
- Password + confirm
- Role selection: `"I'm a regular buyer"` / `"I want to become a reseller"` (toggles reseller onboarding flow)
- Terms & Privacy checkbox
- `"Create Account"` CTA

#### Post-registration
- Welcome modal with brief animated onboarding tips
- Redirect to `/dashboard` or `/reseller` depending on role

---

### 9.5 User Dashboard

**Route:** `/dashboard`
**Access:** Authenticated users (non-reseller)

#### Overview Tab
- Wallet balance card (GlassPanel, animated count-up)
- Quick actions: `"Buy Data"`, `"Fund Wallet"`, `"Track Order"`
- Recent orders table (last 5): network, size, phone, status, date
- Referral earnings summary card

#### Orders Tab (`/dashboard/orders`)
- Full paginated order history table
- Filter by: network, status, date range
- Each row: expandable to show full order details
- `"Reorder"` button per row → pre-fills `/buy` form

#### Wallet Tab (`/dashboard/wallet`)
- Balance display
- Fund wallet: enter amount → select MoMo network → pay
- Transaction history: credits (funding, referral earnings) and debits (purchases)

#### Referrals Tab (`/dashboard/referrals`)
- Unique referral link (copyable, shareable)
- Stats: Total referrals, Active referrals, Total earnings
- Earnings breakdown table
- Payout request button (when earnings ≥ minimum threshold)

---

### 9.6 Reseller Portal

**Route:** `/reseller`
**Access:** Authenticated users with `role: RESELLER`

#### Overview
- Dashboard cards: Today's orders, Today's revenue, Total earnings, Wallet balance
- Performance chart: 7-day order volume line graph
- Quick order button (same flow as `/buy` but at reseller pricing tier)

#### Orders Tab (`/reseller/orders`)
- Full order history with reseller-specific columns: cost price, sell price, margin
- Bulk order capability: upload CSV of `phone,network,bundle` rows

#### Pricing Tab (`/reseller/pricing`)
- View current reseller pricing per network/bundle
- Comparison table: TamalData retail price vs. reseller price vs. suggested sell price
- Reseller profit calculator (interactive — enter sell price, see margin)

#### My Storefront (`/reseller/storefront`)
- Agent's public store URL: `tamaldata.com/shop/[agentSlug]`
- Storefront customisation: display name, WhatsApp contact, profile photo
- Toggle: which networks/bundles to show on public store
- Preview mode: see exactly what customers see on their store

#### Earnings (`/reseller/earnings`)
- Total earned, pending payout, paid out
- Payout history
- Request withdrawal (MoMo number, minimum GH₵20)

---

### 9.7 Referral & Affiliate Page

**Route:** `/dashboard/referrals` (also marketed on landing page)

- Referral mechanics: Referred user places first order → referrer earns X% (admin-configured, default 2%)
- Referral link format: `tamaldata.com/buy?ref=SPNCR123`
- Referral code also shareable as a standalone code (entered at checkout)
- Earnings credited to wallet immediately after referred order delivers

---

### 9.8 Admin Dashboard

**Route:** `/admin`
**Access:** `role: ADMIN` only — server-side redirects all non-admin

#### Overview
- KPI cards: Today's orders, Revenue, Active users, DataMart balance, Failed orders (last 24h)
- Order volume chart (daily/weekly/monthly toggle)
- Recent orders live feed

#### Orders (`/admin/orders`)
- Full orders table with all fields
- Filters: status, network, date range, user
- Actions per order: Mark delivered, Mark failed, Initiate refund, View details
- Bulk actions: Export CSV, Mark selected as reviewed

#### Users (`/admin/users`)
- User table: name, phone, email, role, wallet balance, order count, join date
- Actions: View profile, Adjust wallet balance, Suspend account, Upgrade to reseller

#### Resellers (`/admin/resellers`)
- Reseller table: name, total orders, total revenue, earnings owed
- Approve/reject reseller applications
- Configure per-reseller pricing tier
- Manage payout requests

#### Pricing (`/admin/pricing`)
- Global markup % per network
- Override pricing per individual bundle
- Reseller markup tier configuration
- Pricing preview: shows what customer pays at each tier

#### API Health (`/admin/api-health`)
- DataMart API status (last ping, response time, last successful order)
- DataMart wallet balance with low-balance alert threshold setting
- Failed order log (reason + timestamp)
- Manual retry button for stuck orders

#### Settings (`/admin/settings`)
- Site maintenance mode toggle (shows maintenance banner sitewide)
- Referral commission % setting
- Minimum payout threshold setting
- SMS/email alert configuration
- Network status override (manually mark a network as degraded)

---

### 9.9 Network Status Page

**Route:** `/status`
**Purpose:** Transparency page showing real-time operational status of each network.

- Three status cards: MTN, Telecel, AirtelTigo
- Each shows: `Operational` / `Degraded` / `Offline`
- Last updated timestamp + auto-refreshes every 60 seconds
- Status derived from: DataMart API ping + admin manual override
- Historical uptime bar (last 30 days, colour-coded per day)
- Incident log: any manually-logged degradation events

---

### 9.10 About / FAQ Page

**Route:** `/about`

- Brief brand story + mission statement
- FAQ accordion (10–12 questions covering delivery time, refunds, non-expiry, reseller programme, payment methods)
- Contact section: WhatsApp link, email, social handles
- Trust badges: `"Licensed DataMart Reseller"`, `"Secure Payments"`, `"30,000+ Orders Delivered"`

---

## 10. Payment Integration

### 10.1 Supported Methods

| Method | Provider | Flow |
|---|---|---|
| MTN Mobile Money | MTN MoMo API (Hubtel or direct) | USSD push prompt to customer's phone |
| Telecel Cash | Telecel API | USSD push prompt |
| AirtelTigo Money | AirtelTigo API | USSD push prompt |

### 10.2 Payment Flow

```
1. Customer selects payment method + enters MoMo number
2. TamalData backend calls MoMo provider API to initiate charge
3. Customer receives USSD prompt on their phone
4. Customer approves payment on phone
5. TamalData receives webhook callback confirming payment
6. On confirmed payment: TamalData calls DataMart API to place order
7. Order status updates in DB; customer sees success screen
```

### 10.3 Wallet Payment Flow (Registered Users)

```
1. Customer selects "Pay from Wallet"
2. System checks wallet balance ≥ order total
3. Wallet balance decremented atomically in DB transaction
4. DataMart order placed immediately (no MoMo wait)
5. Faster delivery path
```

### 10.4 Wallet Top-Up Flow

```
1. User enters top-up amount on /dashboard/wallet
2. Selects MoMo network
3. USSD prompt sent to phone
4. On confirmed payment: wallet balance incremented in DB
5. Transaction logged
```

### 10.5 Refund Policy

- Failed orders (not delivered within 15 minutes): automatic refund to wallet
- Wallet-funded orders: immediate refund to wallet
- MoMo-funded orders: refund to wallet (not back to MoMo — per policy)
- Admin can manually issue refunds from `/admin/orders`

---

## 11. User Account System

### 11.1 Roles

| Role | Permissions |
|---|---|
| `GUEST` | Buy data, track orders by reference only |
| `USER` | All guest permissions + wallet, dashboard, saved numbers, referrals |
| `RESELLER` | All user permissions + reseller portal, wholesale pricing, agent storefront |
| `ADMIN` | All permissions + admin dashboard |

### 11.2 Auth Implementation (NextAuth.js v5)

- Strategy: JWT sessions stored in HTTP-only cookies
- Credentials provider: phone/email + password (bcrypt hashed)
- Session data: `{ id, name, phone, email, role, walletBalance }`
- Protected routes: middleware checks session role; redirect to `/auth/login` or `/` based on role

### 11.3 Saved Phone Numbers

- Users can save up to 10 phone numbers (own number + family/friends)
- Each saved number: label (e.g., "My MTN", "Dad's Telecel"), number, network
- Quick-select at checkout Step 3

### 11.4 Password Reset

- Enter phone number → receive SMS OTP via Arkesel
- Enter OTP → set new password

---

## 12. Reseller / Agent System

### 12.1 Reseller Tiers

| Tier | Requirement | Markup Reduction |
|---|---|---|
| Standard Reseller | Sign up + approval | Base reseller price |
| Silver Agent | 100+ orders/month | −2% off reseller price |
| Gold Agent | 500+ orders/month | −4% off reseller price |

Tiers recalculate monthly. Admin can manually override a reseller's tier.

### 12.2 Agent Storefront

Each reseller gets a public-facing storefront at `tamaldata.com/shop/[agentSlug]`. This page:
- Inherits TamalData's branding but shows the agent's display name and WhatsApp contact
- Shows only the bundles the agent has enabled
- Prices shown are TamalData retail prices (agent earns the margin silently)
- Orders placed through the storefront are attributed to the agent in the DB

### 12.3 Reseller Approval Flow

1. User registers with `role: RESELLER`
2. Account is created with `status: PENDING_APPROVAL`
3. Admin sees application in `/admin/resellers`
4. Admin approves → user is notified via SMS → reseller portal unlocked
5. Auto-approval can be toggled in admin settings

### 12.4 Reseller Payouts

- Earnings accrue in the reseller's wallet
- Payout requests submitted via portal
- Admin reviews and processes via MoMo transfer
- Minimum payout: GH₵20 (admin-configurable)

---

## 13. Referral & Affiliate System

### 13.1 Mechanics

- Every registered user gets a unique referral code (6 characters, e.g., `TAML-SP4CE`)
- Referral link: `tamaldata.com/buy?ref=TAML-SP4CE`
- When a new user registers via this link OR enters the code at checkout:
  - Referrer earns X% of the order total (default 2%, admin-configurable)
  - Earnings credited to referrer's wallet on order delivery confirmation
- No cap on referral earnings

### 13.2 Attribution

- Referral code stored in cookie for 30 days (last-touch attribution)
- If new user registers: referral permanently linked to their account
- Referral earnings dashboard shows per-referral breakdown

---

## 14. Admin System

### 14.1 Access Control

- Admin route group `/admin/*` protected by Next.js middleware
- Middleware checks `session.role === 'ADMIN'`; non-admin gets 403 redirect
- Admin credentials managed directly in DB (no self-serve admin creation)

### 14.2 Order Management

- Admin can manually mark an order as `DELIVERED`, `FAILED`, or `REFUNDED`
- Refund action decrements DataMart balance record and credits user wallet
- All admin actions are logged in an `audit_log` table with timestamp and admin ID

### 14.3 Alerts

Admin receives SMS + email alert when:
- DataMart wallet balance falls below threshold (configurable, e.g., GH₵500)
- More than 5 failed orders in 30 minutes (possible API outage)
- New reseller application submitted
- Payout request submitted

---

## 15. Notification System

### 15.1 User Notifications

| Event | Channel | Recipient |
|---|---|---|
| Order placed | SMS | Customer phone |
| Order delivered | SMS | Customer phone |
| Order failed | SMS | Customer phone |
| Wallet funded | SMS | User |
| Referral earning | In-app | User dashboard |
| Reseller approved | SMS + In-app | Reseller |

### 15.2 SMS Provider

- **Primary:** Arkesel (Ghanaian SMS gateway, supports local numbers)
- Sender ID: `TamalData`
- SMS templates stored in DB (admin-editable)

### 15.3 In-App Notifications

- Bell icon in dashboard nav
- Notification dropdown: max 20 recent, mark-as-read
- Stored in `notifications` DB table

---

## 16. Data Model & Schema

### Core Tables (Prisma Schema)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  phone         String    @unique
  email         String?   @unique
  passwordHash  String
  role          Role      @default(USER)
  resellerStatus ResellerStatus?
  walletBalance Decimal   @default(0)
  referralCode  String    @unique
  referredById  String?
  referredBy    User?     @relation("Referrals", fields: [referredById], references: [id])
  referrals     User[]    @relation("Referrals")
  savedNumbers  SavedNumber[]
  orders        Order[]
  notifications Notification[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Order {
  id              String      @id @default(cuid())
  reference       String      @unique  // TAMAL-YYYYMMDD-XXXXX
  userId          String?     // null for guest orders
  user            User?       @relation(fields: [userId], references: [id])
  agentId         String?     // reseller attribution
  network         Network
  bundleId        String      // DataMart bundle ID
  bundleSize      String      // "1GB"
  bundleValidity  String      // "30 days"
  recipientPhone  String
  costPrice       Decimal     // price paid to DataMart
  sellPrice       Decimal     // price charged to customer
  paymentMethod   PaymentMethod
  paymentRef      String?     // MoMo transaction ID
  status          OrderStatus @default(PENDING)
  datamartRef     String?     // DataMart's own order reference
  failureReason   String?
  deliveredAt     DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model SavedNumber {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  label     String
  phone     String
  network   Network
}

model WalletTransaction {
  id          String              @id @default(cuid())
  userId      String
  type        TransactionType     // CREDIT | DEBIT
  amount      Decimal
  description String
  orderId     String?
  createdAt   DateTime            @default(now())
}

model Notification {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  title     String
  body      String
  read      Boolean   @default(false)
  createdAt DateTime  @default(now())
}

model AuditLog {
  id          String    @id @default(cuid())
  adminId     String
  action      String
  targetType  String
  targetId    String
  metadata    Json?
  createdAt   DateTime  @default(now())
}

enum Role {
  GUEST
  USER
  RESELLER
  ADMIN
}

enum ResellerStatus {
  PENDING_APPROVAL
  APPROVED
  SUSPENDED
}

enum Network {
  MTN
  TELECEL
  AIRTELTIGO
}

enum OrderStatus {
  PENDING
  PAYMENT_CONFIRMED
  PROCESSING
  DELIVERED
  FAILED
  REFUNDED
}

enum PaymentMethod {
  MTN_MOMO
  TELECEL_CASH
  AIRTELTIGO_MONEY
  WALLET
}

enum TransactionType {
  CREDIT
  DEBIT
}
```

---

## 17. API Routes (Internal — Next.js)

All routes live under `/app/api/`. Public routes are callable without auth. Protected routes require a valid session or admin role.

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/bundles` | GET | Public | Fetch bundle list per network from DataMart (cached 5min) |
| `/api/order` | POST | Public | Place a guest order |
| `/api/order/[ref]` | GET | Public | Get order status by reference |
| `/api/networks/status` | GET | Public | Get network operational status |
| `/api/auth/[...nextauth]` | ALL | — | NextAuth.js handler |
| `/api/auth/register` | POST | Public | Create new user account |
| `/api/wallet/topup` | POST | USER | Initiate wallet top-up |
| `/api/wallet/balance` | GET | USER | Get wallet balance |
| `/api/referral/stats` | GET | USER | Get referral stats and earnings |
| `/api/saved-numbers` | GET/POST/DELETE | USER | Manage saved phone numbers |
| `/api/reseller/apply` | POST | USER | Submit reseller application |
| `/api/reseller/orders` | GET | RESELLER | Get reseller order history |
| `/api/admin/orders` | GET | ADMIN | Get all orders with filters |
| `/api/admin/orders/[id]` | PATCH | ADMIN | Update order status |
| `/api/admin/users` | GET | ADMIN | Get all users |
| `/api/admin/users/[id]` | PATCH | ADMIN | Update user role/balance |
| `/api/admin/resellers` | GET/PATCH | ADMIN | Manage reseller applications |
| `/api/admin/pricing` | GET/PUT | ADMIN | View and update markup config |
| `/api/admin/datamart/balance` | GET | ADMIN | Get DataMart wallet balance |
| `/api/admin/datamart/health` | GET | ADMIN | Get DataMart API health status |
| `/api/webhooks/momo` | POST | — | MoMo payment callback |
| `/api/webhooks/telecel` | POST | — | Telecel Cash callback |
| `/api/webhooks/airteltigo` | POST | — | AirtelTigo Money callback |

---

## 18. Security & Compliance

### 18.1 API Key Protection
- `DATAMART_API_KEY` stored only in server-side environment variables (Vercel env vars)
- Never exposed to client-side code or browser network requests
- All DataMart calls proxied through TamalData's own Route Handlers

### 18.2 Payment Security
- MoMo webhook endpoints verify HMAC signature before processing
- Payment confirmation is always server-side; client never self-reports payment success
- No card data stored — all payment data handled exclusively by MoMo provider APIs

### 18.3 Input Validation
- All inputs validated server-side with Zod schemas regardless of client-side validation
- Phone number validation: Ghana number format (`/^0[2345][0-9]{8}$/`)
- SQL injection impossible via Prisma parameterised queries

### 18.4 Auth Security
- Passwords hashed with bcrypt (salt rounds: 12)
- JWT sessions with 7-day expiry
- HTTP-only cookies (no JS access to session token)
- CSRF protection via NextAuth.js built-in

### 18.5 Rate Limiting
- `/api/order` (guest): max 3 orders per IP per 5 minutes
- `/api/auth/register`: max 5 attempts per IP per hour
- Implemented via Upstash Redis rate limiting middleware

### 18.6 Data Privacy
- Phone numbers in order history masked in UI: `0244***XXX`
- GDPR-style data deletion available on account settings (soft delete)
- Audit logs retained for 90 days

---

## 19. Performance Requirements

| Metric | Target | Tool |
|---|---|---|
| Largest Contentful Paint (LCP) | < 2.5s on 4G mobile | Vercel Analytics / Lighthouse |
| First Input Delay (FID) | < 100ms | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Bundle price API response | < 200ms (cached) | Internal logging |
| Order placement end-to-end | < 3s to confirmation | Internal logging |
| Three.js hero canvas | 60fps on desktop, 30fps floor on mobile | Browser DevTools |

### Optimisations
- Next.js ISR for marketing pages (1-hour revalidation)
- Redis cache for bundle prices (5-minute TTL)
- `next/image` for all images (automatic WebP conversion + lazy loading)
- Three.js canvas: only initialise on desktop (`window.innerWidth > 768`); replace with CSS gradient animation on mobile
- GSAP ScrollTrigger: batch DOM observations
- Code splitting per route (Next.js App Router default)
- Font preloading via `next/font`

---

## 20. SEO & Metadata

### 20.1 Page Metadata

Each page exports a `generateMetadata()` function:

```typescript
export const metadata: Metadata = {
  title: "TamalData — Ghana's Cheapest Data Bundles | MTN, Telecel, AirtelTigo",
  description: "Buy MTN, Telecel, AirtelTigo data bundles from GH₵1. Instant delivery. Lowest prices in Ghana. No account needed.",
  openGraph: {
    title: "TamalData — Ghana's Cheapest Data Bundles",
    description: "...",
    url: "https://tamaldata.com",
    siteName: "TamalData",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TamalData",
    description: "...",
    images: ["/og-image.jpg"],
  },
  keywords: ["buy data Ghana", "cheap data bundles Ghana", "MTN data bundles", "Telecel data", "AirtelTigo data", "data reseller Ghana", "TamalData"],
  robots: { index: true, follow: true },
};
```

### 20.2 Structured Data

JSON-LD on landing page:
```json
{
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "TamalData",
  "description": "Ghana's cheapest data bundle marketplace",
  "url": "https://tamaldata.com",
  "areaServed": "GH",
  "currenciesAccepted": "GHS"
}
```

### 20.3 Target Keywords

- `buy data Ghana` (high volume)
- `cheap data bundles Ghana`
- `MTN data bundles Ghana`
- `Telecel data Ghana`
- `AirtelTigo data Ghana`
- `data reseller Ghana`
- `non-expiry data Ghana`
- `buy data without account Ghana`

---

## 21. Deployment & Infrastructure

### 21.1 Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=https://tamaldata.com
NEXTAUTH_URL=https://tamaldata.com
NEXTAUTH_SECRET=

# DataMart API
DATAMART_API_KEY=
DATAMART_BASE_URL=https://www.datamartgh.shop/api

# Database
DATABASE_URL=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Payments
MTN_MOMO_API_KEY=
MTN_MOMO_BASE_URL=
TELECEL_API_KEY=
AIRTELTIGO_API_KEY=

# SMS
ARKESEL_API_KEY=
ARKESEL_SENDER_ID=TamalData

# Monitoring
SENTRY_DSN=
```

### 21.2 Deployment Pipeline

```
Developer pushes to main branch
→ GitHub Actions runs: type-check, lint, build
→ On success: Vercel auto-deploys to production
→ Pull requests: Vercel preview URL generated automatically
→ Sentry release created on each production deploy
```

### 21.3 Database Migrations

- Prisma Migrate for schema versioning
- Migrations run via `prisma migrate deploy` in CI before each production deploy
- Supabase / Railway database with daily automated backups

---

## 22. Phased Rollout Plan

### Phase 1 — Core MVP (Weeks 1–4)
**Goal:** Working end-to-end purchase flow

- [ ] Next.js project setup, Tailwind config, design tokens
- [ ] DataMart API integration (proxy layer, bundle fetch, order placement)
- [ ] Landing page (Hero + Network teaser + Why section + Pricing preview + Footer)
- [ ] Buy Data page (full guest checkout flow)
- [ ] Payment integration: MTN MoMo
- [ ] Order tracking page
- [ ] Order confirmation + SMS notification
- [ ] Basic admin: view orders, mark delivered/failed
- [ ] Deploy to Vercel + live domain

### Phase 2 — Accounts & Payments (Weeks 5–7)
**Goal:** User accounts, full payment suite, dashboard

- [ ] Auth system (register, login, NextAuth.js)
- [ ] User dashboard (overview, orders, wallet)
- [ ] Wallet top-up + wallet payment at checkout
- [ ] Telecel Cash + AirtelTigo Money payment integration
- [ ] Saved phone numbers
- [ ] Referral system (code generation, attribution, earnings)
- [ ] Network status page
- [ ] In-app notifications + notification bell
- [ ] About / FAQ page

### Phase 3 — Reseller System (Weeks 8–10)
**Goal:** Full reseller programme live

- [ ] Reseller registration + approval flow
- [ ] Reseller pricing tier system
- [ ] Reseller portal (overview, orders, pricing, earnings)
- [ ] Agent storefront (`/shop/[agentSlug]`)
- [ ] Reseller payout requests
- [ ] Admin: reseller management, pricing config

### Phase 4 — Polish & Growth (Weeks 11–12)
**Goal:** Full visual polish, performance, SEO

- [ ] Three.js hero globe + particle field
- [ ] GSAP ScrollTrigger parallax system
- [ ] 3D scroll sections (network fan, features deck)
- [ ] All Framer Motion page transitions + micro-interactions
- [ ] Performance audit (Core Web Vitals)
- [ ] Full SEO metadata + sitemap + robots.txt
- [ ] Lighthouse score ≥ 90 on all pages
- [ ] Reduced motion audit
- [ ] Full mobile QA across devices

### Phase 5 — Post-Launch (Month 2+)
- Reseller tier auto-promotion (Silver/Gold based on monthly volume)
- Push notifications (PWA)
- Bulk order CSV upload for resellers
- Agent referral sub-programme (resellers refer other resellers)
- Analytics dashboard in admin (PostHog integration)

---

## 23. Open Questions & Risks

| # | Question / Risk | Owner | Priority |
|---|---|---|---|
| 1 | Confirm exact DataMart API endpoint paths, auth format, and error codes from live docs | Developer (Spencer) | Critical |
| 2 | DataMart API rate limits — how many requests per minute are allowed? | Developer | High |
| 3 | Does DataMart API support webhook callbacks for order delivery, or does it require polling? | Developer | High |
| 4 | MTN MoMo API access — direct sandbox/production credentials needed. Which gateway is recommended for GH? (Hubtel, Arkesel, or direct MTN) | Client + Developer | Critical |
| 5 | Does the client have a registered business name for MoMo merchant onboarding? | Client | High |
| 6 | What is the initial DataMart wallet top-up amount / credit limit? | Client | Medium |
| 7 | What markup % does the client want to set at launch? | Client | High |
| 8 | What is the minimum reseller payout threshold and payout schedule? | Client | Medium |
| 9 | Does the client want a custom domain (tamaldata.com.gh vs tamaldata.com)? | Client | Medium |
| 10 | Should reseller storefront pages be indexable by Google, or noindex? | Client | Low |
| 11 | DataMart API may not have a dedicated `/networks/status` endpoint — fallback may be polling a test order or using admin override only | Developer | Medium |
| 12 | Three.js hero may impact LCP on mobile — test early, have CSS gradient fallback ready | Developer | Medium |

---

*End of TamalData PRD v1.0.0*
*Next step: Developer reviews Section 5 (DataMart API) against live docs at `datamartgh.shop/api-doc` and confirms endpoint shapes before Phase 1 sprint begins.*
