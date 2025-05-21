/**
 * Created by Jie Gao on 2019-02-12.
 */
import {BaseView} from "@nolimitcity/slot-game/bin/core/base/BaseView";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {GameMode} from "@nolimitcity/slot-game/bin/core/gamemode/GameMode";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {ScreenEvent} from "@nolimitcity/slot-game/bin/core/screen/event/ScreenEvent";
import {ServerEvent} from "@nolimitcity/slot-game/bin/core/server/event/ServerEvent";
import {IResizeData, StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {Helper} from "@nolimitcity/slot-game/bin/core/utils/Helper";
import {TimelineSprite} from "@nolimitcity/slot-game/bin/core/animation/TimelineSprite";
import {FontWeight} from "@nolimitcity/slot-launcher/bin/loader/font/FontStatics";
import {TimelineLite, TweenLite, TweenMax} from "gsap";
import {LeprechaunBetlineEvent} from "../betline/LeprechaunBetlineEvent";
import {LeprechaunGameAssets} from "../LeprechaunGameAssets";
import {LeprechaunGameConfig} from "../LeprechaunGameConfig";
import {LeprechaunParsedInitData} from "../server/data/LeprechaunParsedInitData";

export class Logo extends BaseView {

    private _logo:PIXI.Sprite;
    private _multiplierBg:PIXI.Sprite;
    private _multiplier:PIXI.Text;
    private _isRestore:boolean;
    private _isFreespin:boolean;
    private _pickedExtraMultiplier:number = 0;
    private _multiplierHighlightAnim:TimelineSprite;

    constructor() {
        super();
    }

    protected addEventListeners():void {
        EventHandler.addEventListener(this, ServerEvent.INIT_DATA_PARSED, (event:GameEvent) => this.parsedInitData(event.params[0]));
        EventHandler.addEventListener(this, LeprechaunBetlineEvent.HIDE_RAINBOW_NUMBER, (event:GameEvent) => this.hideMultiplier());
        EventHandler.addEventListener(this, ScreenEvent.GAME_READY, (event:GameEvent) => this.onGameReady());
    }


    private parsedInitData(data:LeprechaunParsedInitData):void {
        if(data.mode === GameMode.FREESPIN && data.isRestoreState) {
            this._pickedExtraMultiplier = data.freespinMultiplier;
            this._isRestore = true;
        }
    }

    public onGameReady():void {
        if(this._isRestore) {
            this._isRestore = false;
            this._isFreespin = true;
            this._multiplierBg.alpha = 1;
            this._multiplierBg.position.set(Helper.getSymbolPositions(2, 0)[0], this.getPosY() - 44);
            this._multiplierBg.scale.set(1, 1);
            this._multiplier.text = "x" + this._pickedExtraMultiplier.toString();
            this._logo.position.set(GameConfig.instance.REEL_AREA_POS_X + 60, this.getPosY());
        }
    }

    protected initAnimations():void {
        const logo:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures(LeprechaunGameAssets.INTRO_LOGO)[0]);
        logo.scale.set(0.6, 0.6);
        logo.anchor.set(0, 1);
        StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.LOGO.name).addChild(logo);
        this._logo = logo;

        const multiplierBg:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures("multiplierClover")[0]);
        multiplierBg.anchor.set(0.5, 0.5);
        StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.LOGO.name).addChild(multiplierBg);
        this._multiplierBg = multiplierBg;

        const multiplierHighlightAnim:TimelineSprite = new TimelineSprite(GameResources.getTextures("winStar"));
        multiplierHighlightAnim.anchor.set(0.5, 0.5);
        multiplierHighlightAnim.scale.set(0.5, 0.5);
        multiplierHighlightAnim.blendMode = PIXI.BLEND_MODES.ADD;
        multiplierHighlightAnim.hide();

        const multiplier:PIXI.Text = new PIXI.Text("", {
            fontWeight : FontWeight.EXTRA_BOLD,
            fontFamily : "Open Sans",
            fontSize : 32,
            dropShadow : true,
            dropShadowAngle : 89.5,
            dropShadowBlur : 2,
            dropShadowColor : "#2d6916",
            dropShadowDistance : 4,
            fill : "#fffdec"
        });
        multiplier.anchor.set(0.5, 0.5);
        multiplier.position.set(0, 0);
        multiplierBg.addChild(multiplier);
        multiplierBg.addChild(multiplierHighlightAnim);
        this._multiplier = multiplier;
        this._multiplierHighlightAnim = multiplierHighlightAnim;
        this._multiplierBg.alpha = 0;
    }

    public showMultiplier(multiplier:number):void {
        this._isFreespin = true;
        this._multiplierBg.alpha = 0;
        this._multiplierBg.position.set(Helper.getSymbolPositions(2, 0)[0], this.getPosY() - 44);
        this._multiplierBg.scale.set(3, 3);
        this._multiplier.text = "x" + multiplier.toString();
        this._logo.position.set(GameConfig.instance.REEL_AREA_POS_X + 60, this.getPosY());
        const tl:TimelineLite = new TimelineLite();
        tl.add([
            TweenLite.to(this._multiplierBg, 0.1, {alpha : 1}),
            TweenLite.to(this._multiplierBg.scale, 0.5, {x : 1, y : 1})
        ]);
    }

    private hideMultiplier():void {
        this._isFreespin = false;
        this._logo.position.set(Helper.getSymbolPositions(1, 0)[0] - this._logo.width * 0.5, this.getPosY());
        TweenLite.to(this._multiplierBg.scale, 0.17, {x : 0.8, y : 0.8});
        TweenLite.to(this._multiplierBg, 0.1, {alpha : 0});
    }

    protected onResize(data:IResizeData):void {
        const x1:number = Helper.getSymbolPositions(1, 0)[0];
        const x2:number = Helper.getSymbolPositions(2, 0)[0];
        this._logo.position.set(this._isFreespin ? (GameConfig.instance.REEL_AREA_POS_X + 60) : (x1 - this._logo.width * 0.5), this.getPosY());
        this._multiplierBg.position.set(x2, this.getPosY() - 44);
    }

    private getPosY():number {
        return GameConfig.instance.REEL_AREA_POS_Y;
    }

    public playMultiplierAnimation():void {
        TweenMax.fromTo(this._multiplierBg.scale, 0.1, {
            x : 1,
            y : 1
        }, {
            x : 1.3,
            y : 1.3,
            yoyo : true,
            repeat : 1
        });
        this._multiplierHighlightAnim.getAnimationAutoShowHide(true, true);
    }
}