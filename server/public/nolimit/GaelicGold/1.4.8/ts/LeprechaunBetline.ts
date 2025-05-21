/**
 * Created by Jie Gao on 2018-11-07.
 */
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {GameMode} from "@nolimitcity/slot-game/bin/core/gamemode/GameMode";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {IBetLineWinData, IBetWinData} from "@nolimitcity/slot-game/bin/core/server/data/IServerData";
import {ServerEvent} from "@nolimitcity/slot-game/bin/core/server/event/ServerEvent";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {Helper} from "@nolimitcity/slot-game/bin/core/utils/Helper";
import {MathHelper} from "@nolimitcity/slot-game/bin/core/utils/MathHelper";
import {IPolyBetLineConfig, PolyBetLine} from "@nolimitcity/slot-game/bin/game/betline/line/PolyBetLine";
import {TimelineSprite} from "@nolimitcity/slot-game/bin/core/animation/TimelineSprite";
import {Timeline, TimelineLite} from "gsap";
import {LeprechaunGameConfig} from "../LeprechaunGameConfig";
import {LeprechaunSoundConfig} from "../LeprechaunSoundConfig";
import {LeprechaunParsedGameData} from "../server/data/LeprechaunParsedGameData";
import {LeprechaunBetlineEvent} from "./LeprechaunBetlineEvent";
import BitmapText = PIXI.BitmapText;

export class LeprechaunBetline extends PolyBetLine {
    private _betlineData:IBetWinData[];
    private _toShow:boolean = false;
    private _winAmount:BitmapText;
    private _winMultiplier:BitmapText;
    private _rainbowLine:TimelineSprite;
    private _y:number[] = [340, 195, 485, 340, 340, 314, 374, 536, 166];

    constructor(index:number, numberPosition:number[], betLineData:number[], config:IPolyBetLineConfig) {
        super(index, numberPosition, betLineData, config);
        this.addMultiplierEventListeners();
        this._winAmount = new BitmapText(this.index.toString(), {
            fontName : "NumbersWinCountUp",
            fontSize : 20
        });

        this._winMultiplier = new BitmapText("0", {
            fontName : "NumbersWinMultiplier",
            fontSize : 14
        });
        this._winAmount.visible = false;
        this._winMultiplier.visible = false;
        this.addChild(this._winAmount);
        this.addChild(this._winMultiplier);
        this._winAmount.x = LeprechaunGameConfig.instance.GAME_WIDTH / 2;
        this._winAmount.y = this._y[index - 1] - 2;
        this._winMultiplier.x = LeprechaunGameConfig.instance.GAME_WIDTH / 2;
        this._winMultiplier.y = this._y[index - 1] - 10;
        this.addFeatureEventListeners();
    }

    private addFeatureEventListeners():void {
        EventHandler.addEventListener(this, LeprechaunBetlineEvent.SHOW_WIN_BET_LINE_WINS, (event:GameEvent) => this.onShowWinBetLineWin(event.params[0]));
    }

    private addMultiplierEventListeners():void {
        EventHandler.addEventListener(this, ServerEvent.GAME_DATA_PARSED, (event:GameEvent) => this.parsedGameData(event.params[0]));
    }

    private parsedGameData(data:LeprechaunParsedGameData):void {
        this._betlineData = data.betWins;
        this._toShow = false;
        if(this.index < 6) {
            this._toShow = true;
        } else {
            if(data.mode === GameMode.FREESPIN && this.index <= (5 + data.pickedExtraLines * 2)) {
                this._toShow = true;
                if(data.nextMode === GameMode.NORMAL && data.singleWin <= 0) {
                    this._toShow = false;
                }
            }
        }
    }

    private onShowWinBetLineWin(index:number):void {
        if(index !== this.index) {
            return;
        }

        this.showWin(true);
    }

    protected showStatic():void {
        if(!this._toShow) {
            return;
        }
        this.showWin(false);
    }

    protected draw(numberPosition:number[], betLineData:number[], config:IPolyBetLineConfig):void {
        const extraLineScale:number[] = [-1, 1, -1, 1];
        if(this.index > 5) {
            const rainbowLine:TimelineSprite = new TimelineSprite(GameResources.getTextures("rainbowBetLine"));
            rainbowLine.blendMode = PIXI.BLEND_MODES.ADD;
            rainbowLine.anchor.set(0, 0.5);
            rainbowLine.scale.set(1, extraLineScale[this.index - 6]);
            rainbowLine.x = 0;
            rainbowLine.y = ((((this.index % 3) === 0) ? 124 : 385) + LeprechaunGameConfig.instance.REEL_AREA_POS_Y);
            rainbowLine.hide();
            this._rainbowLine = rainbowLine;
            this.addChild(rainbowLine);
            StageManager.getLayer(config.staticLineLayer).addChild(this);
        } else {
            const line:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures("betline_" + this.index)[0]);
            line.anchor.set(0, 0);
            line.x = -34;
            line.y = 36;
            this.addChild(line);
            StageManager.getLayer(config.staticLineLayer).addChild(this);
            this.alpha = 0;
        }

    }

    public animateShow():Timeline {
        if(this.index > 5 && this._rainbowLine) {
            this.alpha = 1;
            return new TimelineLite().add([
                () => {SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.RAINBOW_LINES[this.index % 2]);},
                this._rainbowLine.getAnimationAutoShowHide(true, true)
            ]);
        }
        return new TimelineLite();
    }

    protected showWin(withWinAmount:boolean = false):void {
        if(this.index > 5 && this._rainbowLine) {
            this.alpha = 1;
            this._rainbowLine.getAnimationAutoShowHide(true, false);
        } else {
            super.showWin();
        }

        const id:number = this.index;
        this._winAmount.visible = false;
        this._winMultiplier.visible = false;
        if(!withWinAmount) {
            return;
        }
        (<IBetLineWinData[]>this._betlineData).forEach((data:IBetLineWinData) => {
            if(data.betLineIndex === (id - 1)) {
                this._winAmount.visible = true;
                this._winAmount.text = (data.amount.toFixed(2)).toString();
                this._winAmount.scale.set(1, 1);
                if(this._winAmount.width > 550) {
                    const scale:number = MathHelper.roundToDecimals(550 / this._winAmount.width, 2);
                    this._winAmount.scale.set(scale, scale);
                }
                this._winAmount.x = Helper.getSymbolPositions(1, 1)[0] - this._winAmount.width / 2;
                if(data.multiplier > 1) {
                    this._winAmount.x = Helper.getSymbolPositions(1, 1)[0] - this._winAmount.width;
                    this._winMultiplier.visible = true;
                    this._winMultiplier.text = (" X" + data.multiplier).toString();
                    this._winMultiplier.x = Helper.getSymbolPositions(1, 1)[0];
                } else {
                    this._winMultiplier.visible = false;
                    this._winMultiplier.text = "";
                }
                this._winAmount.x = Helper.getSymbolPositions(1, 1)[0] - (this._winAmount.width + this._winMultiplier.width) / 2;
                this._winMultiplier.x = this._winAmount.x + this._winAmount.width;
            }
        });
    }

    protected hideAll():void {
        if(!(this.index > 5 && this._rainbowLine)) {
            super.hideAll();
        }
        this._winAmount.visible = false;
        this._winMultiplier.visible = false;
    }
}