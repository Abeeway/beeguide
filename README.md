# BeeGuide

BeeGuide is a Docusaurus-based documentation portal for Abeeway tracker devices.

## Requirements

- Node.js 20 or newer
- npm

## Installation

Install dependencies with:

```bash
npm install
```

## Local Development

Start the local development server with:

```bash
npm run start
```

The site will be available at [http://localhost:3000](http://localhost:3000). Most changes are reloaded automatically.

## Build

Create a production build with:

```bash
npm run build
```

The generated site is written to the `build` directory.

To preview the production build locally:

```bash
npm run serve
```

## Publish to GitHub Pages

This repository includes a GitHub Actions workflow for publishing the site to GitHub Pages:

- `.github/workflows/deploy.yml`

The workflow runs automatically on every push to the `main` branch.

To enable publishing:

1. Push the repository to GitHub.
2. Open the repository settings on GitHub.
3. Go to `Settings` -> `Pages`.
4. Under `Build and deployment`, set the source to `GitHub Actions`.
5. Push changes to `main`.

After the workflow completes successfully, the site will be published to:

- [https://abeeway.github.io/beeguide/](https://abeeway.github.io/beeguide/)

