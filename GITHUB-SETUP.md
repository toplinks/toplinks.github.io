> Studio now starts with a GitHub token sign-in screen at `studio.html`. A successful repository write-access check opens the editor. Sign out or reload clears the in-memory token. Existing local drafts remain on this device; download/import tools are available after connecting. The catalog and application source remain public.

# GitHub-only setup

Top Links uses GitHub Pages for hosting, catalog.json for content, GitHub Issues for suggestions, and GitHub Actions to validate and publish updates. No database, external analytics, application backend, or third-party sign-in service is required.

## Publish this version

1. Keep your existing design ZIP as a separate backup.
2. Upload the contents of this folder to `toplinks/toplinks.github.io`, including the hidden `.github` folder. GitHub's web uploader may require adding the workflow separately. Do not upload `dist/`, access tokens, or private files.
3. In repository Settings → Pages, choose **GitHub Actions** as the build source. Allow Actions in the repository. The workflow supports the `main` and `master` branches; adjust its branch list if your default branch has another name.
4. In repository Settings → General, enable **Issues** for website suggestions. Optionally create a `website-submission` label; the editor also recognizes the suggestion title without the label.
5. Push the files or run **Validate and deploy Top Links** in the Actions tab. The workflow tests the catalog and editor logic, builds the static files, and deploys `dist/` to Pages.

## Edit without a token

Open `studio.html`, edit entries, then choose **Download JSON**. Replace catalog.json in GitHub through its web editor/uploader and commit. GitHub Actions publishes the changes. This is the simplest option if you do not want to use an API token.

## Commit from the admin page

1. Create a fine-grained personal access token on GitHub. Select **only this repository**, set an expiration, and grant **Contents: read and write**. GitHub includes the needed metadata access. You must already have write access to the repository. Organization policies may require token approval.
2. Open studio.html through the published HTTPS site or your trusted local preview. In **Connect to GitHub**, enter the token. It is held only in the tab's JavaScript memory, sent only to `api.github.com`, and cleared on disconnect or page exit. Never put it into a source file, JSON catalog, URL, issue, or commit.
3. Connecting loads the current repository catalog. The editor asks before replacing an existing local draft. You can download your draft first.
4. Add/edit/remove websites and categories, reassign websites when removing a used category, and edit/reorder Useful Sites. Changes are saved locally as a draft, not published immediately.
5. Choose **Review & commit**, inspect the change counts and target branch, then commit. GitHub enforces the token's repository permissions. If someone changed the catalog meanwhile, the editor refuses to overwrite it; download your draft, reconnect, and merge the latest changes.

The editor does not store the token in local storage, session storage, cookies, the catalog, or the repository. Local storage contains catalog drafts and ordinary site preferences only. The admin URL is public; its visibility is not an access-control mechanism. Only a GitHub-authorized user can commit.

## Review website suggestions

Visitors fill out submit.html and continue to GitHub, where they review and submit a public issue using their own GitHub account. Top Links does not submit issues automatically.

In studio.html, connect, open **Suggestions**, and load GitHub suggestions. Review a suggestion, correct its details, and save it to the draft. The optional close-issue checkbox adds a `Closes #number` reference to the catalog commit. GitHub closes the issue when the commit reaches the default branch. For rejecting or discussing suggestions, open the issue on GitHub.

## Content and local preview

- `catalog.json` is the source of truth. `catalog-snapshot.js` is generated from it and provides a direct-file/offline fallback. Do not edit the generated snapshot separately.
- The public site fetches catalog.json from its own host. Search, filters, categories, shortcuts, and favorites use the loaded catalog.
- Run `node --test tests/*.test.cjs` to validate catalog and API behavior.
- Run `node scripts/build.cjs` to generate `dist/`, including an updated snapshot, sitemap, and About counts. Serve `dist/` with a static server to preview a production build.
- Direct-file opening uses the bundled snapshot. Rebuild after catalog changes to refresh it.
- `repository-config.js` sets the owner, repository, and catalog path. It contains no secrets. Change it if you move to another repository.
- Fonts and icons are bundled locally. Third-party visitor trackers have been removed. Visiting external websites, using a search provider, opening PayPal/Facebook, and contacting the maintainer still opens those destinations at your request.
- The `/old/` archive is preserved as historical content; its original implementation has not been modernized.

## Limits

There are no independent Top Links accounts, cross-device favorite sync, or live global visitor counters. Browser favorites remain private to that browser. GitHub accounts are used only for repository editing and public issue submissions. Live content changes become public after Pages redeploys. No GitHub token is needed for ordinary visitors.
