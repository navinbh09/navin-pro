# bhattarainavin.com

Navin Bhattarai's personal site. Static [Astro](https://astro.build) site, hosted on Cloudflare Pages.

## Edit the words (no code needed)

All text lives in JSON files in `src/content/`. Open one, change the text between the quotes, save, commit, push. Cloudflare rebuilds the site in a minute or two.

| File | What it controls |
| --- | --- |
| `site.json` | Name, tagline, email, LinkedIn, CV/resume file paths, menu |
| `home.json` | Homepage: the changing "I ___" endings, medal photo text, origin strip, the paradox, "Choose your class" quests, selected work, teaching |
| `research-cold-plate.json` | The SURGE research story, one entry per poster section |
| `research-solar-cells.json` | The solar-cell research page |
| `projects.json` | Projects page (each project is one entry) |
| `temple.json` | The 3D-printed temple page |
| `about.json` | About page: tool stories, teaching, where I'm headed, education, experience, honors, fun facts |

Tips:
- Keep the quotes and commas. If the site fails to build after an edit, a missing comma or quote is the usual cause.
- A few fields allow simple HTML, like `<b>bold</b>` or `<a href="...">link</a>`.
- Write `\"` for a double quote inside text.

## Swap the CV or resume

Replace the file in `public/files/` and keep the same name:
- `Navin-Bhattarai-Resume.pdf`
- `Navin-Bhattarai-CV.pdf`
- `Navin-Bhattarai-SURGE-Poster-2026.pdf`

Every "Resume" and "Academic CV" button updates automatically.

## Add or change a photo

1. Put the image in `src/assets/img/` (JPG or PNG; around 1600 px wide is plenty).
2. Use its file name in the JSON, for example `"image": "my-photo.jpg"`, and write an `"alt"` description of what's in it.

Astro makes small, fast versions automatically. Photos from a phone can carry GPS location in their metadata. The build strips it from what the site serves, but the original file in the repo is public, so remove location data first (on a Mac: open the photo in Preview → Tools → Show Inspector → GPS tab → Remove Location Info).

## Run it on your computer

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:4321). `npm run build` makes the final site in `dist/`.

## Deploy

Cloudflare Pages watches the GitHub repo:
- Push to `main`: the live site updates.
- Push to any other branch: a preview link like `<branch>.<project>.pages.dev`.

Build settings: framework **Astro**, build command `npm run build`, output directory `dist`.

Old URLs (`/academic/...`, `/engineering/...`, old PDF links) redirect via `public/_redirects`.

## The AI assistant and its API key

_This section will be filled in when the "Ask about my research" assistant is added._ In short: the key lives only in Cloudflare as an encrypted environment variable, never in this repo.

To rotate the key:
1. Create a new key in the Anthropic Console.
2. Paste it into the Cloudflare Pages project → Settings → Variables and Secrets.
3. Redeploy.
4. Delete the old key in the Anthropic Console.

## Facts and privacy

Facts on this site must match the CV word for word. The rules are in `HANDOFF.md`, which is kept out of git on purpose: never commit it, because this repo is public.
