const mainCss = require('./main.css');
const buttonCss = require('./button.css');
const overlayCss = require('./overlay.css');
const dialogCss = require('./dialog.css');

const css = {
    init(api) {
        this.addCss([mainCss, buttonCss, overlayCss, dialogCss].join('\n\n'), 'game-api');

        api.events.on('config', config => {
            if(Array.isArray(config.css)) {
                config.css.map(api.resources.getPath).forEach(path => css.addLink(path));
            }
        });
    },

    addLink(href, onLoad, onError) {
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', href);
        link.onload = onLoad;
        link.onerror = onError;
        document.head.appendChild(link);
    },

    addCss(css, source) {
        const style = document.createElement('style');
        style.setAttribute('data-source', source);
        style.textContent = css;
        document.head.appendChild(style);
    },
};

module.exports = css;
