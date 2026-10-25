# Customerly — Customer Manager

A friendly React + Vite customer directory. Add, edit, delete, and search customers, or filter by Active, Lead, and Inactive status.

## Launch the app

1. Install Node.js 22.12 or newer (Node.js 24 is recommended).
2. Open a terminal in this project folder.
3. Run `npm install` the first time.
4. Run `npm run dev`.
5. Open the address printed by Vite in your browser. Keep the terminal running while you use the app. Press Ctrl+C to stop it.

In the prepared cloud environment dependencies are already installed. Start from step 4. Cloud startup can use `npm run dev -- --host 0.0.0.0`.

## Using your directory

Click **Add customer**, enter a name and any optional contact details, choose a status, and save. Use **Edit** to change a customer. **Delete** asks for confirmation. Search matches customer details; the status menu narrows your results.

Data is saved automatically in this browser's local storage and survives refreshes. There is no account, server, or cloud backup. Other browsers/devices have separate directories; clearing browser storage removes the data. Avoid storing sensitive information on shared devices. The app reports when browser storage cannot save a change.

## Checks and production build

- `npm test` — customer workflow and storage tests.
- `npm run lint` — code checks.
- `npm run build` — production files in `dist/`.
- `npm run preview` — serve the production build locally after building.

The app starts empty so every customer is one you added.

## Publish with GitHub Pages

This repository includes `.github/workflows/deploy.yml`. After the code is on the `main` branch:

1. In GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Open **Actions → Publish Customerly to GitHub Pages → Run workflow**, select `main`, and run it.
4. When deployment succeeds, find the website address in **Settings → Pages**.

Future pushes to `main` run tests, build, and publish automatically. GitHub Pages availability depends on repository visibility and your GitHub plan. The site is publicly accessible; customer data stays in each visitor's browser and is not shared across devices.
