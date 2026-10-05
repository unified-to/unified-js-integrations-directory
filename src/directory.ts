import { unified_add_styles } from './styles';
import { IIntegration, TIntegrationCategory, CATEGORIES } from './models/Unified';
import { unified_load } from './load';
import { HtmlClass } from './html';
import { API_URLS, TDataCenter } from './config';

type TIntegrationCategoryType = Exclude<TIntegrationCategory, 'metadata' | 'auth' | 'passthrough' | 'scim'>;
export type TTheme = 'dark' | 'light' | 'auto';

export interface IDirectoryOptions {
    workspace_id: string; // your workspace_id found at https://app.unified.to/settings/api
    environment?: string; // Defaults to 'Production'
    categories?: string[] | string; // Limit the list of integrations to these categories (crm, ats, hris, ...)
    external_xref?: string; // Your ID for the account/user that is signed into your application
    state?: string; // A state string that will be sent back to your success URL
    scopes?: string[] | string; // Unified.to permission scopes to request from OAUTH2-based integrations
    success_redirect?: string; // Defaults to the current page
    failure_redirect?: string; // Defaults to the current page
    nostyle?: boolean; // Do not load Unified.to's stylesheet
    nocategories?: boolean; // Do not display category badges for each integration
    notabs?: boolean; // Do not display the category tabs
    lang?: string;
    dc?: TDataCenter; // Data center/region; defaults to 'us'
    link_url?: string; // Link each integration to this URL instead of the authorization URL; '{type}' is replaced with the integration type
    theme?: TTheme | string; // 'dark', 'light', or omit to auto-detect (also reads ?theme= from the page URL)
}

const MAP: { [path in TIntegrationCategory]?: string } = CATEGORIES.reduce(
    (acc, category) => {
        acc[category.category] = category.label;
        return acc;
    },
    {} as { [path in TIntegrationCategory]?: string }
);

function normalizeTheme(value?: string | null): TTheme {
    const normalized = (value || '').toLowerCase().trim();
    if (normalized.startsWith('dark')) {
        return 'dark';
    }
    if (normalized.startsWith('light')) {
        return 'light';
    }
    return 'auto';
}

function toCsv(value?: string[] | string) {
    return Array.isArray(value) ? value.join(',') : value;
}

/**
 * Renders the Unified.to integrations directory into `target` (an element or element ID).
 * Resolves once the directory has been rendered.
 */
