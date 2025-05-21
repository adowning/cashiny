const LOADER_SELECTOR = 'body > iframe.loader';

function getLoader() {
    return document.querySelector(LOADER_SELECTOR);
}

const loaderInteraction = {
    init(api) {
        api.events.on('ready', () => {
            const loader = getLoader();
            if(loader) {
                loader.contentWindow.postMessage(JSON.stringify({game: 'ready'}), '*');
            }
            this.removeLoader();
        });

        window.addEventListener('message', onLoaderMessage);

        function onLoaderMessage(e) {
            try {
                const message = JSON.parse(e.data);
                api.log('game-api - message received:', message);
            } catch(ignored) {
                api.log('Not JSON, ignoring:', e.data);
            }
        }
    },

    sendMessage(message) {
        const loader = getLoader();
        if(loader) {
            loader.contentWindow.postMessage(JSON.stringify(message), '*');
        }
    },

    removeLoader() {
        function removeLoaderElement() {
            const loader = getLoader();

            if(loader && loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }

        setTimeout(removeLoaderElement, 1000);

        const loader = getLoader();
        if(loader) {
            loader.style.transition = 'opacity 1s ease-out';
            loader.style.opacity = 0;
        }
    }
};

module.exports = loaderInteraction;
