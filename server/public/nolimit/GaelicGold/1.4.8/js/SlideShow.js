"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlideShow = void 0;
/**
 * Class description
 *
 * Created: 2020-03-10
 * @author jonas
 */
const gsap_1 = require("gsap");
const PointerStateIconSet_1 = require("../../buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("../../displayobjects/Icon");
const SvgLoader_1 = require("../../../loader/SvgLoader");
const GuiDefaultTextures_1 = require("../../default/GuiDefaultTextures");
const PointerStateColorSet_1 = require("../../buttons/states/sets/PointerStateColorSet");
const GuiUtils_1 = require("../../utils/GuiUtils");
const GuiLayout_1 = require("../../utils/GuiLayout");
const IconButton_1 = require("../../buttons/IconButton");
const SlideShowBullet_1 = require("./SlideShowBullet");
var SlideDirection;
(function (SlideDirection) {
    SlideDirection[SlideDirection["LEFT"] = -1] = "LEFT";
    SlideDirection[SlideDirection["NONE"] = 0] = "NONE";
    SlideDirection[SlideDirection["RIGHT"] = 1] = "RIGHT";
})(SlideDirection || (SlideDirection = {}));
class SlideShow extends PIXI.Container {
    get slidePixelsPerSecond() {
        return this._slidePixelsPerSecond;
    }
    set slidePixelsPerSecond(value) {
        this._slidePixelsPerSecond = value;
    }
    get pageFlipDelay() {
        return this._pageFlipDelay;
    }
    set pageFlipDelay(value) {
        this._pageFlipDelay = value;
    }
    get isSinglePaged() { return !!this._pages && this._pages.length == 1; }
    constructor(pages, borderTop, borderBottom, colors) {
        super();
        this._pageAnimations = [];
        this._slideDistance = 0;
        this._pageFlipDelay = SlideShow.DEFAULT_PAGE_FLIP_DELAY;
        this._slidePixelsPerSecond = 4000; //4000 results in a 0.25 duration for a slide in 1280x720.
        this._currentIndex = -1;
        this._colors = colors;
        this._slideShowBackground = this.createSlideShowBackground(colors.backgroundColor, colors.backgroundAlpha);
        //Borders
        this._borderTop = borderTop;
        this._borderBottom = borderBottom;
        this._borderBottom.position.y = this._slideShowBackground.height;
        //Pages
        this.setupPages(pages);
        //Navigation
        this.createNavigation();
        this.addChild(this._slideShowBackground, this._pageContainer, this._borderTop, this._borderBottom, this._navButtonsContainer, this._navBulletsContainer);
    }
    createNavigation() {
        const pageHeight = 390;
        this._pageContainer.position.set(0, pageHeight * 0.5);
        if (this.isSinglePaged) {
            this._navButtonsContainer = new PIXI.Container();
            this._navBulletsContainer = new PIXI.Container();
        }
        else {
            this._navBulletsContainer = this.createNavBullets(this._pages.length);
            this._navBulletsContainer.name = "_navBulletsContainer";
            this._navButtonsContainer = this.createNavButtons();
            const bulletX = this._navBulletsContainer.width * 0.5 + 15;
            this._navButtons[0].position.set(-bulletX, this._navBulletsContainer.height * 0.5);
            this._navButtons[1].position.set(bulletX, this._navBulletsContainer.height * 0.5);
            this._navButtonsContainer.name = "_navButtonsContainer";
            this._navBulletsContainer.position.set(0, pageHeight + 20);
            this._navButtonsContainer.position.set(0, pageHeight + 20);
        }
    }
    createSlideShowBackground(color = 0x000000, alpha = 0.4) {
        const cont = new PIXI.Container();
        const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        sprite.width = 1680;
        sprite.height = 390;
        sprite.anchor.set(0.5, 0);
        sprite.tint = color;
        sprite.alpha = alpha;
        cont.addChild(sprite);
        return cont;
    }
    changeWidth(width) {
        this._slideDistance = width * 0.5 + 360;
    }
    resize() {
        for (let page of this._pages) {
            page.resize();
        }
    }
    startDrag() {
        if (this._scheduledFlip != undefined && this._scheduledFlip.isActive()) {
            this._scheduledFlip.pause();
        }
    }
    endDrag() {
        if (this._scheduledFlip != undefined && this._scheduledFlip.paused()) {
            this._scheduledFlip.resume();
        }
    }
    start() {
        this.isSinglePaged ? this.showSinglePage() : this.navToIndex(0);
    }
    pause() {
        this.stop();
    }
    resume() {
        this.isSinglePaged ? this.showSinglePage() : this.navToIndex(this._currentIndex + 1, SlideDirection.LEFT);
    }
    stop() {
        for (let page of this._pages) {
            page.enable(false);
        }
        if (this._scheduledFlip) {
            this._scheduledFlip.kill();
        }
        if (this._currentPageSwitchAnimation && this._currentPageSwitchAnimation.isActive()) {
            this._currentPageSwitchAnimation.progress(1);
            this._currentPageSwitchAnimation.kill();
        }
    }
    showSinglePage() {
        this._pages[0].position.set(0, 0);
        this._pages[0].alpha = 1;
        this._pages[0].visible = true;
    }
    scheduleNextAutoFlip() {
        if (this._scheduledFlip) {
            this._scheduledFlip.kill();
        }
        this._scheduledFlip = new gsap_1.TweenLite(this, this._pageFlipDelay, {
            onComplete: () => {
                this.next();
            }
        });
    }
    next() {
        this.navToIndex(this._currentIndex + 1, SlideDirection.LEFT);
    }
    prev() {
        this.navToIndex(this._currentIndex - 1, SlideDirection.RIGHT);
    }
    navToIndex(index, direction = SlideDirection.NONE) {
        let nextIndex = index % this._pages.length;
        if (nextIndex < 0) {
            nextIndex += this._pages.length;
        }
        this.switchToPage(nextIndex, direction);
        for (let bullet of this._navBullets) {
            bullet.button.toggled = bullet.index == nextIndex;
            bullet.button.enable(bullet.index != nextIndex);
        }
        this._currentIndex = nextIndex;
        this.scheduleNextAutoFlip();
    }
    switchToPage(index, direction) {
        const tl = new gsap_1.TimelineLite();
        if (this._currentIndex >= 0) {
            this._pages[this._currentIndex].enable(false);
        }
        this._pages[index].enable(false);
        //remove page
        if (this._currentIndex >= 0) {
            tl.add(this.createTransitionAnimation(this._currentIndex, this._pageBackgrounds[this._currentIndex], false, direction));
        }
        //add Page
        tl.add(this.createTransitionAnimation(index, this._pageBackgrounds[index], true, direction), 0);
        tl.add(() => {
            this._pages[index].enable(true);
        });
        if (this._currentPageSwitchAnimation && this._currentPageSwitchAnimation.isActive()) {
            this._currentPageSwitchAnimation.progress(1);
            this._currentPageSwitchAnimation.kill();
        }
        this._currentPageSwitchAnimation = tl;
    }
    createTransitionAnimation(pageIndex, bg, show, direction) {
        const page = this._pages[pageIndex];
        const endX = (this._slideDistance * direction);
        const distance = Math.max(Math.abs(endX) - Math.abs(page.position.x), 0);
        let duration = distance / this._slidePixelsPerSecond;
        duration = endX == 0 ? 0.2 : duration;
        const tl = new gsap_1.TimelineLite();
        if (show) {
            tl.add(() => {
                page.position.x = -endX;
                page.visible = true;
                bg.visible = true;
                bg.alpha = 0;
                this._pageBackgroundContainer.addChild(bg); //moves this page background to top of the backgrounds.
            });
            tl.add([
                new gsap_1.TweenLite(bg, duration, { alpha: 1, ease: gsap_1.Linear.easeNone }),
                new gsap_1.TweenLite(page, duration, { alpha: 1, ease: gsap_1.Linear.easeNone }),
                new gsap_1.TweenLite(page.position, duration, { x: 0 }),
            ]);
        }
        else {
            tl.add([
                new gsap_1.TweenLite(bg, duration, { alpha: 0, ease: gsap_1.Linear.easeNone }),
                new gsap_1.TweenLite(page, duration, { alpha: 0, ease: gsap_1.Linear.easeNone }),
                new gsap_1.TweenLite(page.position, duration, { x: endX }),
            ]);
            tl.eventCallback("onComplete", () => {
                page.visible = false;
                bg.visible = false;
                page.position.x = 0;
                bg.alpha = 0;
            });
        }
        return tl;
    }
    createNavBullets(count) {
        const container = new PIXI.Container();
        this._navBullets = [];
        for (let i = 0; i < count; i++) {
            const bullet = new SlideShowBullet_1.SlideShowBullet(i, (index) => this.navToIndex(i), this._colors.bulletColor);
            this._navBullets.push(container.addChild(bullet));
        }
        GuiLayout_1.GuiLayout.align(this._navBullets, 10, GuiLayout_1.Align.CENTER, GuiLayout_1.Direction.HORIZONTAL);
        container.pivot.set(container.width * 0.5, 0);
        return container;
    }
    createNavButtons() {
        const container = new PIXI.Container();
        const prevArrow = SvgLoader_1.SvgLoader.getSvgTexture(GuiDefaultTextures_1.GuiDefaultTextures.NAV_ARROW).clone();
        prevArrow.rotate = 12;
        const prevIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(prevArrow));
        const prevColors = new PointerStateColorSet_1.PointerStateColorSet(GuiUtils_1.GuiUtils.getARGB(this._colors.bulletColor, 1), GuiUtils_1.GuiUtils.getARGB(this._colors.bulletColor, 0.25));
        const prevButton = new IconButton_1.IconButton("navPrev", prevIcons, prevColors);
        prevButton.addClickCallback(() => this.prev());
        prevButton.enable(true);
        prevButton.pivot.set(prevButton.width, prevButton.height * 0.5);
        const nextArrow = SvgLoader_1.SvgLoader.getSvgTexture(GuiDefaultTextures_1.GuiDefaultTextures.NAV_ARROW);
        const nextIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(nextArrow));
        const nextColors = new PointerStateColorSet_1.PointerStateColorSet(GuiUtils_1.GuiUtils.getARGB(this._colors.bulletColor, 1), GuiUtils_1.GuiUtils.getARGB(this._colors.bulletColor, 0.25));
        const nextButton = new IconButton_1.IconButton("navPrev", nextIcons, nextColors);
        nextButton.addClickCallback(() => this.next());
        nextButton.enable(true);
        nextButton.pivot.set(0, nextButton.height * 0.5);
        this._navButtons = [prevButton, nextButton];
        container.addChild(prevButton, nextButton);
        return container;
    }
    setupPages(pages) {
        this._pages = pages;
        this._pageBackgroundContainer = new PIXI.Container();
        this._pageBackgroundContainer.name = "_pageBackgroundContainer";
        this._pageBackgrounds = [];
        this._pageContainer = new PIXI.Container();
        this._pageContainer.name = "_pageContainer";
        this._pageContainer.addChild(this._pageBackgroundContainer);
        for (let page of pages) {
            page.visible = false;
            page.alpha = 0;
            if (!this.isSinglePaged)
                page.setSwipeCallbacks(() => this.startDrag(), () => this.endDrag(), () => this.prev(), () => this.next());
            this._pageContainer.addChild(page);
            const background = this.createPageBackground(page);
            this._pageBackgrounds.push(background);
            this._pageBackgroundContainer.addChild(background);
        }
    }
    createPageBackground(page) {
        const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
        if (page.backgroundColor != undefined) {
            bg.anchor.set(0.5, 0.5);
            bg.width = 1680;
            bg.height = 390;
            bg.visible = false;
            bg.alpha = 0;
            bg.tint = page.backgroundColor;
        }
        else {
            bg.texture = PIXI.Texture.EMPTY;
        }
        return bg;
    }
}
SlideShow.DEFAULT_PAGE_FLIP_DELAY = 10;
exports.SlideShow = SlideShow;
//# sourceMappingURL=SlideShow.js.map