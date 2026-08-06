# Campusiyo

<div align="center">

**The premier platform for university-specific, semester-organized study notes — built by students, for students.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

🌐 **Live:** [https://campusiyo.in](https://campusiyo.in)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Mission & Vision](#mission--vision)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Development](#development)
- [Production Build](#production-build)
- [Deployment](#deployment)
- [Coding Standards](#coding-standards)
- [Performance Guidelines](#performance-guidelines)
- [Accessibility Guidelines](#accessibility-guidelines)
- [SEO Guidelines](#seo-guidelines)
- [Security](#security)
- [Contributing](#contributing)
- [Versioning](#versioning)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

**Campusiyo** is a web platform that gives college students in India access to high-quality, peer-reviewed, semester-organized study materials. Notes are categorized by university degree program (B.Tech, B.Com, B.Sc, BBA, B.A.) and semester, making it easy to find exactly what you need for your exams.

The platform provides:
- 📚 PDF study notes with secure in-browser streaming
- 🎓 Semester and subject-organized course directory
- 🔍 Full-text search across notes and subjects
- 🔒 Secure PDF viewer with watermarking and screenshot prevention
- 👤 JWT-based authentication with Google Sign-In support

---

## Mission & Vision

### Mission
To organize and democratize access to high-quality academic study materials for every college student in India, regardless of their university or background.

### Vision
To become the trusted academic companion for every Indian college student — a single platform where they can find, review, and share peer-reviewed notes across all degrees, semesters, and subjects.

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org) | 16 (App Router) | Full-stack React framework, routing, SSR/SSG, API rewrites |
| [React](https://react.dev) | 19 | UI component library |
| [TypeScript](https://typescriptlang.org) | 5 | Static typing, type safety |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first CSS framework |
| [Framer Motion](https://framer.motion) | 12 | Animations and transitions |
| [Lucide React](https://lucide.dev) | latest | Icon library |
| [PDF.js](https://mozilla.github.io/pdf.js/) | 3.11 | PDF rendering engine (loaded from CDN) |

### Backend (separate repository)

| Technology | Purpose |
|------------|---------|
| Spring Boot (Java) | REST API, authentication, file serving |
| PostgreSQL | Database |
| AWS S3 | PDF file storage |
| JWT | Authentication tokens |

---

## Folder Structure

```
campusiyo/
├── .env.example              # Environment variable template
├── .env.local                # Local environment variables (gitignored)
├── next.config.ts            # Next.js configuration (rewrites, headers, images)
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── public/                   # Static assets served as-is
│   ├── campusiyo-light-logo.png
│   ├── campusiyo-dark-logo.png
│   ├── favicon.ico           # Browser tab icon
│   ├── favicon-16x16.ico
│   ├── favicon-32x32.ico
│   ├── favicon-48x48.ico
│   └── images/               # Page images (du-gate.jpg, etc.)
└── src/
    ├── app/                  # Next.js App Router (pages, layouts, metadata)
    │   ├── layout.tsx        # Root layout: fonts, metadata, auth provider, JSON-LD
    │   ├── page.tsx          # Home page (landing page)
    │   ├── globals.css       # Global CSS variables and Tailwind base
    │   ├── sitemap.ts        # Auto-generated sitemap.xml
    │   ├── robots.ts         # Auto-generated robots.txt
    │   ├── manifest.ts       # PWA web app manifest
    │   ├── not-found.tsx     # 404 error page
    │   ├── about/            # /about page
    │   ├── contact/          # /contact page (client component + layout.tsx for metadata)
    │   ├── courses/          # /courses directory browser
    │   ├── dashboard/        # /dashboard (authenticated users)
    │   ├── features/         # /features roadmap page
    │   ├── login/            # /login authentication page
    │   ├── notes/            # /notes and /notes/[id] PDF viewer
    │   ├── privacy/          # /privacy policy
    │   ├── profile/          # /profile user settings
    │   ├── register/         # /register signup page
    │   ├── subjects/         # /subjects browser
    │   ├── terms/            # /terms of service
    │   ├── coming-soon/      # Placeholder pages
    │   └── admin/            # /admin panel (role-gated, noindex)
    ├── components/           # Reusable UI components
    │   ├── Navbar.tsx        # Site navigation (sticky, dark mode, mobile drawer)
    │   ├── Footer.tsx        # Site footer (links, social, contact)
    │   ├── LayoutWrapper.tsx # Detects PDF reader mode to hide navbar/footer
    │   ├── FeatureCard.tsx   # Feature card component for /features page
    │   ├── WaitlistForm.tsx  # Waitlist signup form
    │   ├── CustomPdfReader.tsx # Legacy PDF reader (kept for fallback)
    │   ├── ui/
    │   │   └── Button.tsx    # Reusable Button component (variant system)
    │   └── pdf/              # Production PDF viewer engine
    │       ├── PdfViewer.tsx        # Main viewer: virtualization, canvas rendering
    │       ├── ReaderLayout.tsx     # Full-screen reader chrome (toolbar, scroll)
    │       ├── ReaderToolbar.tsx    # Floating toolbar (zoom, rotate, download)
    │       ├── ReadingProgress.tsx  # Reading progress bar
    │       ├── DownloadButton.tsx   # Watermarked PDF download
    │       └── engine/             # PDF rendering pipeline
    │           ├── types.ts         # Shared TypeScript types
    │           ├── DocumentLoader.ts  # PDF.js loading + retry logic
    │           ├── MetadataManager.ts # Page dimensions cache
    │           ├── CacheManager.ts    # LRU canvas cache
    │           ├── RenderWorker.ts    # Canvas render + responsive scaling
    │           ├── RenderScheduler.ts # Priority render queue
    │           ├── ViewportManager.ts # IntersectionObserver virtualization
    │           └── TelemetryManager.ts # Performance metrics
    ├── context/
    │   ├── AuthContext.tsx   # Global auth state (user, token, login/logout)
    │   └── LayoutContext.tsx # Controls navbar/footer visibility in PDF reader
    └── utils/
        └── api.ts            # Fetch wrapper with JWT injection
```

### Why this structure?

| Folder | Rationale |
|--------|-----------|
| `src/app/` | Next.js App Router convention. Each subfolder is a route. `layout.tsx` files provide metadata without affecting UI. |
| `src/components/pdf/` | Isolated PDF engine. The viewer is a complex subsystem with its own pipeline — kept separate from general UI components. |
| `src/components/ui/` | Design system primitives (Button, etc.). All pages use these instead of raw HTML elements. |
| `src/context/` | React Context for cross-cutting concerns (auth, layout mode). Avoids prop drilling. |
| `src/utils/` | Pure utility functions with no side effects. `api.ts` centralizes all backend communication. |
| `public/` | Assets that must be served at a fixed URL (favicon, logos, OG images). |

---

## Architecture

### Routing
Next.js App Router with file-based routing. Each folder in `src/app/` maps to a URL. Dynamic routes use `[id]` folders (e.g., `/notes/[id]`).

### Authentication
JWT-based auth managed by `AuthContext`. Tokens are stored in `localStorage` under `campusiyo_access_token`. The `api.ts` utility automatically injects the `Authorization: Bearer <token>` header on every request. Protected pages redirect to `/login` if no token is found.

### State Management
No external state library. State is managed with:
- `useState` / `useReducer` for local component state
- React Context (`AuthContext`, `LayoutContext`) for global cross-cutting state
- `useRef` for mutable values that don't trigger re-renders (scroll position, engine instances)

### API Layer
All backend communication goes through `src/utils/api.ts`. Next.js rewrites (`next.config.ts`) proxy `/api/*` to the Spring Boot backend, keeping the backend URL out of client-side code and avoiding CORS issues.

### PDF Rendering Engine
The PDF viewer in `src/components/pdf/` implements a production-grade rendering pipeline:

```
HTTP Range Request → PDF.js → DocumentLoader → MetadataManager
                                                ↓
                                         RenderScheduler (priority queue)
                                                ↓
                                      ViewportManager (IntersectionObserver)
                                                ↓
                                         RenderWorker (canvas)
                                                ↓
                                         CacheManager (LRU)
                                                ↓
                                    HTML Watermark Overlay → Screen
```

Key design decisions:
- Pages are **never pre-rasterized** — each page is rendered on-demand as a live `<canvas>` element
- **Viewport virtualization** via `IntersectionObserver` — only visible pages are rendered
- **Priority scheduling** — visible pages render first; preload zone renders next
- **Responsive scaling** — `fitScale = min(1.0, containerWidth / naturalPageWidth)` prevents overflow on all screen sizes
- **LRU cache** — off-screen canvases are evicted to free GPU memory
- **Retry logic** in `DocumentLoader` — handles TCP stream errors (Windows wsarecv) with exponential back-off

### Theme System
Dark/light mode is implemented with CSS classes on `<html>`. A blocking inline script in `layout.tsx` reads `localStorage.campusiyo_theme` before paint to avoid flash. Tailwind's `dark:` variant is used for all theme-dependent styles.

---

## Environment Variables

Create a `.env.local` file (see `.env.example` for template):

| Variable | Required | Description |
|----------|----------|-------------|
| `BACKEND_URL` | Yes (prod) | Spring Boot backend URL. Defaults to `http://localhost:8080` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL. Used in metadata. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Optional | Google OAuth Client ID for Sign-In |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Optional | Google Search Console verification token |

```bash
# .env.local (example)
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=https://campusiyo.in
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

> ⚠️ Never commit `.env.local` to version control. It is gitignored by default.

---

## Installation

### Prerequisites
- Node.js 20+ 
- npm 10+

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/campusiyo/frontend.git
cd frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 4. Start the backend (separate repo)
# See backend README for Spring Boot setup
```

---

## Development

```bash
npm run dev
```

The dev server starts at `http://localhost:3000` (or `http://0.0.0.0:3000` for LAN access).

> The dev script uses `cross-env NEXT_TURBOPACK=0` to disable Turbopack for stability. Remove this flag to enable Turbopack if desired.

### Useful Development Commands

```bash
# Type check without building
npx tsc --noEmit

# Lint
npm run lint

# Check for unused dependencies (optional)
npx depcheck
```

---

## Production Build

```bash
# Build the production bundle
npm run build

# Start the production server
npm start
```

The production server listens on `0.0.0.0:3000` (all network interfaces).

### Build Verification Checklist
- [ ] `npm run build` exits with code 0
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Test critical user flows in production build

---

## Deployment

### Server Requirements
- Ubuntu 20.04+ (or any Linux distro)
- Node.js 20+
- PM2 (process manager) — `npm install -g pm2`
- Nginx (reverse proxy)

### Deployment Steps

```bash
# 1. SSH into your server
ssh user@your-server.com

# 2. Pull latest changes
git pull origin main

# 3. Install dependencies
npm ci --omit=dev

# 4. Build
npm run build

# 5. Restart with PM2
pm2 restart campusiyo-frontend
# or on first deploy:
pm2 start npm --name "campusiyo-frontend" -- start
pm2 save
```

### Nginx Configuration (example)

```nginx
server {
    listen 80;
    server_name campusiyo.in www.campusiyo.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name campusiyo.in;

    ssl_certificate /etc/letsencrypt/live/campusiyo.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/campusiyo.in/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables in Production

Set environment variables on the server (not in `.env.local`):

```bash
# Using PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'campusiyo-frontend',
    script: 'node_modules/.bin/next',
    args: 'start -H 0.0.0.0',
    env: {
      NODE_ENV: 'production',
      BACKEND_URL: 'http://localhost:8080',
      NEXT_PUBLIC_SITE_URL: 'https://campusiyo.in',
    }
  }]
};
EOF

pm2 start ecosystem.config.js
```

---

## Coding Standards

### File Naming
| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `PdfViewer.tsx` |
| Utility functions | camelCase | `api.ts` |
| App routes | kebab-case folders | `coming-soon/` |
| Types/interfaces | PascalCase | `PageRenderState` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |

### Component Conventions
- One component per file
- Props interface defined before the component
- Default export for page components, named export for utilities
- Use `React.memo` for expensive list-rendered components
- Prefer `useCallback` for event handlers passed as props
- Use `useRef` for mutable values that should not trigger re-renders

### Import Order
```typescript
// 1. React
import React, { useState, useEffect } from 'react';
// 2. Next.js
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// 3. Third-party
import { motion } from 'framer-motion';
// 4. Internal absolute (@/)
import { useAuth } from '@/context/AuthContext';
// 5. Internal relative
import { RenderWorker } from './engine/RenderWorker';
// 6. Types
import type { Metadata } from 'next';
```

### Commit Convention (Conventional Commits)

```
<type>(<scope>): <description>

Types:
  feat     - New feature
  fix      - Bug fix
  docs     - Documentation only
  style    - Formatting, no logic change
  refactor - Code restructuring, no feature change
  perf     - Performance improvement
  test     - Tests
  chore    - Build process, dependencies
  ci       - CI configuration

Examples:
  feat(pdf): add exponential retry for stream errors
  fix(courses): reset semester to 1 on course switch
  perf(viewer): reduce LRU cache eviction threshold
  docs(readme): add deployment guide
```

---

## Performance Guidelines

### Core Web Vitals Targets
| Metric | Target | Description |
|--------|--------|-------------|
| LCP | < 2.5s | Largest Contentful Paint |
| CLS | < 0.1 | Cumulative Layout Shift |
| FID/INP | < 200ms | Interaction to Next Paint |
| TTFB | < 800ms | Time to First Byte |

### Practices
- Use `next/image` for all images with `width`, `height`, and `loading="lazy"` (or `priority` for above-fold)
- Dynamic imports (`next/dynamic`) for heavy components (PDF reader, admin panel)
- Prefer `display: swap` for fonts (already configured)
- Keep bundle size in check: run `npx @next/bundle-analyzer` periodically
- Minimize third-party scripts; no analytics loaded synchronously
- Use `React.memo` and `useCallback` to prevent unnecessary re-renders in PDF page lists

---

## Accessibility Guidelines

- Every interactive element must have an `aria-label` if it has no visible text
- Maintain heading hierarchy: one `<h1>` per page, then `<h2>`, `<h3>` in order
- All images must have descriptive `alt` text
- Color contrast ratio: minimum 4.5:1 for body text, 3:1 for large text
- Keyboard navigation: all interactive elements must be focusable and operable with keyboard
- Do not rely on color alone to convey information
- Test with screen reader (NVDA/VoiceOver) before major releases
- Use semantic HTML: `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>`, `<section>`

---

## SEO Guidelines

- Every public page must have a unique `<title>` and `<meta name="description">`
- Use `export const metadata` in server components; create `layout.tsx` for `'use client'` pages
- All metadata uses the root `template: '%s | Campusiyo'` pattern
- Canonical URLs set via `alternates.canonical` in metadata
- Private pages (login, dashboard, profile, admin) are marked `robots: { index: false }`
- JSON-LD structured data (Organization, WebSite, SearchAction) in root layout
- Sitemap auto-generated at `/sitemap.xml` via `src/app/sitemap.ts`
- Robots rules in `src/app/robots.ts`
- OG images at 1200×630px, Twitter cards set to `summary_large_image`

---

## Security

### Security Headers (configured in `next.config.ts`)
| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Disables camera, microphone, geolocation |
| `Strict-Transport-Security` | 2-year HSTS with preload |

### Additional Practices
- `X-Powered-By` header removed (`poweredByHeader: false`)
- Admin routes protected by server-side auth check in `admin/layout.tsx`
- PDF content protected with HTML watermark overlay + focus/blur blur screen
- JWT tokens stored in `localStorage` (not cookies) to prevent CSRF
- All external links use `rel="noopener noreferrer"`

---

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Make your changes following the [Coding Standards](#coding-standards)
4. Verify with `npx tsc --noEmit` and `npm run lint`
5. Commit using [Conventional Commits](#commit-convention-conventional-commits)
6. Open a Pull Request against `main`

### Pull Request Guidelines
- Keep PRs focused — one feature/fix per PR
- Include a description of what changed and why
- No PR without TypeScript passing (`npx tsc --noEmit`)
- Screenshot or screen recording for UI changes
- No `console.log` statements in production code

---

## Versioning

Campusiyo follows [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

MAJOR — Breaking change (redesign, API incompatibility)
MINOR — New feature (backwards compatible)
PATCH — Bug fix, performance improvement, documentation
```

Current version: see `package.json`

---

## Roadmap

| Feature | Status | Target |
|---------|--------|--------|
| Core study notes viewer | ✅ Live | — |
| Course directory | ✅ Live | — |
| Full-text search | ✅ Live | — |
| Google Sign-In | ✅ Live | — |
| Mobile app (React Native) | 🔄 Planned | Q3 2026 |
| AI-powered note summaries | 🔄 Planned | Q4 2026 |
| Practice quiz generator | 🔄 Planned | Q4 2026 |
| Collaborative note annotation | 🔄 Planned | Q1 2027 |
| University-verified notes | 🔄 Planned | Q2 2027 |
| Offline mode (PWA) | 🔄 Planned | Q2 2027 |
| Multi-language support | 🔄 Planned | Q3 2027 |

---

## License

MIT License — see [LICENSE](LICENSE) for details.

```
Copyright (c) 2026 Campusiyo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

Made with ❤️ for students worldwide.

**[campusiyo.in](https://campusiyo.in)** · [Instagram](https://www.instagram.com/campusiyo/) · [LinkedIn](https://www.linkedin.com/company/campusiyo/about/)

</div>
