# frostwise.app

The waitlist page of Frostwise, a garden planner for Android: English at `/`, Russian at `/ru/`.
Visitors sign up for the closed beta through an embedded Google Form, one per language, whose
answers go to one Google Sheet (`FORMS.md`).
The privacy policy of the app and the site is at `/privacy/` and `/ru/privacy/`; the app's
Data safety answers in Play Console match it (`docs/play-console.md` in the app repository).

Plain HTML and CSS served by GitHub Pages with the custom domain in `CNAME`: no build step, no
scripts, nothing loaded from another host except the form. Colours and fonts follow the app's
Warm Garden tokens; the fonts are Lora and Nunito under the SIL Open Font License (`fonts/`).

```bash
npm test                     # structure and rules of both pages
npx --yes serve -l 4321 .    # look at it on http://localhost:4321
```

`reachability/256k.bin` is fetched by the app's `server/scripts/reachability.mjs frostwise.app`
to check the site opens from Russia and Belarus.

The app itself lives in the private repository `dvovna/garden-planner`.
