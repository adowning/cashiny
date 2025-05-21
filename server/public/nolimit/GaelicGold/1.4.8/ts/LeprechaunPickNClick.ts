/**
 * Created by Jie Gao on 2019-01-22.
 */
import {BalanceEvent} from "@nolimitcity/slot-game/bin/core/balance/event/BalanceEvent";
import {BetLineEvent} from "@nolimitcity/slot-game/bin/core/betline/event/BetLineEvent";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {GameMode} from "@nolimitcity/slot-game/bin/core/gamemode/GameMode";
import {
    IPickAndClickConfig,
    PickAndClickController
} from "@nolimitcity/slot-game/bin/core/pickandclick/PickAndClickController";
import {ScreenEvent} from "@nolimitcity/slot-game/bin/core/screen/event/ScreenEvent";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {StageEvent} from "@nolimitcity/slot-game/bin/core/stage/event/StageEvent";
import {Logger} from "@nolimitcity/slot-launcher/bin/utils/Logger";
import {TimelineLite} from "gsap";
import {LeprechaunGameModuleConfig} from "../../LeprechaunGameModuleConfig";
import {LeprechaunSoundConfig} from "../../LeprechaunSoundConfig";
import {LeprechaunParsedGameData} from "../../server/data/LeprechaunParsedGameData";
import {LeprechaunParsedInitData} from "../../server/data/LeprechaunParsedInitData";
import {LeprechaunPickNClickScreen} from "./LeprechaunPickNClickScreen";
import {PncEvent} from "./PncEvent";

//number[]
export interface ICollectMeterData {
    value:number[];
    pickedNumber:number;
}

export interface ICollectMeterConfig {
    "EXTRA_LINES":ICollectMeterData;
    "EXTRA_MULTIPLIER":ICollectMeterData;
    "EXTRA_SPINS":ICollectMeterData;
}

export class LeprechaunPickNClick extends PickAndClickController {
    private _gameView:LeprechaunPickNClickScreen;
    private _isBigWin:boolean = false;
    private _thisRevealedPicked:string;
    private _totalPicked:number;
    private _pickedData:ICollectMeterConfig;
    private _nextMode:string;

    constructor(name:string, config:IPickAndClickConfig) {
        super(name, config, true);
        this._gameView = <LeprechaunPickNClickScreen>this._view;
    }

    protected addFeatureEventHandlers():void {
        EventHandler.addEventListener(this, PncEvent.LAST_PICK, (event:GameEvent) => this.finish());
    }

    protected parseFeatureGameData(data:LeprechaunParsedGameData):void {
        this._isBigWin = data.isBigWin;
        this._nextMode = data.nextMode;
        this._thisRevealedPicked = data.thisRevealedPicked;
        this._pickedData = data.pickedData;
        this._totalPicked = data.pickedExtraLines + data.pickedExtraMultiplier + data.pickedExtraSpins;
        if(!this._thisRevealedPicked && (this._totalPicked === 8)) {
            this._gameView.hideAllButtons();
            this.finish();
            return;
        }

        if(!data.pickedIndexesAfter || !this._thisRevealedPicked) {
            return;
        }
        const isSpins:boolean = this._thisRevealedPicked.indexOf("+") > -1;
        const lineName:string = (this._thisRevealedPicked.length === 1) ? "EXTRA_LINES" : (isSpins ? "EXTRA_SPINS" : "EXTRA_MULTIPLIER");
        this._gameView.updateAllButtons(data.pickedIndexesAfter);
        this._gameView.doCollectAnimation(this._thisRevealedPicked, (<any>this._pickedData)[lineName], data.playerSelection, data.pickedIndexesAfter, lineName, () => this.onShowComplete());

    }

    protected calculateIsTriggered(data:LeprechaunParsedGameData):boolean {
        this._totalPicked = data.pickedExtraLines + data.pickedExtraMultiplier + data.pickedExtraSpins;
        if(data.thisRevealedPicked === "START") {
            this._totalPicked = 0;
            this.finish();
        }
        return data.nextMode === "FREESPIN_PICKS" || (data.mode === "FREESPIN_PICKS" && this._totalPicked === 8 && (data.thisRevealedPicked !== "START"));
    }

    protected calculateIsRestoreTriggered(data:LeprechaunParsedInitData):boolean {
        this._nextMode = data.nextMode;
        return data.mode === "FREESPIN_PICKS";
    }

    protected parseButtonConfigs(data:LeprechaunParsedGameData):boolean[] {
        return data.pickedIndexesBefore;
    }

    protected onButtonClick(index:number):void {
        SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_STAR_PICK);
        this._view.enableButtons(false);
        Logger.logDev("Selected index - " + index);
        EventHandler.dispatchEvent(new GameEvent(BalanceEvent.PICK_AND_CLICK, index));
    }

    protected show(isRestoreSelected:boolean):void {
        if(this._isBigWin) {
            this._gameView.addDelayToStart();
        }
        this.hideKeypad();
        this._gameView.createContinueButtons(() => this.onCloseComplete());
        this._view.show(this._buttonConfigs!, this._serverData!, () => this.onShowComplete());

        EventHandler.dispatchEvent(new GameEvent(BetLineEvent.SET_ENABLED, false));
        EventHandler.dispatchEvent(new GameEvent(BetLineEvent.HIDE_ALL_BET_LINES));
        EventHandler.dispatchEvent(new GameEvent(StageEvent.WANT_RESIZE));

        // When restore in freespin, don't show the intro but we need the intro to init the freespin scene.
        if(this.doTransitions) {
            this.doTransitions();
        }
        this._gameView.resetDelay();
    }

    protected onCloseComplete():void {
        const tl:TimelineLite = new TimelineLite({paused : true});
        const updatePanelTl:TimelineLite = this._gameView.updateGamePanel();
        tl.add([
            () => {
                this.showKeypad();
                SlotGame.keypad.setZeroBetSpinCounter(5);
                LeprechaunGameModuleConfig.logo.showMultiplier(1);
            },
            updatePanelTl
        ]);
        tl.add(() => {
            this._gameView.removeView();
            Logger.logDev(`Close PickAndClick ${this.moduleName}`);
            this.reset();
            this.showKeypad();
            SlotGame.winFieldController.showWinField();
            this.dispatchCompleteEvent();
            EventHandler.dispatchEvent(new GameEvent(BetLineEvent.SET_ENABLED, true));
            EventHandler.dispatchEvent(new GameEvent(StageEvent.WANT_RESIZE));

            // This will turn off Autoplay if in restricted jurisdiction
            if(SlotGame.autoPlay.turnOffAutoplayOnBonus) {
                SlotGame.autoPlay.turnOffAutoplayOnBonus();
            }
        }, updatePanelTl.duration());
        tl.play();
    }

    protected playReplay():void {
        if(this._nextMode === GameMode.FREESPIN) {
            return;
        }
        this._view.clickButton(0, true);
    }

    protected dispatchCompleteEvent():void {
        EventHandler.dispatchEvent(new GameEvent(ScreenEvent.PICK_AND_CLICK_CLOSED, this._showWinPresentations));
    }

    protected finish():void {
        this._totalPicked = 0;
        this.close();
    }
}