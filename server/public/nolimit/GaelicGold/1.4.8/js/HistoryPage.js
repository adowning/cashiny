"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryPage = void 0;
const SlotKeypad_1 = require("../../../../SlotKeypad");
const luxon_1 = require("luxon");
const HtmlBasePage_1 = require("./HtmlBasePage");
const GameMenuDialogView_1 = require("../GameMenuDialogView");
const TemplateLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/TemplateLoader");
const CalendarController_1 = require("./subviews/CalendarController");
/**
 * Created by Jonas Wålekvist on 2019-11-25.
 */
class HistoryPage extends HtmlBasePage_1.HtmlBasePage {
    constructor(parentDiv, screenSystem, name, parentView, header) {
        super(parentDiv, screenSystem, name, parentView, header);
    }
    load() {
        const templateLoader = new TemplateLoader_1.TemplateLoader(SlotKeypad_1.SlotKeypad.apiPlugIn.resources.getStaticRoot());
        templateLoader.add({
            name: GameMenuDialogView_1.MenuButtonIDs.HISTORY,
            url: "node_modules/@nolimitcity/slot-keypad/resources/default/templates/history.mustache"
        });
        return templateLoader.load()
            .then((assets) => this.addLoadedScreenTemplates(assets))
            .then(() => this.init());
    }
    activate() {
        super.activate();
        this.update();
        this.screen.show();
    }
    deactivate() {
        this.screen.hide();
        this.calendarController.resetView();
        super.deactivate();
    }
    init() {
        super.init();
        luxon_1.Settings.defaultLocale = SlotKeypad_1.SlotKeypad.apiPlugIn.options.language;
        this.calendarController = new CalendarController_1.CalendarController(this.screen);
    }
    static makeElement(tag, content) {
        const el = document.createElement(tag);
        if (content) {
            el.innerHTML = content;
        }
        return el;
    }
    static scrollTo(element, to, duration) {
        if (duration <= 0) {
            return;
        }
        const difference = to - element.scrollTop;
        const perTick = difference / duration * 10;
        setTimeout(function () {
            element.scrollTop = element.scrollTop + perTick;
            if (element.scrollTop === to) {
                return;
            }
            HistoryPage.scrollTo(element, to, duration - 10);
        }, 10);
    }
    onResize(bounds) {
        this.calendarController.resize(bounds);
        super.onResize(bounds);
    }
    update() {
        this.calendarController.update();
    }
}
exports.HistoryPage = HistoryPage;
//# sourceMappingURL=HistoryPage.js.map