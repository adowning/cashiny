"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GUIScrollContainer = void 0;
/**
 * Created by jonas on 2019-12-10.
 */
const MouseScroller_1 = require("./MouseScroller");
const Scroller_1 = require("./Scroller");
const ScrollBar_1 = require("./ScrollBar");
class GUIScrollContainer extends PIXI.Container {
    constructor(width, height, allowHorizontalScroll = true, allowVerticalScroll = true, fromPromoPanel = false, scrollConfig) {
        super();
        this.scrollEnabled = true;
        this.setScrollDelta = (scroller, xDelta = 0, yDelta = 0) => {
            if (!this.scrollEnabled) {
                return;
            }
            this.setActiveScroller(scroller);
            this.checkAllowedDirections(xDelta, yDelta);
            this.setScrollTarget(scroller, this._scrollTarget.x + xDelta, this._scrollTarget.y + yDelta);
        };
        this.setScrollTarget = (scroller, x, y) => {
            if (x != undefined && this._hasScroll.x && this._directionAllowed.x) {
                this._scrollTarget.x = x;
            }
            if (y != undefined && this._hasScroll.y && this._directionAllowed.y) {
                this._scrollTarget.y = y;
            }
            this.animate();
        };
        this._defaultAllowedDirections = { x: allowHorizontalScroll, y: allowVerticalScroll };
        this._hasScroll = { x: false, y: false };
        this._directionAllowed = { x: true, y: true };
        this._maskContentSizeDiff = new PIXI.Point();
        this._scrollTarget = new PIXI.Point();
        this._maskSize = { width: width, height: height };
        this._scrollMask = new PIXI.Graphics();
        this._scrollMask.name = "GuiScrollerMask";
        this._content = new Scroller_1.Scroller(this);
        //promo panel #198, #155
        const verticalScrollConfig = {
            color: (scrollConfig === null || scrollConfig === void 0 ? void 0 : scrollConfig.color) || 0xffffff,
            thickness: (scrollConfig === null || scrollConfig === void 0 ? void 0 : scrollConfig.thickness) || 7.5
        };
        this._scrollBarVertical = new ScrollBar_1.ScrollBar(this, true, !fromPromoPanel, verticalScrollConfig);
        const horizontalScrollConfig = {
            color: (scrollConfig === null || scrollConfig === void 0 ? void 0 : scrollConfig.color) || 0xffffff,
            thickness: (scrollConfig === null || scrollConfig === void 0 ? void 0 : scrollConfig.thickness) || 5
        };
        this._scrollBarHorizontal = new ScrollBar_1.ScrollBar(this, false, true, horizontalScrollConfig);
        this._mouseScrollEvent = new MouseScroller_1.MouseScroller(this);
        this.addChild(this._scrollMask);
        this.addChild(this._content);
        this.addChild(this._scrollBarVertical);
        this.addChild(this._scrollBarHorizontal);
        this.mask = this._scrollMask;
        this.drawMask();
        this._scrollBarVertical.position.x = this._maskSize.width;
        this._scrollBarHorizontal.position.y = this._maskSize.height;
    }
    //Promo panel fixes 239,#267
    reAddMouseHoverListener() {
        this._mouseScrollEvent.reAddHoverListener();
    }
    //Set the new size of the scroll container.
    resize(width, height) {
        this._maskSize = { width: width, height: height };
        this.drawMask();
        this._scrollBarVertical.position.x = this._maskSize.width;
        this._scrollBarHorizontal.position.y = this._maskSize.height;
        this.updateContent();
    }
    /**
     * Add content to the scrollcontainer.
     * @param container
     */
    addContent(container) {
        this._content.addChild(container);
        this.updateContent();
    }
    removeContent(container) {
        this._content.removeChild(container);
        this.updateContent();
    }
    removeAllContent() {
        this._content.removeChildren();
        this.updateContent();
    }
    updateContent() {
        this.updateHitArea();
        this.checkNeedsScroll();
    }
    drawMask() {
        this._scrollMask.clear();
        this._scrollMask.beginFill(0xff0000);
        this._scrollMask.drawRect(0, 0, this._maskSize.width, this._maskSize.height);
        this._scrollMask.endFill();
    }
    checkNeedsScroll() {
        const contentLocalBounds = this._content.getLocalBounds();
        this._maskContentSizeDiff = new PIXI.Point(contentLocalBounds.right - this._maskSize.width, contentLocalBounds.bottom - this._maskSize.height);
        const hasScrollX = this._maskContentSizeDiff.x > 0;
        const hasScrollY = this._maskContentSizeDiff.y > 0;
        // #140 of nolimit-promo-panel
        this._scrollBarHorizontal.setBarScale(this._scrollMask.width, contentLocalBounds.right);
        this._scrollBarVertical.setBarScale(this._scrollMask.height, contentLocalBounds.bottom);
        //Setting to zero in case of size change and no scroll no longer needed.
        if (this._hasScroll.x != hasScrollX) {
            this.setScrollTarget(this, 0, undefined);
        }
        if (this._hasScroll.y != hasScrollY) {
            this.setScrollTarget(this, undefined, 0);
        }
        this._hasScroll.x = hasScrollX;
        this._hasScroll.y = hasScrollY;
        if (this._hasScroll.x) {
            this._scrollBarHorizontal.resize(this._scrollMask.width, contentLocalBounds.right);
        }
        if (this._hasScroll.y) {
            this._scrollBarVertical.resize(this._scrollMask.height, contentLocalBounds.bottom);
        }
        this._scrollBarHorizontal.enable(this._hasScroll.x && this._defaultAllowedDirections.x);
        this._scrollBarVertical.enable(this._hasScroll.y && this._defaultAllowedDirections.y);
        this._content.enable((this._hasScroll.x && this._defaultAllowedDirections.x) ||
            (this._hasScroll.y && this._defaultAllowedDirections.y));
        this._mouseScrollEvent.enable((this._hasScroll.x && this._defaultAllowedDirections.x) ||
            (this._hasScroll.y && this._defaultAllowedDirections.y));
    }
    updateHitArea() {
        this._content.hitArea = new PIXI.Rectangle(-this._content.x, -this._content.y, this._maskSize.width, this._maskSize.height);
    }
    clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }
    animate() {
        this._scrollTarget.x = this.clamp(this._scrollTarget.x, -Math.abs(this._maskContentSizeDiff.x), 0);
        this._scrollTarget.y = this.clamp(this._scrollTarget.y, -Math.abs(this._maskContentSizeDiff.y), 0);
        this._content.setScrollPosition(this._scrollTarget).eventCallback("onComplete", () => this.updateHitArea());
        this._scrollBarVertical.setScrollPosition(this._scrollTarget);
        this._scrollBarHorizontal.setScrollPosition(this._scrollTarget);
    }
    setActiveScroller(scroller) {
        if (this._activeScroller != scroller) {
            this._content.abort();
            this._directionAllowed.x = this._defaultAllowedDirections.x;
            this._directionAllowed.y = this._defaultAllowedDirections.y;
        }
        this._activeScroller = scroller;
        if (this._activeScroller == this._mouseScrollEvent) {
            this._directionAllowed.x = this._defaultAllowedDirections.x;
            this._directionAllowed.y = this._defaultAllowedDirections.y;
        }
    }
    checkAllowedDirections(xDelta, yDelta) {
        if (this._directionAllowed.x && this._directionAllowed.y) {
            if (Math.abs(yDelta) > Math.abs(xDelta)) {
                this._directionAllowed.y = true;
                this._directionAllowed.x = !this._hasScroll.y;
            }
            else {
                this._directionAllowed.y = !this._hasScroll.x;
                this._directionAllowed.x = true;
            }
        }
    }
}
exports.GUIScrollContainer = GUIScrollContainer;
//# sourceMappingURL=GUIScrollContainer.js.map