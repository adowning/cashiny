"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoView = void 0;
/**
 * Created by Jonas Wålekvist on 2019-12-19.
 */
const DialogView_1 = require("./DialogView");
const SlotKeypad_1 = require("../../../SlotKeypad");
const ScreenBounds_1 = require("@nolimitcity/slot-launcher/bin/display/ScreenBounds");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const DemoPage_1 = require("./pages/DemoPage");
const SlotStateHandler_1 = require("@nolimitcity/slot-launcher/bin/plugins/apiplugin/SlotStateHandler");
class DemoView extends DialogView_1.DialogView {
    constructor(controller, api) {
        super(controller, api, "Demo", true);
        this.storedOutcomes = [];
        this.outcomeQueue = [];
        this._client = api.communication.outcome.connect(api.options);
        api.log('Outcome ws connect');
        this._client.on('error', (message) => {
            api.warn('Outcome ws error', message);
            this._controller.disableDemoButton();
        });
        this._client.on('close', () => {
            api.log('Outcome ws close');
        });
        //this._client.clear();
        this._client.on('message', (serverOutcomes) => {
            api.log('Outcome ws message', serverOutcomes);
            this.storedOutcomes = serverOutcomes;
            //this.tryToSpin();
        });
        /*   api.events.on(APIEvent.STATE, (state:SlotState)=>{
               if (state == SlotState.READY){
                   this.tryToSpin();
               }
           });*/
    }
    load() {
        return this.api.resources.loadJson('outcome.json')
            .then((outcomeJson) => {
            this.outcomeJson = outcomeJson;
        });
    }
    init() {
        super.init();
        this._page = new DemoPage_1.DemoPage(this, SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("DEMO"), "");
        this.addChild(this._page);
    }
    tryToSpin() {
        const isReadyState = this.api.slotStates.checkState(SlotStateHandler_1.SlotState.READY);
        const hasStoredOutcomes = this.storedOutcomes.length > 0;
        if (hasStoredOutcomes && isReadyState) {
            this._controller.clickSpin();
        }
    }
    onInteraction(name, value) {
        if (name == DemoView.GO_BUTTON) {
            if (this.outcomeQueue.length > 0) {
                this.sendOutcomesToServer(this.outcomeQueue);
                this.clearQueue();
                this.close();
            }
        }
        else if (name == DemoView.CLEAR_OUTCOME_SETTER_BUTTON) {
            this._client.clear();
        }
        else if (name == DemoView.CLEAR_BUTTON) {
            this.clearQueue();
            this._page.updateButtons();
        }
        else {
            this.addToQueue(this.outcomeJson.demo[value]);
        }
        SlotKeypad_1.SlotKeypad.playButtonSound(name);
    }
    sendOutcomesToServer(queuedOutcomes) {
        for (let namedOutcome of queuedOutcomes) {
            for (let outcome of namedOutcome.outcomes) {
                if (typeof outcome === "string") {
                    this._client.addFlag(outcome);
                }
                else {
                    this._client.addReels(outcome);
                }
            }
        }
    }
    addToQueue(namedOutcome) {
        this.outcomeQueue.push(namedOutcome);
        this._page.updateQueue();
    }
    clearQueue() {
        this.outcomeQueue = [];
        this._page.updateQueue();
    }
    onResize() {
        super.onResize();
        if (!this.shouldResize()) {
            return;
        }
        const bounds = (0, ScreenBounds_1.cloneScreenBounds)(NolimitApplication_1.NolimitApplication.screenBounds);
        bounds.bottom -= this.bottomMargin;
        bounds.height -= this.bottomMargin;
        this._page.onResize(bounds);
        this._page.position.set(bounds.left, bounds.top);
    }
    open() {
        super.open();
        this._page.updateButtons();
        this._page.updateQueue();
        this.onResize();
    }
    close() {
        super.close();
    }
}
DemoView.GO_BUTTON = "GO_BUTTON";
DemoView.CLEAR_BUTTON = "CLEAR_BUTTON";
DemoView.CLEAR_OUTCOME_SETTER_BUTTON = "CLEAR_OUTCOME_SETTER_BUTTON";
exports.DemoView = DemoView;
//# sourceMappingURL=DemoView.js.map