interface IElementOptions {
    class?: string;
    onclick?: string;
    href?: string;
    title?: string;
    style?: string;
    id?: string;
}

export class HtmlClass {
    private lines: string[] = [];

    constructor() {
        this.lines = [];
    }

    public add(elem: string) {
        this.lines.push(elem);
    }

    public url(url: string, query?: { [path in string]?: string | number | boolean }) {
        let u = url;
        if (query) {
            u += '?';
            const l: string[] = [];
            Object.keys(query).forEach((key) => {
                if (query[key] || query[key] === false || query[key] === 0) {
                    // console.log('url', key, query[key]);
                    l.push(`${key}=${encodeURIComponent(query[key]!)}`);
                }
            });
            u += l.join('&');
        }

        return u;
    }

    public toString() {
        return this.lines.join('');
    }

    private options(_opt?: IElementOptions) {
        return `${_opt?.class ? ` class="${_opt.class}"` : ''}
            ${_opt?.title ? ` title="${_opt.title}"` : ''}
            ${_opt?.id ? ` id="${_opt.id}"` : ''}
            ${_opt?.style ? ` style="${_opt.style}"` : ''}
            ${_opt?.onclick ? ` onclick="${_opt.onclick}"` : ''}`;
    }

    public input(name: string, value?: string, type = 'text', placeholder?: string, options?: IElementOptions) {
        return `<input type="${type}" name="${name}" placeholder="${placeholder || ''}" value="${value || ''}"${this.options(options)}/>`;
    }

    public a(inner: string, options: IElementOptions) {
        return `<a
            href="${options.href || '#'}"
            ${this.options(options)}
            >
                ${inner}
            </a>`;
    }

    public elem(id: string) {
        return document.getElementById(id);
    }

    public onclick(id: string, fn: Function, preventDefault = false) {
        const _d = this.elem(id);
        let d: HTMLCollection | HTMLElement[];
        if (_d) {
            d = [_d];
        } else {
            d = document.getElementsByClassName(id);
        }
        if (!d) {
            console.error('cannot find', id);
            return;
        }

        for (let item of d) {
            if (preventDefault) {
                addEvent(item, 'click', (event: Event) => {
                    // console.log('click');
                    // alert('hi!');
                    event.preventDefault();
                    fn();
                });
            } else {
                addEvent(item, 'click', fn);
            }
        }

        function addEvent(element: any | HTMLAnchorElement, evnt: string, funct: Function) {
            if (element.attachEvent) {
                return element.attachEvent('on' + evnt, funct);
            } else {
                return element.addEventListener(evnt, funct, false);
            }
        }
    }

    public img(src: string, options: IElementOptions) {
        return `<img src="${src}"
        ${this.options(options)}
            >`;
    }

    public div(inner: string, options: IElementOptions) {
        return `<div
        ${this.options(options)}
            >
                ${inner}
            </div>`;
    }
}
