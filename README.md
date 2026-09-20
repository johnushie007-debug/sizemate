# SizeMate

A size converter people can install on their phone. Enter a size you already know
and see it in US, UK, China and EU sizing, save the ones that fit, share them with
family and friends, and chat inside the app.

Built by **Urbanpack**.

---

## 1. What you have here

| File | What it is |
|---|---|
| `index.html` | The app's screens |
| `app.js` | How it behaves: converting, saving, sharing, chat |
| `sizes.js` | **All the size tables.** Edit this to correct or extend sizing |
| `styles.css` | Look and feel |
| `sw.js` | Lets the app open and work with no internet |
| `manifest.webmanifest` | Name, colours and icon, so a phone treats it as an app |
| `icon-192.png`, `icon-512.png`, `icon-maskable.png` | App icons |
| `sizemate-backend.gs` | The small Google Apps Script that powers sharing and chat |

Conversions and saved sizes work with **no server at all**, so the app is useful
the moment it's online. Sharing and chat need the backend in section 4.

## 2. Put it online (15 minutes)

The app is a set of files. Any web address will do.

**On your own site (simplest, since you already have one)**
1. In cPanel → File Manager, open `public_html` and create a folder `sizemate`.
2. Upload every file from this folder into it, keeping the names exactly.
3. Visit `https://urbanpack.com.ng/sizemate/`. It should load.

**Or free hosting:** create a repository on GitHub, upload the files, and turn on
GitHub Pages (Settings → Pages → Deploy from branch → main). You get an address
like `https://yourname.github.io/sizemate/`.

**It must be https.** Installing to the home screen and offline mode both need it.
Any normal host gives you https today; `http://` alone won't work.

## 3. Installing it on a phone

There is no store download at this stage; people install from the link.

- **Android (Chrome):** open the link → menu (⋮) → *Add to Home screen* → *Install*.
  Chrome often offers this by itself after a few seconds.
- **iPhone (Safari):** open the link → Share → *Add to Home Screen*.

It then has its own icon, opens without browser bars, and works with no data —
useful in a market with weak signal. Send the link by WhatsApp with one line:
"Open this and tap Add to Home screen."

## 4. Switching on sharing and chat

Without this step the app still converts and saves; the People tab simply explains
that sharing is off.

1. Create a Google Sheet called **SizeMate**.
2. Extensions → Apps Script. Delete the sample code, paste all of
   `sizemate-backend.gs`, and Save.
3. Project Settings (gear) → Time zone → **(GMT+01:00) Lagos**.
4. Run the `setup` function once and approve the permissions.
5. Deploy → New deployment → **Web app**. Execute as: *Me*. Who has access:
   **Anyone**. Deploy, and copy the Web app URL (it ends in `/exec`).
6. Open `app.js`, find `PASTE_YOUR_WEB_APP_URL_HERE` near the top, and paste the
   URL between the quotes. Re-upload `app.js`.
7. In `sw.js`, change `sizemate-v1` to `sizemate-v2` and re-upload it, so phones
   that already installed the app pick up the new version.

**How people connect:** each user gets a six-character code (People tab). They
read it out or paste it to a friend, the friend types it into "Add someone by
code", and from then on the two can share sizes and chat.

**After editing the backend:** Deploy → Manage deployments → pencil → Version:
*New version* → Deploy. Otherwise the old code keeps running.

## 5. Correcting or extending the sizes

Everything the app knows lives in `sizes.js`. Each row is one size written in
every system at once:

```js
{ us: '8', uk: '12', eu: '40', cn: '165/92A', letter: 'L', bust: '94–97', waist: '76–79' },
```

To correct a conversion, change the row. To add a category (children's clothing,
bras, hats), copy a block, give it a new `id`, and list its rows. The app builds
its buttons, dropdowns and result tiles from that file, so nothing else changes.

**Please read this before promising accuracy.** These are the standard published
conversions. Real garments vary by brand, and Chinese sizing usually runs smaller
than Western sizing for the same label. That's why every row also carries body
measurements in centimetres, and why the app says so on screen. If you want
brand-level accuracy (Zara vs M&S vs Shein), that means brand-specific tables,
which is a much larger data job we can scope separately.

## 6. Turning it into a Play Store app (optional)

The installed app is enough for most people. If you want a real APK on Google Play:

1. Go to **pwabuilder.com**, paste your app's address, and click *Package for
   stores* → Android. It produces a signed Android package from these same files.
2. Create a Google Play developer account (a one-off fee of about $25) and upload
   the package there.
3. Play requires a privacy policy URL. Since the app holds names, sizes and chat
   messages, write one that says exactly what section 7 below says.

The same tool builds an iOS package, but Apple charges $99 a year and reviews
more strictly. Start with Android.

## 7. What the app stores, and what to tell users

- **On the phone:** name, country, saved sizes, and a copy of their messages.
  "Delete everything on this phone" in the Profile tab clears it all.
- **On your Google Sheet:** each user's display name, country, join code and a
  device token, plus the chat messages they send. No passwords, no addresses, no
  payment details.
- There is **no sign-in or account recovery**: the token stored on the phone is
  the key. Someone who clears their phone or changes device starts fresh with a
  new code. That keeps the app simple; tell us if you'd rather have proper
  accounts with recovery.
- Chat is **not end-to-end encrypted**, and whoever owns the Google Sheet can
  read the messages. Say so plainly in your privacy policy, and keep the Sheet
  private.
- `purgeOldMessages` in the backend deletes messages older than 60 days. Add a
  monthly trigger in Apps Script (Triggers → Add trigger) to run it automatically.

## 8. Worth adding next

- Children's sizes by age and height, which Nigerian shoppers ask for constantly
- Bra sizes (UK/US/EU band and cup conversions differ in an awkward way)
- "Measure me": enter body measurements in cm and get the size in each country
- A brand note on each saved size ("Zara runs one size small")
- Photo of the garment's own label saved beside the size
