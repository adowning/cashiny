/**
 * Created by Jie Gao on 2018-11-09.
 */
import {IResizeData, StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {Helper} from "@nolimitcity/slot-game/bin/core/utils/Helper";
import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {Orientation} from "@nolimitcity/slot-game/bin/core/stage/Orientation";
import {MathHelper} from "@nolimitcity/slot-game/bin/core/utils/MathHelper";
import {MiniPayTable, miniPaytableSymbol} from "./MiniPayTable";
import {LeprechaunGameConfig} from "../../LeprechaunGameConfig";
import {GameSetting} from "@nolimitcity/slot-game/bin/core/setting/GameSetting";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {StageEvent} from "@nolimitcity/slot-game/bin/core/stage/event/StageEvent";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {UserAgent} from "@nolimitcity/slot-game/bin/core/useragent/UserAgent";

export class LandscapePaytable extends MiniPayTable {

    constructor(config:any) {
        super(config);
    }

    protected addEventListeners():void {
        super.addEventListeners();
        EventHandler.addEventListener(this, StageEvent.LEFT_HANDED_SETTING, (event:GameEvent) => this.onResizeContainer(event.params[0]));
    }

    protected onResize(data:IResizeData):void {
        super.onResize(data);
        const layer:PIXI.Container = StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.FOREGROUND.name);
        if(data.orientation === Orientation.PORTRAIT || (data.width - GameConfig.instance.REEL_AREA_WIDTH) * 0.5 < 234) {
            layer.removeChild(this);
            return;
        }
        layer.addChild(this);
        const width:number = GameConfig.instance.SYMBOL_WIDTH;
        const x0:number = Helper.getSymbolPositions(0, 0)[0];

        this._wrapper.scale.set(0.8,0.8);
        this._wrapper.x = -147;
        this._wrapper.y = 120;
        this._panel.y = -14;

        this._symbolSprites.forEach((symbolSprite:miniPaytableSymbol, i:number) => {
            symbolSprite.symbol.x = 80;
            symbolSprite.symbol.y = 32 + i * 99;
        });
    }

    protected onResizeContainer(data:IResizeData):void {
        if(!this._wrapper || !UserAgent.isMobile) {
            return;
        }
        const isIPad:boolean = data.width / data.height < 1.4;
        const width:number = GameConfig.instance.SYMBOL_WIDTH;
        const x0:number = Helper.getSymbolPositions(0, 0)[0];
        const x1:number = Helper.getSymbolPositions(2, 0)[0];
        this._wrapper.x = GameSetting.isLeftHanded ? (x1 + width) : (isIPad ? (x0 - width * 1.15):-147);
    };
}