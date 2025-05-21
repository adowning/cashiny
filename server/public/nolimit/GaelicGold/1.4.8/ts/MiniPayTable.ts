/**
 * Created by Jie Gao on 2018-11-09.
 */
import {BaseView} from "@nolimitcity/slot-game/bin/core/base/BaseView";
import {IResizeData} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {ArrayHelper} from "@nolimitcity/slot-game/bin/core/utils/ArrayHelper";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {ServerEvent} from "@nolimitcity/slot-game/bin/core/server/event/ServerEvent";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {LeprechaunParsedInitData} from "../../server/data/LeprechaunParsedInitData";
import {ISymbolValues} from "@nolimitcity/slot-game/bin/core/server/data/IServerData";
import {BalanceEvent} from "@nolimitcity/slot-game/bin/core/balance/event/BalanceEvent";
import {MathHelper} from "@nolimitcity/slot-game/bin/core/utils/MathHelper";
import {ScreenEvent} from "@nolimitcity/slot-game/bin/core/screen/event/ScreenEvent";
import {Orientation} from "@nolimitcity/slot-game/bin/core/stage/Orientation";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {LeprechaunGameAssets} from "../../LeprechaunGameAssets";

export interface miniPaytableSymbol {
    symbol:PIXI.Sprite;
    text:PIXI.Text;
}

export class MiniPayTable extends BaseView {
    protected _panel:PIXI.Sprite;
    protected _symbolSprites:miniPaytableSymbol[] = [];
    protected _wrapper:PIXI.Sprite;
    protected _config:any;
    protected _symbolValues:ISymbolValues;
    protected _currentBet:number;
    private _xOffset:number = 0;
    private _hasParsedInitData:boolean = false;

    constructor(config:any) {
        super();
        this._config = config;
    }

    protected addEventListeners():void {
        EventHandler.addEventListener(this, BalanceEvent.CURRENT_BET, (event:GameEvent) => this.onChangeBet(event.params[0]));
        EventHandler.addEventListener(this, ServerEvent.INIT_DATA_PARSED, (event:GameEvent) => this.onInitGameDataParsed(event.params[0]));
        EventHandler.addEventListener(this, ScreenEvent.GAME_READY, (event:GameEvent) => this.update());
    }

    private onInitGameDataParsed(data:LeprechaunParsedInitData):void {
        this._hasParsedInitData = true;
        this._symbolValues = data.symbolValues;
    }

    public update():void {
        if(!this._hasParsedInitData) {
            return;
        }

        this._symbolSprites.forEach((symbolSprite:miniPaytableSymbol, i:number) => {
            const coinValue:number = this._symbolValues[this._config.values[i]][3];
            const payoutValue:number = (coinValue * MathHelper.roundToDecimals(this._currentBet / 5, 2));
            symbolSprite.text.text = (payoutValue.toFixed((payoutValue>=10 && Number.isInteger(payoutValue))?0:2)).toString();
            //symbolSprite.text.x = this._xOffset;
        });
    }

    protected onChangeBet(bet:string):void {
        this._currentBet = parseFloat(bet);
        this.update();
    }

    protected initAnimations():void {
        this._wrapper = new PIXI.Sprite();
        this._panel = new PIXI.Sprite(GameResources.getTextures(LeprechaunGameAssets.MINI_PAYTABLE_PORTRAIT)[0]);
        this._panel.blendMode = PIXI.BLEND_MODES.MULTIPLY;
        this._panel.anchor.set(0);
        this._panel.position.set(0, 0);
        this._wrapper.addChild(this._panel);
        this.addChild(this._wrapper);
        this._symbolSprites = ArrayHelper.initArrayWithValues(this._config.symbols.length, (i:number) => {return this.createSymbolContainer(i);});
    }

    protected createSymbolContainer(i:number):miniPaytableSymbol {
        const sprite:PIXI.Sprite = new PIXI.Sprite();
        const symbol:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures("miniPayTable" + this._config.symbols[i])[0]);
        symbol.scale.set(0.35, 0.35);
        symbol.anchor.set(0.5, 0.5);
        const coinValue:number = 10;
        const text:PIXI.Text = new PIXI.Text(((coinValue * MathHelper.roundToDecimals(this._currentBet / 5, 2)).toFixed(2)).toString(), this._config.textStyle);
        text.anchor.set(0.5, 0);
        text.position.set(0, symbol.height / 2);
        symbol.position.set(0, symbol.height / 2 - text.height);
        sprite.addChild(text);
        sprite.addChild(symbol);
        this._wrapper.addChild(sprite);
        return {
            symbol : sprite,
            text : text
        };
    };

    protected onResize(data:IResizeData):void {
        this._panel.texture = GameResources.getTextures((data.orientation === Orientation.PORTRAIT) ? LeprechaunGameAssets.MINI_PAYTABLE_PORTRAIT : LeprechaunGameAssets.MINI_PAYTABLE_LANSCAPE)[0];
        this._xOffset = (data.orientation === Orientation.PORTRAIT) ? 0 : 80;
        this.update();
    };
}