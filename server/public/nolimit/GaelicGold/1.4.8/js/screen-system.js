const eventSystem = require('./event-system');

const screenSystem = {
    /**
     *
     * @param {HTMLElement} parent - <div> or other element to build the screens in, screens will by default fill this element by 100%
     * @param {Object} options
     * @returns {Object} - the screen API
     */
    create(parent, options = {}) {
        const events = eventSystem.create();

        options.defaultHead = options.defaultHead || '';

        options.attributes = options.attributes || {};
        options.attributes.frameBorder = options.attributes.frameBorder || '0';
        options.attributes.scrolling = options.attributes.scrolling || 'no';

        options.styles = options.styles || {};
        options.styles.width = options.styles.width || '100%';
        options.styles.height = options.styles.height || '100%';
        options.styles.display = options.styles.display || 'none';
        options.styles.position = options.styles.position || 'absolute';

        getScreens()
            .forEach(screen => {
                for(let style in options.styles) {
                    screen.setStyle(options.styles[style]);
                }
            });

        function getScreens() {
            return [].slice.call(parent.children)
                .map(el => new Screen(el));
        }

        /**
         *
         * @exports screens
         */
        const screens = {
            add(name, content) {
                if(!name) {
                    throw 'Screen must have a name';
                }

                if(this.get(name)) {
                    throw `Screen ${name} already exists`;
                }

                const iframe = document.createElement('div');
                iframe.setAttribute('data-name', name);

                for(let attr in options.attributes) {
                    iframe.setAttribute(attr, options.attributes[attr]);
                }

                for(let style in options.styles) {
                    iframe.style[style] = options.styles[style];
                }


                return new Promise(resolve => {
                    iframe.innerHTML =  content;
                    parent.appendChild(iframe);
                    resolve(iframe);
                });
            },

            /**
             * Get screen by name
             * @param name
             * @return {Screen} named screen, or undefined if it doesn't exist
             */
            get(name) {
                return getScreens()
                    .find(s => s.name === name);
            },

            /**
             * Find matching elements in named screen
             * @param name screen name
             * @param selector query selector
             * @return {Array} real array of matching elements
             */
            find(name, selector) {
                const screen = this.get(name);
                if(screen) {
                    return screen.find(selector);
                }
                return [];
            },

            /**
             * Show named/indexed screen
             * @param {String|Number} which screen name or index
             */
            show(which = 0) {
                getScreens()
                    .forEach((screen, index) => {
                        if(screen.name === which || index === which) {
                            screen.show();
                            events.trigger('show', screen);
                        } else {
                            screen.hide();
                        }
                    });
            },

            /**
             * Hide open screen, if any, emit 'hide' event for hidden screen
             */
            hide() {
                getScreens()
                    .forEach(screen => {
                        if(screen.isVisible()) {
                            events.trigger('hide', screen);
                            screen.hide();
                        }
                    });
            },

            /**
             * Remove named/indexed screen permanently
             * @param {String|Number} which screen name or index
             */
            remove(which = 0) {
                const screen = this.get(name);
                if(screen) {
                    events.trigger('remove', which);
                    screen.remove();
                }
            },

            /**
             * Currently showing screen, or undefined
             * @return {Screen} screen
             */
            current() {
                return getScreens()
                    .find(screen => screen.isVisible());
            },

            previous(wrapAround = false) {
                const current = this.current();
                if(current) {
                    if(current.index() > 0) {
                        this.show(current.index() - 1);
                    } else if(wrapAround) {
                        this.show(this.size() -1);
                    }
                }
            },

            next(wrapAround = false) {
                const current = this.current();
                if(current) {
                    if(current.index() < this.size() - 1) {
                        this.show(current.index() + 1);
                    } else if(wrapAround) {
                        this.show(0);
                    }
                }
            },

            size() {
                return getScreens().length;
            },

            /**
             * Find siblings to the outer screen system element
             * @return {Array} siblings to this screens/parent element
             */
            siblings() {
                return Array.prototype.slice.call(parent.parentNode.children).filter(el => {
                    return parent !== el;
                });
            },

            on: events.on,
            trigger: events.trigger,
            destroy:events.destroy
        };

        return screens;
    }
};

/**
 * Represents one screen element
 */
class Screen {
    constructor(element) {
        this.element = element;
        this.name = element.name || element.getAttribute('data-name');
    }

    show() {
        this.element.style.display = 'block';
    }

    hide() {
        this.element.style.display = 'none';
    }

    remove() {
        this.element.parentNode.removeChild(this.element);
    }

    setStyle(key, value) {
        this.element.style[key] = value;
    }

    /**
     * Find matching elements in screen
     * @param selector
     * @return {Array} list of matching elements
     */
    find(selector) {
        let elements = [];
        if(this.element.tagName.toLowerCase() === 'iframe') {
            elements = this.element.contentDocument.querySelectorAll(selector);
        } else {
            elements = this.element.querySelectorAll(selector);
        }
        return [].slice.call(elements);
    }

    isVisible() {
        return this.element.style.display === 'block';
    }

    index() {
        let index = 0;
        let previous = this.element.previousElementSibling;
        while(previous) {
            index++;
            previous = previous.previousElementSibling;
        }
        return index;
    }
}

module.exports = screenSystem;
