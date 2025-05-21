"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplayController = void 0;
class ReplayController {
    constructor(apiPlugin) {
        this.linkPopup = `
<style>
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
</style>
<div class="overlay" style="display:flex; background: rgba(0,0,0,0.7)">
    <div class="dialog">
        <h1>{{#tr}}Replay{{/tr}}</h1>
        <p>{{#tr}}To watch the replay, copy the URL and paste the link in a browser{{/tr}}</p>
        <p style="user-select: auto">{{url}}</p>
        
        <p class="copied" style="opacity:0">{{#tr}}URL copied to clipboard{{/tr}}</p>    
        <div>
            <button type="button" class="close">{{#tr}}OK{{/tr}}</button>
            <button type="button" class="copy">{{#tr}}COPY{{/tr}}</button>
        </div>
  
    </div>
</div>`;
        this.blockedPopup = `
<style>
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
</style>
<div class="overlay" style="display:flex; background: rgba(0,0,0,0.7)">
    <div class="dialog">
        <h1>{{#tr}}Replay launch failed{{/tr}}</h1>
        <p>{{#tr}}Please disable pop-up block in settings or copy the URL below and paste in a browser.{{/tr}}</p>
        <p style="user-select: auto">{{url}}</p>
        
        <p class="copied" style="opacity:0">{{#tr}}URL copied to clipboard{{/tr}}</p>    
        <div>
            <button type="button" class="close">{{#tr}}OK{{/tr}}</button>
            <button type="button" class="copy">{{#tr}}COPY{{/tr}}</button>
        </div>
  
    </div>
</div>`;
        this.apiPlugin = apiPlugin;
    }
    setupButtons(div, url) {
        const closeBtns = div.querySelectorAll('.close');
        for (let i = 0; i < closeBtns.length; i++) {
            const button = closeBtns[i];
            button.addEventListener('click', () => {
                div.remove();
            });
        }
        const copyBtns = div.querySelectorAll('.copy');
        const copyText = div.querySelectorAll('.copied')[0];
        for (let i = 0; i < copyBtns.length; i++) {
            const button = copyBtns[i];
            button.addEventListener('click', () => {
                copyText.style.animation = 'none';
                copyText.offsetHeight; /* trigger reflow */
                copyText.style.animation = "fadeOut 3s forwards";
                navigator.clipboard.writeText(url);
            });
        }
    }
    checkPopUpBlock(url) {
        setTimeout(() => {
            if (!document.hidden) {
                this.showPopup(this.blockedPopup, url);
            }
        }, 400);
    }
    showPopup(popupHtml, url) {
        const nolimitContainer = document.querySelector('.nolimit.container');
        const alert = document.createElement("div");
        alert.innerHTML = this.apiPlugin.translations.render(popupHtml, { url: url });
        this.setupButtons(alert, url);
        nolimitContainer.appendChild(alert);
    }
    openReplay(gameRoundIdOrReplayUrl) {
        if (this.apiPlugin.options.useReplayLinkPopup === true) {
            this.showLinkPopup(gameRoundIdOrReplayUrl);
        }
        else {
            this.playReplay(gameRoundIdOrReplayUrl);
        }
    }
    showLinkPopup(gameRoundIdOrReplayUrl) {
        if (typeof gameRoundIdOrReplayUrl === "string") {
            this.showPopup(this.linkPopup, gameRoundIdOrReplayUrl);
        }
        else {
            this.apiPlugin.communication.history.replayUrl(gameRoundIdOrReplayUrl).then((response) => {
                this.showPopup(this.linkPopup, response.url);
            });
        }
    }
    playReplay(gameRoundIdOrReplayUrl) {
        let link = document.createElement('a');
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener');
        if (typeof gameRoundIdOrReplayUrl === "string") {
            const url = new URL(gameRoundIdOrReplayUrl);
            const urlString = url.href;
            url.searchParams.append("device", this.apiPlugin.options.device);
            url.searchParams.append("language", this.apiPlugin.options.language);
            url.searchParams.append("fromGame", "true");
            link.setAttribute('href', url.href);
            link.click();
            link.remove();
            this.checkPopUpBlock(urlString);
        }
        else {
            this.apiPlugin.communication.history.replayUrl(gameRoundIdOrReplayUrl).then((response) => {
                const url = new URL(response.url);
                const urlString = url.href;
                url.searchParams.append("device", this.apiPlugin.options.device);
                url.searchParams.append("language", this.apiPlugin.options.language);
                url.searchParams.append("fromGame", "true");
                link.setAttribute('href', url.href);
                link.click();
                link.remove();
                this.checkPopUpBlock(urlString);
            });
        }
    }
}
exports.ReplayController = ReplayController;
//# sourceMappingURL=ReplayController.js.map