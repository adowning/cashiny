function getOrientation(width, height) {
    return width >= height ? 'landscape' : 'portrait';
}

const filters = [];

const gameArea = {
    getGameElement(document = window.document) {
        return document.querySelector('.nolimit.container .game');
    },

    getGameSize(document = window.document) {
        const gameElement = this.getGameElement(document);

        const width = gameElement.offsetWidth;
        const height = gameElement.offsetHeight;

        const size = {
            top: 0,
            left: 0,
            right: width,
            bottom: height,
            width,
            height
        };

        filters.forEach(filter => filter(size));

        size.orientation = size.orientation || getOrientation(size.width, size.height);

        return size;
    },

    addFilter(filter) {
        filters.push(filter);
    }
};

module.exports = gameArea;
