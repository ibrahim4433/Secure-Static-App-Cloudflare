# ⚡ Secure-Static-App-Cloudflare

> **A Serverless, Multi-Purpose Digital Asset Distribution Portal & Edge Streaming Gateway**

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Zero Cost](https://img.shields.io/badge/Hosting-100%25_Free-00E5FF?style=for-the-badge&logo=githubpages&logoColor=black)](https://pages.github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**Secure-Static-App-Cloudflare** is an open-source, production-ready framework designed for developers, teams, and creators who need a fast, secure, and beautiful portal to distribute digital assets, software builds, or media collections—with **zero infrastructure costs**.

It pairs a modern **Glassmorphic Progressive Web App (PWA)** frontend with a **Cloudflare Worker Edge Gateway** that securely proxies and streams files from arbitrary storage backends without exposing upstream credentials or API keys.

---

## 🎯 Universal Use Cases

This template is modular and unopinionated. You can adapt it for:

1. **Software & Release Distribution:** Distribute software packages, APKs, desktop executables, CLI tools, or firmware builds.
2. **Digital Asset Library:** Host design templates, audio clips, datasets, eBooks, or PDF documentation.
3. **Internal Tools & Catalog Portal:** Deploy a private or public directory of resources with search, tags, and category filtering.
4. **Zero-Cost Storage Gateway:** Use backends like Telegram channels, Cloudflare R2, AWS S3, or GitHub Releases as your storage engine while serving users through a clean, custom-branded web UI.

---

## 🏗️ Architecture & Core Components

```
┌──────────────────────────┐
│  Client / Browser (PWA)  │  <── Fast, cached UI (GitHub Pages / Vercel / Netlify)
└────────────┬─────────────┘
             │ 1. Request Download / Asset
             ▼
┌──────────────────────────┐
│ Cloudflare Edge Gateway  │  <── Hides upstream tokens, handles CORS,
└────────────┬─────────────┘      rate-limits, and applies 24h edge caching
             │ 2. Fetch & Stream
             ▼
┌──────────────────────────┐
│ Upstream Storage Source  │  <── S3 / Cloudflare R2 / GitHub Releases / Telegram
└──────────────────────────┘
```

1. **Frontend (`index.html`, `js/app.js`, `css/style.css`):**
   - High-performance Vanilla CSS with dark/light mode and glassmorphism.
   - PWA support with offline caching via Service Worker (`sw.js`).
   - Instant live search, multi-category filtering, and sorting (by name, size, date).
   - Full bilingual support (English & Arabic with automatic RTL/LTR layout switching).

2. **The Cloudflare Worker Gateway (`worker/index.js`):**
   - Universal streaming bridge that generates dynamic downloads and media streams on the fly.
   - Shields your private API keys and storage credentials from the public client.
   - Handles HTTP chunked streaming and edge caching for high bandwidth savings.

3. **Data Ingestion (`apps.json` / `scripts/`):**
   - Simple JSON schema defining titles, descriptions, categories, versions, icons, and download targets.
   - Includes optional automated ingestion scripts (`scripts/update.py`) with GitHub Actions CI/CD.

---

## 🚀 Quick Start Guide

### Option A: Static Catalog (Simplest Setup — No Backend Required)

If you already host your files on GitHub Releases, S3, or direct URLs:

1. Clone or fork this repository:
   ```bash
   git clone https://github.com/ibrahim4433/Secure-Static-App-Cloudflare.git
   ```
2. Edit `apps.json` with your own items and direct URLs:
   ```json
   [
     {
       "id": 1,
       "title": "My Software Tool",
       "version": "v1.2.0",
       "category": "Tools",
       "description": "A cross-platform productivity utility.",
       "download_url": "https://github.com/user/repo/releases/download/v1.2.0/app.zip",
       "icon": "assets/icons/my-app.png"
     }
   ]
   ```
3. Enable **GitHub Pages** in your repository settings (Settings -> Pages -> Deploy from branch: `main`). Your portal is immediately live!

---

### Option B: Cloudflare Worker Gateway (Secure Streaming & Token Protection)

If you need to shield your storage backend or use token-protected file streaming:

1. **Deploy the Worker:**
   - Log into the [Cloudflare Dashboard](https://dash.cloudflare.com) and navigate to **Workers & Pages**.
   - Create a new Worker and paste the contents of [`worker/index.js`](worker/index.js).
   - *(Optional)* Add any private environment variables (e.g., `TELEGRAM_BOT_TOKEN`, `UPSTREAM_AUTH_BEARER`) in Worker **Settings -> Variables**.
   - Deploy the Worker and copy its public endpoint URL (`https://your-worker.workers.dev`).

2. **Connect Frontend to Worker:**
   - Open `js/app.js` and set your gateway URL:
     ```javascript
     const WORKER_URL = "https://your-worker.workers.dev";
     ```

---

### Option C: Telegram Channel Storage Backend (Zero-Cost Unlimited Storage)

If you wish to leverage Telegram as an unlimited zero-cost file host:

1. Create a Telegram Bot via [@BotFather](https://t.me/botfather) and add it as an admin to your channel.
2. In your Cloudflare Worker, set the `TELEGRAM_BOT_TOKEN` secret.
3. Configure the GitHub Actions workflow in `.github/workflows/update.yml` with your repository secrets to enable automated cron synchronization every 6 hours.

---

## ⚙️ Configuration & Customization

| File | Purpose |
| :--- | :--- |
| `apps.json` | The core database catalog holding all applications, tools, and download links. |
| `banners.json` | Featured banner highlights showcased at the top carousel. |
| `manifest.json` | Progressive Web App (PWA) configuration (app name, theme colors, icons). |
| `css/style.css` | Design variables, glassmorphic blur effects, and responsive breakpoints. |
| `worker/index.js` | Cloudflare Worker edge streaming proxy logic. |

---

## 🛡️ Security & Privacy Principles

- **No Credential Exposure:** All backend authorization tokens remain exclusively inside Cloudflare Worker encrypted secrets.
- **Content-Disposition Sandboxing:** Files streamed through the gateway are forced to download with explicitly validated MIME types and filenames.
- **Zero Tracker Footprint:** Pure open-source code with no third-party tracking scripts, cookies, or telemetry.

---

## 🤝 Contributing & License

Contributions, feature suggestions, and pull requests are warmly welcomed! 

Distributed under the **MIT License**. See `LICENSE` for more information.
