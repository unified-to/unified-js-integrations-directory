<h1>
    <a href="https://unified.to"><img src="https://unified.to/images/unified.svg" /></a>
</h1>

# Unified.to's Integrations Directory JavaScript Component

Embeds Unified.to's integrations directory in any web page. Each integration links to its authorization flow (or to your own URL with `link_url`).

The script-tag build of this package is what `https://api.unified.to/docs/unified.js` serves.

## Script tag

No build step is needed:

```html
<script src="https://api.unified.to/docs/unified.js?wid=WORKSPACE_ID&did=unified_widget"></script>

<div id="unified_widget"></div>
```

The script renders the directory into the element with ID `did` when the page loads. Its query parameters:

| Parameter      | Description                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| `wid`          | **Required.** Your workspace ID, found at https://app.unified.to/settings/api                               |
| `did`          | **Required.** The ID of the element to render the directory into                                            |
| `env`          | Environment (e.g. `Sandbox`). Defaults to `Production`                                                      |
| `cat`          | Comma-separated integration categories to show (e.g. `crm,ats`)                                             |
| `uid`          | Your ID for the account/user that is signed into your application (`external_xref`)                         |
| `state`        | A state string that will be sent back to your success URL                                                   |
| `scopes`       | Comma-separated Unified.to permission scopes to request from OAuth2-based integrations                      |
| `surl`         | Success redirect URL. The connection ID (`id=`) and `state` are appended. Defaults to the current page       |
| `furl`         | Failure redirect URL. An `error` variable is appended. Defaults to the current page                         |
| `lang`         | Language for the authorization pages                                                                        |
| `dc`           | Data center/region: `us` (default), `eu`, `au`                                                              |
| `link_url`     | Link each integration here instead of to its authorization flow; `{type}` is replaced by the integration type |
| `style=false`  | Do not load Unified.to's stylesheet                                                                         |
| `nocategories` | Do not display category badges for each integration                                                         |
| `notabs`       | Do not display the category tabs                                                                            |

## Package manager

```bash
npm install @unified-api/js-directory
```

```ts
import { renderDirectory } from '@unified-api/js-directory';

await renderDirectory('unified_widget', {
    workspace_id: 'WORKSPACE_ID',
    categories: ['crm', 'ats'],
    external_xref: currentUser.id,
    success_redirect: 'https://example.com/connected',
});
```

`renderDirectory(target, options)` takes an element or element ID and resolves once the directory is rendered. It can be called for several elements on one page.

```ts
{
    workspace_id: string;          // your workspace_id found at https://app.unified.to/settings/api
    environment?: string;          // defaults to 'Production'
    categories?: string[];         // limit the list of integrations to these categories (crm, ats, hris, ...)
    external_xref?: string;        // your ID for the account/user that is signed into your application
    state?: string;                // a state string that will be sent back to your success URL
    scopes?: string[];             // Unified.to permission scopes to request from OAuth2-based integrations
    success_redirect?: string;     // defaults to the current page
    failure_redirect?: string;     // defaults to the current page
    nostyle?: boolean;             // do not load Unified.to's stylesheet
    nocategories?: boolean;        // do not display category badges for each integration
    notabs?: boolean;              // do not display the category tabs
    lang?: string;
    dc?: 'us' | 'eu' | 'au';       // data center/region; defaults to 'us'
    link_url?: string;             // link to this URL instead of the authorization flow; '{type}' is replaced
}
```

The script-tag build also exposes the same function as `window.UnifiedDirectory.renderDirectory`.

## Styling

Styles are loaded from `https://api.unified.to/docs/unified.css` (from the matching region's API). Pass `nostyle` / `style=false` to use your own, targeting the `unified_*` class names.

## Development

```bash
npm install
npm run dev     # serves index.html, which renders the directory with src/index.ts
npm run build   # dist/: ES module + CommonJS builds, type declarations, and the unified.js script-tag build
```

`src/models/Unified.ts` is a copy of unified-api's `src/models/Unified.ts` (the category labels come from its `CATEGORIES`). Re-copy it when categories change.

`dist/unified.js` must keep that file name: the script finds its own `<script>` tag, and so its query parameters, by looking for `unified.js` in the `src`.

## Publishing

```bash
npm version patch
npm publish --access public
```

`prepublishOnly` builds `dist/` first. After publishing, bump `@unified-api/js-directory` in unified-api so `/docs/unified.js` serves the new version.
