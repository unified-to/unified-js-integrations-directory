export function unified_add_stylesheet_url(url: string) {
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.media = 'all';
    head.appendChild(link);
}

export function unified_add_styles(styles: string) {
    var css = document.createElement('style');

    if ('textContent' in css) {
        css.textContent = styles;
    }

    document.body.appendChild(css);
}
