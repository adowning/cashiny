/**
 * Created by Jie Gao on 28/01/19.
 */
import {BaseView} from "@nolimitcity/slot-game/bin/core/base/BaseView";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {IResizeData, StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {Helper} from "@nolimitcity/slot-game/bin/core/utils/Helper";
import {TimelineSprite} from "@nolimitcity/slot-game/bin/core/animation/TimelineSprite";
import {TimelineLite} from "gsap";
import {LeprechaunGameConfig} from "../LeprechaunGameConfig";

export class BonusWinEffect extends BaseView {
    private _layer:PIXI.Container;
    private _winStar:TimelineSprite;

    constructor() {
        super();
        this._layer = StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.HOTZONE.name);
    }

    protected initAnimations():void {
        this._winStar = new TimelineSprite(GameResources.getTextures("winSplash"));
        this._winStar.blendMode = PIXI.BLEND_MODES.ADD;
        this._winStar.hide();
        this._winStar.scale.set(4, 4);
        this._winStar.anchor.set(0.5, 0.5);
        this._layer.addChild(this._winStar);
    }

    protected onResize(data:IResizeData):void {
        this._winStar.position.set(Helper.getSymbolPositions(1, 1)[0], Helper.getSymbolPositions(1, 1)[1]);
    }

    public playAnimation():TimelineLite {
        const tl = new TimelineLite();
        tl.add(this._winStar.getAnimationAutoShowHide(true, true));
        return tl;
    }
}