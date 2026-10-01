# Deployment security headers

`public/_headers` uses the format supported by Cloudflare
Pages. It applies the Content Security Policy and related response headers to every
path.

`index.html` also contains an equivalent CSP meta policy as a fallback. A meta
policy cannot enforce `frame-ancestors`, HSTS, or the other response-only headers,
so the deployment header remains the authoritative policy.

## Cloudflare Pages

Run `bun install` and `bun run build`, then publish the complete `dist/` directory.
Vite copies `public/_headers` into `dist/_headers`. Verify the deployed response with:

```powershell
curl.exe -I https://empty610.com/
```

## GitHub Pages behind Cloudflare

GitHub Pages does not interpret `_headers`. If GitHub Pages remains the origin,
create an equivalent Cloudflare **Response Header Transform Rule** for
`empty610.com/*`, copying the values from `_headers`. The CSP meta tag still
protects browsers if the edge rule is absent, but response-only protections such
as `frame-ancestors` and HSTS require the Cloudflare rule.

## Page assets and CSP

The homepage and `/delocalized%20configuration%20project/` load their scripts and
stylesheets from same-origin files. Inline scripts, inline event handlers, and
inline style elements are prohibited; no CSP hashes need updating for normal
script or stylesheet changes. Inline style attributes remain enabled for the
terminal's positioning and animation. Keep the meta policies on both pages and
the response policy in `_headers` in sync.