export function renderDirectory(target: HTMLElement | string, options: IDirectoryOptions) {
    const element = typeof target === 'string' ? document.getElementById(target) : target;
    if (!element) {
        console.error('did not find element ' + target);
        return Promise.resolve();
    }

    const workspaceId = options.workspace_id;
    const env = options.environment || 'Production';
    const categories = toCsv(options.categories);
    const scopes = toCsv(options.scopes);
    const dc: TDataCenter = options.dc && API_URLS[options.dc] ? options.dc : 'us';
    const apiUrl = API_URLS[dc];
    const theme = normalizeTheme(options.theme || new URLSearchParams(location.search).get('theme'));
    const themeClass = theme === 'dark' ? ' dark-theme' : theme === 'light' ? ' unified-theme-light' : '';
    let notabs = options.notabs;

    const url = `${apiUrl}/unified/integration/workspace/${workspaceId}?summary=1${categories ? '&categories=' + categories : ''}${
        env === 'Production' ? '' : '&env=' + encodeURIComponent(env)
    }`;

    if (!options.nostyle) {
        unified_load(`${apiUrl}/docs/unified.css`, false, function (css: string) {
            unified_add_styles(css);
        });
    }

    return new Promise<void>((resolve) => {
        unified_load(url, true, (json: IIntegration[]) => {
            let cats: string[] = [];
            (json || []).forEach(function (v) {
                ((v.categories as TIntegrationCategoryType[]) || []).forEach(function (c) {
                    if (cats.indexOf(c) === -1 && MAP[c]) {
                        if ((categories && categories.indexOf(c) > -1) || !categories) {
                            cats.push(c);
                        }
                    }
                });
            });
            cats = cats.sort(function (a, b) {
                return a.localeCompare(b);
            });

            const catsHtml = new HtmlClass();
            if (cats.length <= 1) {
                notabs = true;
            } else {
                catsHtml.add(
                    catsHtml.a('All', {
                        class: 'unified_button unified_button_all active',
                    })
                );

                (cats as TIntegrationCategoryType[]).forEach(function (c) {
                    catsHtml.add(
                        catsHtml.a(MAP[c]!, {
                            class: `unified_button unified_button_${c}`,
                        })
                    );
                });
            }

            const vendorsHtml = new HtmlClass();
            (json || []).forEach(function (v) {
                const url = options.link_url
                    ? options.link_url.replace('{type}', v.type)
                    : vendorsHtml.url(`${apiUrl}/unified/integration/auth/${workspaceId}/${v.type}`, {
                          state: options.state,
                          redirect: 1,
                          success_redirect: options.success_redirect || location.href,
                          failure_redirect: options.failure_redirect || location.href,
                          external_xref: options.external_xref,
                          scopes,
                          env,
                          lang: options.lang,
                          theme: theme === 'auto' ? undefined : theme,
                      });

                const _cats = !options.nocategories
                    ? vendorsHtml.div(
                          ((v.categories as TIntegrationCategoryType[]) || [])
                              .filter((c) => !categories || categories.indexOf(c) > -1)
                              .filter((c) => MAP[c])
                              .map((c) => `<span>${MAP[c]}</span>`)
                              .join(''),
                          {
                              class: 'unified_vendor_cats',
                          }
                      )
                    : '';
                const _name = vendorsHtml.div(v.name, { class: 'unified_vendor_name' });

                vendorsHtml.add(
                    vendorsHtml.a(vendorsHtml.img(v.logo_url!, { class: 'unified_image' }) + vendorsHtml.div(_name + _cats, { class: 'unified_vendor_inner' }), {
                        href: url,
                        class: `unified_vendor ${(v.categories || []).map((c) => `unified_${c}`).join(' ')}`,
                    })
                );
            });

            element.innerHTML =
                '' +
                `<div class="unified${themeClass}">` +
                (!notabs ? '<div class="unified_menu">' + catsHtml + '</div>' : '') +
                '<div class="unified_vendors">' +
                vendorsHtml +
                '</div>' +
                '</div>';

            onclick(element, 'unified_button_all', () => selectCategory(element));
            cats.forEach(function (c) {
                onclick(element, `unified_button_${c}`, () => selectCategory(element, c));
            });

            selectCategory(element);
            resolve();
        });
    });
}

function onclick(element: HTMLElement, className: string, fn: () => void) {
    const items = element.getElementsByClassName(className);
    for (let i = 0; i < items.length; i++) {
        items[i].addEventListener('click', (event: Event) => {
            event.preventDefault();
            fn();
        });
    }
}

function selectCategory(element: HTMLElement, cat?: string) {
    if (!cat) {
        show(element.getElementsByClassName('unified_vendor'), true);
        active(element.getElementsByClassName('unified_button'), false);
        active(element.getElementsByClassName('unified_button_all'), true);
    } else {
        show(element.getElementsByClassName('unified_vendor'));
        show(element.getElementsByClassName('unified_' + cat), true);
        active(element.getElementsByClassName('unified_button'), false);
        active(element.getElementsByClassName('unified_button_' + cat), true);
    }

    function show(l: HTMLCollectionOf<Element>, bool?: boolean) {
        for (let i = 0; i < l.length; i++) {
            (l[i] as HTMLElement).style.display = bool ? '' : 'none';
        }
    }

    function active(l: HTMLCollectionOf<Element>, bool?: boolean) {
        for (let i = 0; i < l.length; i++) {
            const el = l[i];
            el.className = el.className.replace('active', '').trim();
            if (bool) {
                el.className += ' active';
            }
        }
    }
}
