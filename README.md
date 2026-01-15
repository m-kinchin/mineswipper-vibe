# Minesweeper

A classic Minesweeper game built with TypeScript and Vite.

## Features

- Configurable grid size (rows and columns)
- Adjustable mine count
- Left-click to reveal cells
- Right-click to place/remove flags
- Chord click (click on revealed numbers with correct flags to auto-reveal adjacent cells)
- Timer and mine counter
- Safe first click (mines are placed after first click)

## Local Development

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

The production files will be generated in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

---

## Deploy to Cloudflare Pages

### Option 1: Deploy via Cloudflare Dashboard (Git Integration)

1. **Push your code to GitHub/GitLab**
   - Make sure your repository is pushed to GitHub or GitLab

2. **Log in to Cloudflare Dashboard**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Workers & Pages** in the left sidebar

3. **Create a new Pages project**
   - Click **Create application**
   - Select **Pages**
   - Click **Connect to Git**

4. **Connect your repository**
   - Authorize Cloudflare to access your GitHub/GitLab account
   - Select the `mine-swipper-vibe` repository

5. **Configure build settings**
   - **Project name**: `minesweeper` (or your preferred name)
   - **Production branch**: `main` (or your default branch)
   - **Framework preset**: Select `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

6. **Deploy**
   - Click **Save and Deploy**
   - Wait for the build to complete
   - Your app will be available at `https://<project-name>.pages.dev`

### Option 2: Deploy via Wrangler CLI (Direct Upload)

1. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare**
   ```bash
   wrangler login
   ```
   This will open a browser window for authentication.

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Deploy to Cloudflare Pages**
   ```bash
   wrangler pages deploy dist --project-name=minesweeper
   ```
   - If this is your first deployment, it will create a new project
   - Follow the prompts to complete the deployment

5. **Access your app**
   - Your app will be available at `https://minesweeper.pages.dev`
   - You can also set up a custom domain in the Cloudflare Dashboard

### Option 3: Deploy via Wrangler in package.json

1. **Add Wrangler as a dev dependency**
   ```bash
   npm install -D wrangler
   ```

2. **Add deploy script to package.json**
   ```json
   {
     "scripts": {
       "deploy": "npm run build && wrangler pages deploy dist --project-name=minesweeper"
     }
   }
   ```

3. **Run deployment**
   ```bash
   npm run deploy
   ```

---

## Environment Variables (Optional)

If you need to configure environment variables for your Cloudflare Pages deployment:

1. Go to your project in Cloudflare Dashboard
2. Navigate to **Settings** > **Environment variables**
3. Add your variables for Production and/or Preview environments

---

## Custom Domain Setup

1. Go to your Pages project in Cloudflare Dashboard
2. Navigate to **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain name and follow the DNS configuration instructions

---

## Troubleshooting

### Build fails on Cloudflare
- Ensure Node.js version is compatible. You can set it in Cloudflare Dashboard under **Settings** > **Environment variables** by adding `NODE_VERSION` = `18`

### Page not loading correctly
- Make sure the build output directory is set to `dist`
- Verify the build command is `npm run build`

### 404 errors on page refresh
- For single-page apps, create a `_redirects` file in the `public` folder:
  ```
  /* /index.html 200
  ```
