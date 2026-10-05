export function unified_load<T>(url: string, json: boolean, callback: Function) {
    var Http = new XMLHttpRequest();
    if (!Http) {
        callback();
        return;
    }

    Http.open('GET', url);
    if (json) {
        Http.setRequestHeader('Accept', 'application/json');
    }
    Http.send();

    var data = '';
    Http.onreadystatechange = function (_e) {
        if (Http.readyState !== XMLHttpRequest.DONE) {
            data += Http.responseText;
            return;
        }

        try {
            if (json) {
                callback(JSON.parse(data) as T);
            } else {
                callback(data as T);
            }
        } catch (err) {
            callback();
        }
    };
}
