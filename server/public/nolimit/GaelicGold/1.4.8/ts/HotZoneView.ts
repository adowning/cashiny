/**
 * Created by Jie Gao on 2018-11-02.
 */
import {BaseView} from "@nolimitcity/slot-game/bin/core/base/BaseView";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {IResizeData, StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {Helper} from "@nolimitcity/slot-game/bin/core/utils/Helper";
import {TimelineSprite} from "@nolimitcity/slot-game/bin/core/animation/TimelineSprite";
import {TimelineLite, TweenLite} from "gsap";
import {LeprechaunGameConfig} from "../LeprechaunGameConfig";

export class HotZoneView extends BaseView {
    private _layer:PIXI.Container;
    private _hotZoneStar:TimelineSprite;
    private _hotZoneWinStar:TimelineSprite;
    private _tl:TimelineLite;

    constructor() {
        super();
        this._layer = StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.HOTZONE.name);
    }

    protected initAnimations():void {
        this._hotZoneStar = new TimelineSprite(GameResources.getTextures("hotZone"));
        this._hotZoneStar.blendMode = PIXI.BLEND_MODES.ADD;
        this._hotZoneStar.alpha = 0.6;
        this._hotZoneStar.hide();
        this._hotZoneStar.anchor.set(0.5, 0.5);
        this._hotZoneStar.position.set(Helper.getSymbolPositions(1, 1)[0], Helper.getSymbolPositions(1, 1)[1]);
        this._layer.addChild(this._hotZoneStar);

        this._hotZoneWinStar = new TimelineSprite(GameResources.getTextures("hotZoneWin"));
        this._hotZoneWinStar.blendMode = PIXI.BLEND_MODES.ADD;
        this._hotZoneWinStar.hide();
        this._hotZoneWinStar.anchor.set(0.5, 0.5);
        this._hotZoneWinStar.position.set(Helper.getSymbolPositions(1, 1)[0], Helper.getSymbolPositions(1, 1)[1]);
        this._layer.addChild(this._hotZoneWinStar);
    }

    protected onResize(data:IResizeData):void {
        this._hotZoneStar.position.set(Helper.getSymbolPositions(1, 1)[0], Helper.getSymbolPositions(1, 1)[1]);
    }

    public show():void {
        const tl = new TimelineLite();

        tl.add([
            this._hotZoneStar.getAnimationAutoShowHide(true, true),
            TweenLite.fromTo(this._hotZoneStar, 0.5, {alpha : 0}, {alpha : 0.6})
        ])
    }

    public hide(fastStop:boolean):void {
        const tl = new TimelineLite();

        tl.add([
            TweenLite.fromTo(this._hotZoneStar, fastStop ? 0 : 0.3, {alpha : 0.6}, {alpha : 0}),
            () => {
                this._hotZoneStar.hide();
            }]);
    }

    public stopHotZoneWinStar():void {
        this._hotZoneWinStar.stopLoop();
        this._hotZoneWinStar.hide();
    }

    public playHotZoneWinStar():void {
        const tl = new TimelineLite();

        tl.add([
            () => {
                this.hide(true);
                this._hotZoneWinStar.show();
                this._hotZoneWinStar.playLoop();
            },
            TweenLite.fromTo(this._hotZoneWinStar, 0.2, {alpha : 0}, {alpha : 1})
        ])
    }
}