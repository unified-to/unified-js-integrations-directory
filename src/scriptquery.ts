const VARS = new Map(); //  { [path in string]: string } = {};

export function getString(id: string, script_name = 'unified') {
    const str = unified_get_url_var_from_script(id, script_name);
    if (str) {
        return decodeURIComponent(str);
    } else {
        return str;
    }
}

export function getColour(id: string, script_name = 'unified') {
    return unified_get_url_var_from_script(id, script_name)?.replace('#', '');
}

export function getNumber(id: string, script_name = 'unified') {
    return Number(unified_get_url_var_from_script(id, script_name));
}

export function getBool(id: string, script_name = 'unified') {
    const val = unified_get_url_var_from_script(id, script_name);
    if (val === undefined) {
        return undefined;
    }
    return ['true', '1', true].includes(val);
}

export function unified_get_url_var_from_script(key: string, script_name = 'unified') {
    if (VARS.has(key)) {
        return VARS.get(key);
    }

    var scripts = document.getElementsByTagName('script');
    var index = scripts.length - 1;
    for (var i = 0; scripts[i]; i++) {
        if (scripts[i].src.indexOf(`${script_name}.js`) > -1) {
            index = i;
            break;
        }
    }
    var script = scripts[index];
    var scriptURL = script.src;

    scriptURL.replace(/[?&]+([^=&]+)=([^&]*)/gi, (_m, key: string, value: string) => {
        if (value === 'undefined') {
            value = '';
        }
        VARS.set(key, value || '');
        return '';
    });

    return VARS.get(key);
}
