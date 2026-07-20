# Campusiyo — Pre-Launch Marketing Website

> Find Organized Notes for Your University.

**Campusiyo** is a premium, minimalist, and high-performance pre-launch marketing website built to explain the startup's value proposition, drive waitlist registrations, collect pre-launch student feedback, and establish solid SEO indexing before the main note-sharing platform launches.

This repository contains only the front-facing marketing website. The actual note repository dashboard, search engine database, and AI summary services are kept separate.

---

## ✨ Features Implemented

* 📱 **Fully Responsive Layout**: Built with a mobile-first philosophy, adapting fluidly across phone, tablet, and desktop screens.
* 🎨 **Curated Design Tokens**: Utilizes a highly structured, premium theme matching the company palette (Deep Blue `#1E3A8A`, Accent Emerald Green `#059669`, and Off-White `#FAFAFA`).
* ✉️ **Interactive Waitlist Portal**: Built with regex email verification, duplicate submission filters, and browser-side `localStorage` caching to remember subscribers.
* ⚡ ** Collapsible FAQ Accordion**: Smooth animations driven by `framer-motion` to keep layout transitions minimal and polished.
* 🔍 **Search Engine Optimizations**: Full meta parameters, Open Graph tags, Twitter cards, dynamic `sitemap.xml`, and crawler instructions (`robots.txt`).
* ⚡ **100% Static Prerendering**: Compiles directly into clean static HTML with Next.js App Router for instant load speeds.

---

## 🛠️ Technology Stack

* **Framework**: React & Next.js 16 (App Router)
* **Styling**: Tailwind CSS v4 & Vanilla CSS
* **Animations**: Framer Motion
* **Icons**: Lucide Icons
* **Language**: TypeScript

---

## 📂 Directory Layout

```text
src/
├── app/
│   ├── layout.tsx         # Global fonts, provider configurations, and SEO metadata
│   ├── page.tsx           # Home marketing section
│   ├── about/
│   │   └── page.tsx       # Team vision and product mission page
│   ├── features/
│   │   └── page.tsx       # Core launch features & upcoming roadmap
│   ├── contact/
│   │   └── page.tsx       # Student contact & partners form
│   ├── privacy/
│   │   └── page.tsx       # Legal privacy agreements
│   ├── terms/
│   │   └── page.tsx       # Service terms and conditions
│   ├── coming-soon/
│   │   └── page.tsx       # Unfinished feature teasers
│   ├── not-found.tsx      # Custom page not found redirect
│   ├── sitemap.ts         # Dynamic sitemap indexer
│   └── robots.ts          # Search engine crawler commands
├── components/
│   ├── ui/
│   │   ├── Button.tsx     # Custom styled button elements
│   │   ├── Input.tsx      # Controlled input components
│   │   └── Accordion.tsx  # Smooth animated accordion containers
│   ├── Navbar.tsx         # Sticky navigation with mobile menu drawer
│   ├── Footer.tsx         # Site details and newsletter signups
│   ├── FeatureCard.tsx    # Responsive grid card panels
│   ├── WaitlistForm.tsx   # Verification and state handlers for emails
│   └── Hero.tsx           # Hero pitch and waitlist section
```

---

## 🚀 Setup & Execution Commands

Follow these commands to install, run, and compile the website locally.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

### 3. Compile Production Bundle
Check for TypeScript compilation or layout issues by compiling the production bundle:
```bash
npm run build
```

### 4. Run Production Preview
Preview the optimized static pages locally:
```bash
npm run start
```

---

## 🌍 Free Deployment Guide

We recommend deploying this project on **Vercel** or **Netlify** since it is built with Next.js. Both platforms offer generous free tiers that include SSL certificates, fast CDN delivery, and automatic deployments upon Git commits.

### Option A: Vercel (Recommended for Next.js)

1. Create a free account at [Vercel](https://vercel.com).
2. Install the Vercel CLI tool locally (optional) or connect your GitHub repository directly.
3. If connecting via GitHub:
   * Select **New Project** in your Vercel Dashboard.
   * Import this repository.
   * Vercel will automatically detect the Next.js framework. Leave the default build settings unchanged.
   * Click **Deploy**. Your site will be live on a `*.vercel.app` subdomain in under a minute.

### Option B: Netlify

1. Sign up on [Netlify](https://www.netlify.com).
2. Connect your GitHub repository.
3. Keep the default settings:
   * **Build Command**: `npm run build`
   * **Publish Directory**: `.next` (or let Netlify auto-detect)
4. Click **Deploy Site**.

---

## 🔗 Linking Your Custom Domain

Once your site is hosted on Vercel or Netlify, you can link your custom domain name (e.g., `campusiyo.com` or `waitlist.campusiyo.com`).

### 1. Configure Domain in hosting dashboard (Vercel example):
* Go to your project page in Vercel.
* Click **Settings** > **Domains**.
* Enter your domain name (e.g., `campusiyo.com` or `www.campusiyo.com`) and click **Add**.
* Vercel will analyze your domain and display the required DNS records (A record, CNAME record, or TXT record).

### 2. Update DNS records at your registrar:
Log in to the domain registrar where you purchased your domain (GoDaddy, Namecheap, Cloudflare, Google Domains, etc.), open your domain's DNS manager, and add:

| Type | Name | Value / IP | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` (Vercel IP) | Auto / Default |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Auto / Default |

*(For Netlify, DNS records will point to Netlify's DNS values or `apex-loadbalancer.netlify.com` respectively).*

### 3. Verification & SSL:
* DNS changes can take anywhere from a few minutes to 24 hours to propagate globally.
* Once DNS resolves, Vercel/Netlify will automatically generate a free, renewing **Let's Encrypt SSL certificate** (HTTPS) for your domain.
