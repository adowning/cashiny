/**
 * Created by Jie Gao on 2018-11-08.
 */
import {BaseView} from "@nolimitcity/slot-game/bin/core/base/BaseView";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {ReelEvent} from "@nolimitcity/slot-game/bin/core/reel/event/ReelEvent";
import {IReelStoppedData} from "@nolimitcity/slot-game/bin/core/reel/reel/ReelController";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {ServerEvent} from "@nolimitcity/slot-game/bin/core/server/event/ServerEvent";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {SpinEvent} from "@nolimitcity/slot-game/bin/core/spin/event/SpinEvent";
import {StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {ArrayHelper} from "@nolimitcity/slot-game/bin/core/utils/ArrayHelper";
import {Helper} from "@nolimitcity/slot-game/bin/core/utils/Helper";
import {SpinReelEvent} from "@nolimitcity/slot-game/bin/game/reel/spinreel/SpinReelEvent";
import {TimelineSprite} from "@nolimitcity/slot-game/bin/core/animation/TimelineSprite";
import {TimelineLite, TweenLite} from "gsap";
import {LeprechaunGameConfig} from "../LeprechaunGameConfig";
import {LeprechaunSoundConfig} from "../LeprechaunSoundConfig";
import {LeprechaunParsedGameData} from "../server/data/LeprechaunParsedGameData";

export class NearWinBackground extends BaseView {

    private _layer:PIXI.Container;
    private _bonusFeatureTriggered:boolean = false;
    private _activeReelId:number;
    private _nearWinBGs:TimelineSprite[];

    constructor() {
        super();
        this._layer = StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.FOREGROUND.name);
    }

    protected addEventListeners():void {
        EventHandler.addEventListener(this, SpinEvent.BEFORE_START, (event:GameEvent) => this.onSpinStart());
        EventHandler.addEventListener(this, ServerEvent.GAME_DATA_PARSED, (event:GameEvent) => this.onGameDataParsed(event.params[0]));
        EventHandler.addEventListener(this, SpinReelEvent.REEL_ON_NEAR_WIN, (event:GameEvent) => this.onPlayReelNearWinAttention(event.params[0]));
        EventHandler.addEventListener(this, ReelEvent.REEL_STOP_SPIN_ANIMATION_COMPLETE, (event:GameEvent) => this.onReelSpinAnimationComplete(event.params[0]));
    };

    protected initAnimations():void {
        this._nearWinBGs = ArrayHelper.initArrayWithValues(3, (i:number) => {return this.createBG(i);});
        this._layer.addChild(this);
    }

    private onGameDataParsed(data:LeprechaunParsedGameData):void {
        this._bonusFeatureTriggered = data.bonusFeatureTriggered;
    }

    private createBG(i:number):TimelineSprite {
        const bg:TimelineSprite = new TimelineSprite(GameResources.getTextures("reelExcitement"));
        bg.blendMode = PIXI.BLEND_MODES.ADD;
        bg.hide();
        bg.anchor.set(0.5, 0.5);
        bg.position.set(Helper.getSymbolPositions(i, 1)[0], Helper.getSymbolPositions(i, 1)[1] + 20);
        this.addChild(bg);
        return bg;
    }

    private onSpinStart():void {
        this._activeReelId = -1;
    }

    private onPlayReelNearWinAttention(reelId:number):void {
        this._activeReelId = reelId;
        this._nearWinBGs[reelId].alpha = 1;
        this._nearWinBGs[reelId].show();
        this._nearWinBGs[reelId].playLoop();
        SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.ANTICIPATION);
    }

    private onReelSpinAnimationComplete(stopData:IReelStoppedData):void {
        if(stopData.reelId != this._activeReelId) {
            return;
        }
        this._nearWinBGs.forEach((bg:TimelineSprite, i:number) => {
                bg.hide();
                bg.stopLoop();
        });
    }

    public hide(reel:number):void {
        const timeline:TimelineLite = new TimelineLite();
        timeline.add([
            TweenLite.to(this._nearWinBGs[reel], 0.3, {alpha : 0}),
            () => {
                this._nearWinBGs[reel].hide();
                this._nearWinBGs[reel].stopLoop();
            }
        ])
    }
}