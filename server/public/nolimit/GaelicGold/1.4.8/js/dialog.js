const resizeDetector = require('@nolimitcity/core/api/resize-detector');

const externalApi = require('./external-api');
const events = require('./nolimit-core-wrapper/events');

const queue = [];

const dialog = {
    init: function(api) {
        this.api = api;
        this.showDialogs = api.options.showDialogs;

        const overlay = getOverlay();
        overlay.addEventListener('click', closeOnOverlay);
        window.addEventListener('keyup', closeOnEscape);

        api.events.on('halt', () => {
            overlay.removeEventListener('click', closeOnOverlay);
            window.removeEventListener('keyup', closeOnEscape);
        });

        api.events.on('showDialogs', (data) => {
            this.showDialogs = data;
        });

        api.events.on('error', unlockAll);
        api.events.on('orientation', onOrientationChange);

        resizeDetector.on('resize', onHiddenChange);
        api.events.on('ready', () => {
            resizeDetector.listen(getHidden());
        });
    },

    /**
     *
     * @param {String} html the HTML to render into the dialog
     * @param {Object} [options] additional options
     * @param {Boolean} [options.closeable=true] can the dialog be closed by keypress or clicking outside
     * @param {Boolean} [options.blackout=false] blackout background on overlay to hide the game completely
     * @param {String} [options.replace] name or identifier; replace an earlier dialog with the same name|identifier, if exists
     * @param {Function} [options.onClose] called on close of dialog
     * @returns {Element}
     */
    open(html, options = {}) {
        options.closeable = options.closeable !== false;

        const div = document.createElement('div');
        div.classList.add('dialog');
        div.innerHTML = html;
        if(options.replace) {
            div.setAttribute('data-replace', options.replace);
        }

        // TODO: this is a simple fix for disabling the actual dialog, but still have blur etc
        if(this.showDialogs || options.alwaysShow) {
            queue.push(div);
        }

        div.options = options;

        const currentDialog = getDialog();

        if(currentDialog && options.replace && options.replace === currentDialog.getAttribute('data-replace')) {
            dialog.close();
        } else if(currentDialog && options.ignoreLocks) {
            dialog.close();
        } else if(queue.length === 1 && isUnlocked()) {
            dialog.api.events.trigger('dialog', 'open');
            show();
        }

        return div;
    },

    close() {
        const overlay = getOverlay();
        overlay.classList.remove('blackout');
        overlay.classList.remove('blocking');

        const dialogElement = getDialog();
        if(dialogElement) {
            if(typeof dialogElement.options.onClose === 'function') {
                dialogElement.options.onClose();
            }

            if(queue.length > 0) {
                setHiddenContent();
            } else {
                dialog.api.events.trigger('dialog', 'close');
                hideWhenDone();
            }
        }
    },
    lock: lock,
    unlock: unlock,
    unlockAll: unlockAll,
    hasOpenDialog() {
        return getDialog() && getDialog().clientHeight > 0;
    }
};

function setHiddenContent() {
    const hidden = getHidden();
    const next = queue.shift();
    hidden.appendChild(next);

    if(typeof next.options.onShowCB === 'function') {
        next.options.onShowCB();
    }
}

function onOrientationChange() {
}

function onHiddenChange(el) {
    const hidden = el.querySelector('.dialog');

    if(hidden) {
        //const hiddenWidth = hidden.clientWidth;
        const hiddenHeight = hidden.clientHeight;

        if(hiddenHeight > 0) {
            const overlay = getOverlay();
            const dialog = getDialog();
            if(dialog) {
                overlay.removeChild(dialog);
            }
            overlay.appendChild(hidden);

            hidden.addEventListener('click', e => {
                e.stopPropagation();
            });

            setupCloseButtons(hidden);
            setupReloadButtons(hidden);
            setupSupportButtons(hidden);
            setupEndSessionButtons(hidden);
            setupExitButtons(hidden);

            if(hidden.options.blackout) {
                overlay.classList.add('blackout');
            }

            if(hidden.options.closeable === false) {
                overlay.classList.add('blocking');
            }
        }
    }
}

function hideWhenDone() {
    getContainer().classList.remove('overlay');
    const currentDialog = getDialog();
    if(currentDialog) {
        currentDialog.parentNode.removeChild(currentDialog);
    }
}

let locks = {};

function lock(name) {
    locks[name] = true;
}

function unlock(name) {
    delete locks[name];
    if(queue.length > 0 && isUnlocked()) {
        dialog.api.events.trigger('dialog', 'open');
        show();
    }
}

function unlockAll() {
    locks = {};
    if(queue.length > 0) {
        dialog.api.events.trigger('dialog', 'open');
        show();
    }
}

function isUnlocked() {
    return Object.keys(locks).length === 0;
}

function show() {
    getContainer().classList.add('overlay');
    setHiddenContent();
}

function reload() {
    externalApi.trigger('reload').or(() => location.reload());
}

function support() {
    externalApi.trigger('support');
}

function endSession() {
    events.trigger('halt');
}

function exitGame() {
    externalApi.trigger('exit').or(() => history.back());
}

function setupSupportButtons(div) {
    const supportButtons = div.querySelectorAll('.support');
    const hasSupport = externalApi.isRegistered('support');

    for(let i = 0; i < supportButtons.length; i++) {
        const button = supportButtons[i];
        if(hasSupport) {
            button.addEventListener('click', support);
        } else {
            button.parentNode.removeChild(button);
        }
    }
}

function setupExitButtons(div) {
    const exitButtons = div.querySelectorAll('.exit');
    for(let i = 0; i < exitButtons.length; i++) {
        const button = exitButtons[i];
        button.addEventListener('click', exitGame);
    }
}

function setupEndSessionButtons(div) {
    const endSessionButtons = div.querySelectorAll('.halt');
    for(let i = 0; i < endSessionButtons.length; i++) {
        const button = endSessionButtons[i];
        button.addEventListener('click', endSession);
    }
}

function setupReloadButtons(div) {
    const reloadButtons = div.querySelectorAll('.reload');
    for(let i = 0; i < reloadButtons.length; i++) {
        const button = reloadButtons[i];
        button.addEventListener('click', reload);
    }
}

function setupCloseButtons(div) {
    const closeButtons = div.querySelectorAll('.close');
    for(let i = 0; i < closeButtons.length; i++) {
        const button = closeButtons[i];
        button.addEventListener('click', dialog.close);
        if(button.hasAttribute('data-timeout')) {
            createCountDown(button);
        }
    }
}

function createCountDown(button) {
    let seconds = parseInt(button.getAttribute('data-timeout')) || 10;
    button.setAttribute('data-text', button.textContent);
    const interval = setInterval(countDown, 1000);

    function countDown() {
        button.textContent = button.getAttribute('data-text') + ' (' + seconds + ')';
        if(isUnlocked()) {
            seconds--;
        }
        if(seconds < 0) {
            clearInterval(interval);
            button.click();
        }
    }

    countDown();
}

function getContainer() {
    return document.querySelector('.nolimit.container');
}

function getOverlay() {
    return document.querySelector('.nolimit .overlay');
}

function getDialog() {
    return getOverlay().querySelector('.nolimit .dialog');
}

function getHidden() {
    return document.querySelector('.nolimit .hidden');
}

function closeOnEscape(e) {
    if(e.keyCode === 27 && isCloseable()) {
        dialog.close();
    }
}

function closeOnOverlay(e) {
    e.stopPropagation();
    if(isCloseable()) {
        dialog.close();
    }
}

function isCloseable() {
    const currentDialog = getDialog();
    return currentDialog && currentDialog.options.closeable;
}

module.exports = dialog;
