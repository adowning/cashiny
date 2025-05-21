const resizeDetector = require('@nolimitcity/core/api/resize-detector');

let lastSize = {
    width: -1,
    height: -1
};

function onHidden() {
    setTimeout(onResize, 500);
}

function onResize() {
    if(document.hidden) {
        onHidden();
        return;
    }

    const size = resize.api.getGameSize();

    let changed = false;
    for(const key in lastSize) {
        if(lastSize[key] !== size[key]) {
            changed = true;
            break;
        }
    }

    if(changed) {
        resize.api.events.trigger('resize', size);
        if(lastSize.orientation !== size.orientation) {
            resize.api.events.trigger('orientation', size.orientation);
        }

        lastSize = size;
    }
}


const resize = {
    init(api) {
        this.api = api;

        const debounce_leading = (func, timeout = 300)=>{
            let timer;
            return (...args) => {
                if (!timer) {
                    func.apply(this, args);
                }
                clearTimeout(timer);
                timer = setTimeout(() => {
                    timer = undefined;
                }, timeout);
            };
        }

        resizeDetector.on('resize', debounce_leading(onResize, 250));
        resizeDetector.listen(api.getGameElement());

        api.events.on('loaded', onResize);

    },
    trigger() {
        onResize();
    }
};

module.exports = resize;
