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

## The AI assistant ("Ask anything about my research")

- **Front end:** `src/components/AskBox.astro`, the box in the homepage hero, labeled "AI assistant".
- **Back end:** `functions/api/ask.ts`, a Cloudflare Pages Function. It calls Claude Haiku 5.5 with the Anthropic SDK.
- **What it knows:** only the public text in `src/content/*.json`, assembled by `functions/_knowledge.ts`. Edit the site's content and the assistant learns it on the next deploy. Nothing private is in there, so nothing private can leak.
- **Rules:** the system prompt at the top of `ask.ts` keeps it on Navin's public work, enforces the accuracy rules, refuses role changes, and says "I don't know, email Navin" instead of guessing.
- **Limits:**
  - Answers are capped at 600 tokens, and questions at 500 characters.
  - It sends only the last 6 messages of a conversation.
  - Each visitor gets about 6 questions a minute and 60 a day.
  - Only bhattarainavin.com and its previews can call it.
  - The monthly dollar cap is set in the Anthropic Console (see below).
- **Privacy:** questions go to Anthropic to be answered. This site stores nothing and logs no question text.

### Set up or rotate the API key

1. In the Anthropic Console (console.anthropic.com) → **API keys** → **Create key**, and name it something like `bhattarainavin-site`.
2. In the Anthropic Console → **Settings → Limits**, set the **monthly spend limit** to $5.
3. In Cloudflare → Workers & Pages → `bhattarainavin` → **Settings → Variables and Secrets** → **Add**:
   - Type: **Secret**
   - Name: `ANTHROPIC_API_KEY`
   - Value: the key
   - Do this for **Production** (and Preview, if you want previews to answer too).
4. Redeploy: **Deployments** → latest → **Retry deployment**.
5. **To rotate:** create a new key, replace the secret's value, redeploy, then delete the old key in the Console.

Never paste the key into code, chat, or this repo.

### Optional extra protection

In Cloudflare → your domain → **Security → WAF → Rate limiting rules**, add a rule:
- If URI Path equals `/api/ask`
- then allow 10 requests per 10 seconds per IP
- and block for 10 seconds.

## Facts and privacy

Facts on this site must match the CV word for word. The rules are in `HANDOFF.md`, which is kept out of git on purpose: never commit it, because this repo is public.
