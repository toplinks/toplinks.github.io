> Studio now starts with a GitHub token sign-in screen at `studio.html`. A successful repository write-access check opens the editor. The token is kept in tab session storage so refresh restores the connection. Sign out clears it. Browser session restoration may also restore the token. Existing local drafts remain on this device; download/import tools are available after connecting. The catalog and application source remain public.

# Top Links — GitHub-only Design 2

A static directory with a GitHub-backed content editor. No database or application server. Design 1 remains separately preserved.

## Content

- catalog.json is the source of truth for websites, categories, and Useful Sites.
- catalog-loader.js reads the catalog from the same host and falls back to the generated catalog-snapshot.js for direct-file/offline viewing.
- studio.html manages websites, categories, and shortcuts as a local draft. Download JSON, import JSON, or commit to the configured repository with a temporary GitHub token saved in tab session storage until sign out.
- submit.html prepares a GitHub issue for the visitor to review and submit. The admin Suggestions tab imports structured issues into the draft for approval.
- GitHub Actions tests, builds, and deploys the website whenever the main/master branch changes.
- Favorites, sorting, and shortcut click counts stay in the browser. There are no visitor accounts, cross-device favorite sync, or external analytics counters.
- Fonts, icons, themes, search providers, the donation panel, and all existing directory features are retained. External services are opened only when visitors choose those destinations.
- The original /old/ archive remains historical content.

## Run checks and build

Requires Node.js 22 or newer; no npm packages are needed.

    node --test tests/*.test.cjs
    node scripts/build.cjs

Serve dist/ with a static server, or open its index.html to use the bundled offline catalog snapshot.

## Publish and configure administration

Read [GITHUB-SETUP.md](GITHUB-SETUP.md). Upload this source to the GitHub repository including .github/workflows/pages.yml, enable Issues, and choose GitHub Actions as the Pages source. No token is needed for ordinary visitors. Studio requires a GitHub connection before editing.

The optional admin API integration requires a GitHub-authorized maintainer and repository-scoped Contents read/write permission. Credentials are never committed or saved in browser storage. Repository writes were not performed while preparing this package.

See [DIRECTORY-SOURCES.md](DIRECTORY-SOURCES.md) for directory attribution and icons/ and fonts/ for asset licenses.
