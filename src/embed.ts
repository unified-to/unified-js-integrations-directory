// Drop-in <script> entry point, served as https://api.unified.to/docs/unified.js?wid=...&did=...
import { renderDirectory } from './directory';
import { getBool, getString } from './scriptquery';
import { TDataCenter } from './config';

export { renderDirectory };

const __unified_load_back = window.onload;

window.onload = function (ev: Event) {
    const workspaceId = getString('wid');
    const divId = getString('did');

    if (workspaceId && divId) {
        renderDirectory(divId, {
            workspace_id: workspaceId,
            environment: getString('env'),
            categories: getString('cat'),
            external_xref: getString('uid'),
            state: getString('state'),
            success_redirect: getString('surl'),
            failure_redirect: getString('furl'),
            scopes: getString('scopes'),
            nostyle: getBool('style') === false,
            nocategories: getBool('nocategories'),
            notabs: getBool('notabs'),
            lang: getString('lang'),
            dc: getString('dc') as TDataCenter,
            link_url: getString('link_url'),
        });
    }

    if (__unified_load_back) {
        __unified_load_back.call(window, ev);
    }
};
