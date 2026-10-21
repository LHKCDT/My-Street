# My Street

A browser app for building and exploring a shop street. Shop photos are processed in the browser. Uploaded custom shops live in page memory and are cleared when the page is refreshed. The 3D view uses Three.js from jsDelivr; loading that library requires an internet connection. No Base44 service, account, database, or permanent photo storage is used.

## Run

Run a local web server from this project folder (ES modules do not work reliably when opened as a `file://` page):

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/`. The included shop images are the PNG files in this folder. No application install, account, database, Base44 service, or API key is needed.

## Try it

1. Drag a shop card into any of the 20 slots, or click a card and then an empty slot. The x on a placed shop removes it. Reset All clears the street.
2. Turn on **Select multiple shops** to choose several available cards. Choose selected or random order, then use **Place selected** to fill the next empty slots. The Add Your Shop card remains the last card in the two-column library.
3. Choose **Add Your Shop**, enter a name, and click **Click to choose an image**. The full image appears with a square crop selection; drag the square to reposition it and use the slider to change its size. Add it to the library, then place it like any other shop. The form clears after adding or closing a shop. The image is cropped locally in a canvas and kept in memory only.
   Custom cards have a separate × button to delete the shop. Deletion asks for confirmation and removes its placements too.
4. Place shops and choose **Play**. The perspective street has actual building and road geometry, spaced buildings, and a five-stripe crossing. Rotate with the view buttons; hold the walk buttons (or use W/A/S/D and up/down keys) to move. **Return to Edit** preserves the current street.
5. Choose **中文** or **English** to change the interface language.

## Replace the default shop images

The shop definitions and their image filenames are near the top of `app.js` in the `baseShops` list. Replace a PNG while keeping its filename, or change the corresponding `image` filename there. Keep replacement images in this project folder so the browser can load them locally.

## Deploy to Netlify

The project has no framework build or package installation. Netlify runs node build.mjs, which copies only the website files and shop images into dist/; reference screenshots and documents are excluded. netlify.toml sets the publish folder to dist.

For a manual Netlify Drop deploy, run node build.mjs in this project folder and upload the generated dist/ folder. For a Git-connected Netlify site, use build command node build.mjs and publish directory dist (these are already set in netlify.toml). No environment variables are required.

The page itself is static and uses no server, database, account, paid API, or Base44 service. Custom uploads are cropped in the browser and exist only in page memory, so a refresh clears them. The 3D mode imports Three.js 0.180.0 from jsDelivr and needs an internet connection.

Do not upload the project root as a manual deploy; use dist/ so reference documents are not published.
