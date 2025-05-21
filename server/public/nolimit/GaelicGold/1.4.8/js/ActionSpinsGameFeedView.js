"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionSpinsGameFeedView = void 0;
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const PromoPanelAssetConfig_1 = require("../../../config/PromoPanelAssetConfig");
const TopBar_1 = require("./components/TopBar");
const GUIScrollContainer_1 = require("@nolimitcity/slot-launcher/bin/gui/scroll/GUIScrollContainer");
const SortControls_1 = require("./components/SortControls");
const gsap_1 = require("gsap");
const SimpleLabelButton_1 = require("./components/SimpleLabelButton");
const PromoPanelTextStyles_1 = require("../../../config/PromoPanelTextStyles");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const GuiUtils_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiUtils");
const Helper_1 = require("../../../utils/Helper");
/**
 * Created by jonas on 2023-09-15.
 */
class ActionSpinsGameFeedView extends PIXI.Container {
    constructor() {
        super();
        this.currentlyVisible = 50;
        this._replayRounds = [];
        this._itemSpacing = 10;
        this._background = new PIXI.NineSlicePlane(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_REPLAY_FEED_BG), 30, 30, 30, 36);
        this._background.name = "_background";
        this._background.width = 692;
        this._background.height = 664;
        this._topInfoBar = new TopBar_1.TopBar();
        this._topInfoBar.pivot.set(this._topInfoBar.width * 0.5, this._topInfoBar.height * 0.5);
        this._topInfoBar.position.set(this._background.width * 0.5, 14);
        this._sortControls = new SortControls_1.SortControls((sortByWin) => this.sort(sortByWin));
        this._sortControls.position.set(66, 55);
        const onColors = new PointerStateColorSet_1.PointerStateColorSet(GuiUtils_1.GuiUtils.getARGB(0x000000, 1));
        this._loadMoreButton = new SimpleLabelButton_1.SimpleLabelButton("loadmore", Helper_1.Helper.translate("Load more"), PromoPanelTextStyles_1.PromoPanelTextStyles.ROUND_INFO_DATE_TEXT, onColors);
        this._loadMoreButton.resizeButtonToLabelWithMargin(5, 15, 5, 15);
        this._loadMoreButton.pivot.set(this._loadMoreButton.width * 0.5, 0);
        this._loadMoreButton.addClickCallback(() => {
            if (this._loadMoreCallback != undefined) {
                this._scroll.removeContent(this._loadMoreButton);
                this._loadMoreCallback();
            }
        });
        this._loadMoreButton.enable(true);
        const scrollConfig = {
            color: 0xfec20d,
            thickness: 3
        };
        this._scroll = new GUIScrollContainer_1.GUIScrollContainer(660, this._background.height - 72, false, true, true, scrollConfig);
        this._scroll.position.set(17, 80);
        this._scrollContent = new PIXI.Container();
        this._scroll.addContent(this._scrollContent);
        this.addChild(this._background, this._scroll, this._topInfoBar, this._sortControls);
    }
    orientationChanged() {
        this._scroll.setScrollDelta(this._scroll, 0, 0);
    }
    resize(maxHeight) {
        this._background.height = maxHeight;
        this._scroll.resize(660, this._background.height - 111);
        this._topInfoBar.resize();
    }
    sort(byWin) {
        if (byWin) {
            this._replayRounds.sort((a, b) => {
                return a.winText.latestValue - b.winText.latestValue;
            });
        }
        else {
            this._replayRounds.sort((a, b) => {
                return a.roundNo - b.roundNo;
            });
        }
        this._sortControls.update(byWin);
        this.updateRoundPositions();
        this._scroll.setScrollDelta(this._scroll, 0, this._scroll.height); //Move page to top
        this._scroll.updateContent();
    }
    addRoundData(data) {
        this._replayRounds.push(data);
    }
    getLastRoundData() {
        return this._replayRounds[this._replayRounds.length - 1];
    }
    removeAllItems() {
        this._replayRounds = [];
        this._scrollContent.removeChildren();
        this._scroll.updateContent();
    }
    enableInteraction(enable) {
        if (enable == this.interactionEnabled) {
            return;
        }
        if (enable) {
            this.enableInteractionAllRounds();
            this.interactionEnabled = true;
        }
        else {
            this.interactionEnabled = false;
            this.collapseAll();
            this.sort(false);
            if (this._loadMoreButton.parent != undefined) {
                this._loadMoreButton.parent.removeChild(this._loadMoreButton);
            }
        }
        this.updateRoundPositions();
        this._scroll.updateContent();
        this._sortControls.enable(enable);
        this.enableScroll(enable);
        const targetAlpha = enable ? 1 : 0.6;
        gsap_1.TweenMax.to(this._background, 0.2, { alpha: targetAlpha });
    }
    enableScroll(value) {
        this._scroll.scrollEnabled = value;
    }
    addLoadMoreButton(yPos, callback) {
        if (!this._loadMoreButton.parent) {
            this._loadMoreCallback = callback;
            this._scroll.addContent(this._loadMoreButton);
        }
        this._loadMoreButton.position.set(this._background.width * 0.5, yPos);
    }
    updateRoundPositions(animate = false, visible = 50) {
        const tl = new gsap_1.TimelineLite();
        const updateCount = this._replayRounds.length - 1;
        const animationCutOff = updateCount - 16;
        const visibleCutOff = updateCount - visible;
        this.currentlyVisible = visible;
        let yAdvance = 0;
        for (let i = updateCount; i >= 0; i--) {
            const replayView = this._replayRounds[i];
            if (i > visibleCutOff) {
                if (replayView.parent == undefined) {
                    this._scrollContent.addChild(replayView);
                }
                if (animate && i > animationCutOff) {
                    tl.to(replayView, 0.2, { y: yAdvance }, 0);
                }
                else {
                    replayView.position.y = yAdvance;
                }
                yAdvance += replayView.targetHeight + this._itemSpacing;
            }
            else {
                this._scrollContent.removeChild(replayView);
                if (this.interactionEnabled) {
                    this.addLoadMoreButton(yAdvance, () => {
                        this.loadMoreRounds(visible);
                        this._scroll.updateContent();
                    });
                }
            }
        }
        return tl;
    }
    enableInteractionAllRounds() {
        //TODO - optimize
        this._replayRounds.forEach((replayView) => {
            replayView.enableInteraction(true);
        });
    }
    collapseAll() {
        //TODO - optimize
        this._replayRounds.forEach((replayView) => {
            replayView.enableInteraction(false);
            replayView.isFS && replayView.collapseRound();
        });
    }
    loadMoreRounds(currentVisible) {
        this.updateRoundPositions(false, currentVisible + 20);
    }
}
exports.ActionSpinsGameFeedView = ActionSpinsGameFeedView;
//# sourceMappingURL=ActionSpinsGameFeedView.js.map