"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogHandler = void 0;
class DialogHandler {
    constructor(api, apiDialog) {
        this._api = api;
        this._apiDialog = apiDialog;
    }
    // ---------------- API Methods
    close() {
        this._apiDialog.close();
    }
    hasOpenDialog() {
        return this._apiDialog.hasOpenDialog();
    }
    lock(name) {
        this._apiDialog.lock(name);
    }
    open(html, options) {
        return this._apiDialog.open(html, options);
    }
    unlock(name) {
        this._apiDialog.unlock(name);
    }
    unlockAll() {
        this._apiDialog.unlockAll();
    }
    // ---------------- Api additions
    /**
     * Creates and shows a dialog when state is ready. If not ready it will be queued and shown asap.
     *
     * @param options GameDialogOptions
     */
    showGameDialog(options) {
        const dialogHtml = this.createGameDialogHtml(options);
        if (options.okButtonLabel == undefined) {
            options.okButtonLabel = this._api.translations.translate("OK");
        }
        const div = this.open(dialogHtml, {
            alwaysShow: options.alwaysShow,
            closeable: true,
            onClose: options.onClose
        });
        div.classList.add("game-dialog");
        const okButton = div.querySelector(".ok-button");
        if (okButton != null) {
            okButton.onclick = () => {
                if (options.onOkClick) {
                    options.onOkClick();
                }
                this.close();
            };
        }
        const cancelButton = div.querySelector(".cancel-button");
        if (cancelButton != null) {
            cancelButton.onclick = () => {
                if (options.onCancelClick) {
                    options.onCancelClick();
                }
                this.close();
            };
        }
    }
    showNoCloseGameDialog(options) {
        const dialogHtml = this.createNoCloseGameDialogHtml(options);
        const div = this.open(dialogHtml, {
            alwaysShow: options.alwaysShow,
            closeable: false
        });
        div.classList.add("game-dialog");
    }
    // ---------------- Private
    createGameDialogHtml(options) {
        return this._api.translations.render(DialogHandler.GAME_DIALOG, options);
    }
    createNoCloseGameDialogHtml(options) {
        return this._api.translations.render(DialogHandler.NO_CLOSE_GAME_DIALOG, options);
    }
}
DialogHandler.GAME_DIALOG = `
        {{#header}}<h1>{{header}}</h1>{{/header}}
        {{#message}}<p>{{message}}</p>{{/message}}
        
         <button type="button" class="ok-button"> 
            {{okButtonLabel}}
         </button>
        
        {{#cancelButtonLabel}}
         <button type="button" class="cancel-button"> 
            {{cancelButtonLabel}}
         </button>
        {{/cancelButtonLabel}}
        `;
DialogHandler.NO_CLOSE_GAME_DIALOG = `
        {{#header}}<h1>{{header}}</h1>{{/header}}
        {{#message}}<p>{{message}}</p>{{/message}}
        `;
exports.DialogHandler = DialogHandler;
//# sourceMappingURL=DialogHandler.js.map