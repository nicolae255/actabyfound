# Acta by Found

Websites, branding, and local SEO built specifically for lawyers and notaries in Belgium. Acta is a specialist branch of [Found](https://foundagency.be/).

## Structure

- `index.html`, `services/`, `contact/`, `privacy/`, `legal-notice/` — English (root)
- `fr/` — French mirror (`fr/services/`, `fr/contact/`, `fr/confidentialite/`, `fr/mentions-legales/`)
- `nl/` — Dutch mirror (`nl/diensten/`, `nl/contact/`, `nl/privacybeleid/`, `nl/wettelijke-vermeldingen/`)
- `blog/` — content targeting long-tail search terms (e.g. website/branding rules for legal professionals); English only for now
- `style.css`, `script.js` — design system adapted from Found's own site (same dark theme, Manrope/Inter, cursor/reveal/transition behavior)

## Before launch

- [ ] Register `actabyfound.be` and point DNS at GitHub Pages (CNAME file already committed)
- [ ] Replace `GTM-XXXXXXX` placeholder in every page's `<head>` with a real GTM container
- [ ] Replace `REPLACE_WITH_WEB3FORMS_ACCESS_KEY` in every contact/newsletter form with a real [Web3Forms](https://web3forms.com) access key
- [ ] Verify domain in Google Search Console, submit `sitemap.xml`
- [ ] Add a Google Business Profile for Acta itself
- [ ] Confirm the deontology/advertising-rules claims in `/blog/website-rules-for-belgian-lawyers-and-notaries/` against current Ordre des barreaux / Fednot guidance before relying on them as legal accuracy (written as general orientation, not legal advice)

## Deployment

Static site hosted via GitHub Pages. Every push to `main` deploys automatically.
