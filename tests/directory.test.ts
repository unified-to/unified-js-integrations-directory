import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { renderDirectory, type IDirectoryOptions } from '../src';

// What the workspace integrations endpoint returns (it applies the `categories` filter itself; the mock records the request)
const INTEGRATIONS = [
    { type: 'hubspot', name: 'HubSpot', categories: ['crm', 'martech'], logo_url: '/hubspot.png' },
    { type: 'greenhouse', name: 'Greenhouse', categories: ['ats', 'hris'], logo_url: '/greenhouse.png' },
];

let requested: string[] = [];

/** Answers every request: JSON for the integrations list, empty CSS for the stylesheet. */
class MockXMLHttpRequest {
    static DONE = 4;
    readyState = 0;
    responseText = '';
    onreadystatechange: ((e: unknown) => void) | null = null;
    private url = '';
    open(_method: string, url: string) {
        this.url = url;
    }
    setRequestHeader() {}
    send() {
        requested.push(this.url);
        this.responseText = this.url.includes('/unified/integration/workspace/') ? JSON.stringify(INTEGRATIONS) : '';
        // like a browser: LOADING (where unified_load collects the body), then DONE
        setTimeout(() => {
            this.readyState = 3;
            this.onreadystatechange?.({});
            this.readyState = 4;
            this.onreadystatechange?.({});
        });
    }
}

async function render(options: Partial<IDirectoryOptions>) {
    const element = document.createElement('div');
    document.body.appendChild(element);
    await renderDirectory(element, { workspace_id: 'ws_123', ...options });
    const listUrl = new URL(requested.find((url) => url.includes('/unified/integration/workspace/'))!);
    const authUrls = [...element.querySelectorAll<HTMLAnchorElement>('a.unified_vendor')].map((a) => new URL(a.href));
    return { listUrl, authUrls, element };
}

describe('renderDirectory categories and scopes (backward compatibility)', () => {
    const originalXhr = globalThis.XMLHttpRequest;

    beforeEach(() => {
        requested = [];
        globalThis.XMLHttpRequest = MockXMLHttpRequest as unknown as typeof XMLHttpRequest;
    });

    afterEach(() => {
        globalThis.XMLHttpRequest = originalXhr;
        document.body.innerHTML = '';
    });

    test('without categories or scopes: no filter, and auth links request no scopes (unchanged)', async () => {
        const { listUrl, authUrls } = await render({});
        expect(listUrl.searchParams.has('categories')).toBe(false);
        expect(authUrls.map((url) => url.pathname)).toEqual(['/unified/integration/auth/ws_123/hubspot', '/unified/integration/auth/ws_123/greenhouse']);
        expect(authUrls.every((url) => !url.searchParams.has('scopes'))).toBe(true);
    });

    test('with categories: filters by them (unchanged)', async () => {
        const { listUrl } = await render({ categories: ['crm'] });
        expect(listUrl.searchParams.get('categories')).toBe('crm');
    });

    test('with scopes only: filters by the categories of the scopes and requests the scopes', async () => {
        const { listUrl, authUrls } = await render({ scopes: ['crm_contact_read', 'martech_list_read', 'webhook'] });
        expect(listUrl.searchParams.get('categories')).toBe('crm,martech');
        expect(authUrls[0].searchParams.get('scopes')).toBe('crm_contact_read,martech_list_read,webhook');
    });

    test('with categories and scopes: categories win', async () => {
        const { listUrl, authUrls } = await render({ categories: ['ats'], scopes: ['crm_contact_read'] });
        expect(listUrl.searchParams.get('categories')).toBe('ats');
        expect(authUrls[0].searchParams.get('scopes')).toBe('crm_contact_read');
    });

    test('the embed script query (?scopes=) behaves the same as the option', async () => {
        const { listUrl } = await render({ scopes: 'ats_job_read,hris_employee_read' });
        expect(listUrl.searchParams.get('categories')).toBe('ats,hris');
    });
});
