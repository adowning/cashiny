const eventSystem = require('./event-system');

const resizeDetector = eventSystem.create();

resizeDetector.listen = element => {

    element.resizeSensor = document.createElement('div');

    const sensorStyle = 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;';
    const sensorExpandStyle = 'position: absolute; left: 0; top: 0; transition: 0s;';
    const sensorShrinkStyle = sensorExpandStyle + ' width: 200%; height: 200%;';

    element.resizeSensor.style.cssText = sensorStyle;
    element.resizeSensor.innerHTML =
        '<div style="' + sensorStyle + '">' +
        '<div style="' + sensorExpandStyle + '"></div>' +
        '</div>' +
        '<div style="' + sensorStyle + '">' +
        '<div style="' + sensorShrinkStyle + '"></div>' +
        '</div>';

    element.appendChild(element.resizeSensor);

    if (element.resizeSensor.offsetParent !== element) {
        element.style.position = 'relative';
    }

    const expand = element.resizeSensor.childNodes[0];
    const expandChild = expand.childNodes[0];
    const shrink = element.resizeSensor.childNodes[1];

    let lastWidth = element.offsetWidth;
    let lastHeight = element.offsetHeight;

    function onResize() {
        resizeDetector.trigger('resize', element);
        reset();
    }

    let timeout;
    function onScroll() {
        const dirty = element.offsetWidth !== lastWidth || element.offsetHeight !== lastHeight;

        if(dirty) {
            lastWidth = element.offsetWidth;
            lastHeight = element.offsetHeight;
            cancelAnimationFrame(timeout);
            timeout = requestAnimationFrame(onResize);
        }
    }

    function reset() {
        expandChild.style.width = '100000px';
        expandChild.style.height = '100000px';

        expand.scrollLeft = 100000;
        expand.scrollTop = 100000;

        shrink.scrollLeft = 100000;
        shrink.scrollTop = 100000;
    }

    reset();

    shrink.addEventListener('scroll', onScroll);
    expand.addEventListener('scroll', onScroll);
};

module.exports = resizeDetector;
