import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {ServerEvent} from "@nolimitcity/slot-game/bin/core/server/event/ServerEvent";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {APIFeatureBetEventData} from "@nolimitcity/slot-launcher/bin/interfaces/APIBetEventData";
import {APIEvent} from "@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem";
import {Logger} from "@nolimitcity/slot-launcher/bin/utils/Logger";
import {Leprechaun} from "../Leprechaun";
import {LeprechaunParsedInitData} from "./data/LeprechaunParsedInitData";
import {LeprechaunParsedGameData} from "./data/LeprechaunParsedGameData";

export class FeaturePrice {
    private _initData: LeprechaunParsedInitData;
    private _gameData: LeprechaunParsedGameData;


    constructor() {
        this.addEventListeners();
    }

    public getBuyFeaturePrice(playedBetValue?: number, wasFeatureBuy?: boolean): number {
        const activeFeature = Leprechaun.api.betFeatureController.getActiveBetFeature();
        if (activeFeature){
            return activeFeature.getTotalCost();
        } else {
            const betLevel: string = Leprechaun.api.freeBets.hasFreeBets() ? Leprechaun.api.freeBets.getBet() : Leprechaun.api.betLevel.getLevel();
            let price: number = playedBetValue ? playedBetValue : Leprechaun.model.gameData?.playedBetValue || parseFloat(betLevel);
            return price;
        }
    }

    public isWinBelowStake(): boolean {
        return Leprechaun.api.gameClientConfiguration.belowStakeWinRestriction && (this.getAccumulatedRoundWin() <= this.getBuyFeaturePrice());
    }

    protected addEventListeners(): void {
        EventHandler.addEventListener(this, ServerEvent.GAME_DATA_PARSED, (event: GameEvent) => this.onGameDataParsed(event.params[0]));
        EventHandler.addEventListener(this, ServerEvent.INIT_DATA_PARSED, (event: GameEvent) => this.onInitDataParsed(event.params[0]));
    }

    private onGameDataParsed(data: LeprechaunParsedGameData): void {
        this._gameData = data;
    }

    private onInitDataParsed(data: LeprechaunParsedInitData): void {
        this._initData = data;
    }

    private getAccumulatedRoundWin(): number {
        return +(this._gameData?.accumulatedRoundWin || this._initData.accumulatedRoundWin);
    }
}