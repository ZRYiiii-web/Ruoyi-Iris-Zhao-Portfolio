# Ruoyi (Iris) Zhao — Portfolio

Selected interaction design work by Ruoyi (Iris) Zhao — human-centered AI, meaningful feedback and tangible experiences.

Live site: https://zryiiii-web.github.io/Ruoyi-Iris-Zhao-Portfolio/

## Structure

```
index.html                     Home
projects/bodybuddy/            Project page
projects/beyond-the-loop/      Project page
projects/dribbleiq/            Project page
projects/dietary-traces/       Project page
assets/                        Images + portfolio PDF
_next/static/                  JS / CSS build output
.nojekyll                      Required — keeps the _next folder on GitHub Pages
```

## How this is published

Static export, no build step: every route is a plain `index.html` plus its assets, served by
GitHub Pages from the `main` branch at the repository root. Edit a file, push, live in ~1 minute.

## Renaming the repository

All URLs are prefixed with `/Ruoyi-Iris-Zhao-Portfolio/` so the site works as a Pages project page. If the
repository is renamed, every asset path breaks and the page loads unstyled. Regenerate with:

```
node build-deploy.js /<new-repo-name>
```
