import {Helper} from "@nolimitcity/promo-panel/bin/utils/Helper";
import {ASBonusPickOptions, WINTYPE} from "@nolimitcity/promo-panel/bin/enums/ASEnums";
import {
    ActionSpinOptions,
    ActionSpinSound,
    ASWinData,
    IResponseData,
    PromoPanelGameConfiguration,
} from "@nolimitcity/promo-panel/bin/interfaces/ASInterfaces";
import {Leprechaun} from "./Leprechaun";
import {LeprechaunGameAssets} from "./LeprechaunGameAssets";
import {LeprechaunSoundConfig} from "./LeprechaunSoundConfig";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {ILeprechaunGameData} from "./server/ILeprechaunServerData";
import {LeprechaunGameModuleConfig} from "./LeprechaunGameModuleConfig";
import {LeprechaunGameMode} from "./gamemode/LeprechaunGameMode";
import {GameMode} from "@nolimitcity/slot-game/bin/core/gamemode/GameMode";
import {MathHelper} from "@nolimitcity/slot-game/bin/core/utils/MathHelper";

export class GaelicGoldPromoPanelConfig implements PromoPanelGameConfiguration {

    constructor() {
    }



    public getActionSpinOptions(): ActionSpinOptions {
        return {
            gameName: "GaelicGold",
            hasActionSpin: true,
            graphics: {backgroundTextureName: LeprechaunGameAssets.MAIN_GAME_BACKGROUND},
            automaticPickGame: {
                header: () => Leprechaun.api.translations.translate("Note: Features will be auto-selected during bonus trigger."),
                optionSelection: (response: any) => {
                    let nonPickedIndecies = [];
                    for (let i:number = 0; i < response.pickedIndexesAfter.length; i++){
                        if (response.pickedIndexesAfter[i] == false){
                            nonPickedIndecies.push(i);
                        }
                    }
                    nonPickedIndecies = MathHelper.shuffleArray(nonPickedIndecies);
                    return nonPickedIndecies[0];
                },
                type: ASBonusPickOptions.PICK_MODE,
                pickNeededForModes: [LeprechaunGameMode.FS_PICK],
                pickNeededForBuyFeatures: []
            },
            getParsedData: (response: ILeprechaunGameData, bet: number, prevResponse: ILeprechaunGameData): ASWinData => {
                const parsedData: ASWinData = {
                    totalWin: parseFloat(response.accumulatedRoundWin),
                    totalSpinWinnings: this.getWin(response, bet, prevResponse),
                    wasFeatureBuy: response.wasFeatureBuy,
                    freeSpinTriggeredThisSpin: this.isFreeSpinTriggered(response),
                    isBigWin: this.isBigWin(response),
                    winType: WINTYPE.NORMAL,
                    featureName: this.getFeatureName(response),
                    isRoundComplete: this.isRoundComplete(response),
                    isBonusEnd: this.isBonusEnd(response),
                    isWinCapHit: false
                }
                return parsedData;
            }
        };
    }

    public onActionSpinPlaySound(trigger: ActionSpinSound): void {
        if (trigger == ActionSpinSound.WIN) {
            SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.AS_WIN);
        } else if (trigger == ActionSpinSound.BIG_WIN) {
            SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.AS_WIN_BIG);
        }
    }

/*    isLegalStopOnBonusMode(response: IResponseData): boolean {
        return response.mode === GameMode.NORMAL && (response.nextMode === LeprechaunGameMode.FREESPIN);
    }*/

    private isBigWin(response: ILeprechaunGameData): boolean {
        const win = parseFloat(response.totalSpinWinnings);
        const playedBetValue = parseFloat(response.playedBetValue);
        let winRatio: number = Helper.ceilToDecimals((win / playedBetValue), 2);

        if (response.wasFeatureBuy) {
            const betPrice: number = LeprechaunGameModuleConfig.featurePrice.getBuyFeaturePrice(playedBetValue, response.wasFeatureBuy)
            winRatio = Helper.ceilToDecimals((win / betPrice), 2);
            return winRatio >= 1;
        }

        return winRatio >= 15;
    }

    private getWin(response: ILeprechaunGameData, bet: number, prevData: ILeprechaunGameData): number {
        return parseFloat(response.totalSpinWinnings);
    }

    private getFeatureName(response: ILeprechaunGameData): string {
        if (response.nextMode == LeprechaunGameMode.FREESPIN || response.mode == LeprechaunGameMode.FREESPIN || response.nextMode == LeprechaunGameMode.FS_PICK || response.mode == LeprechaunGameMode.FS_PICK) {
            return "RAINBOW SPINS";
        }
        return "";
    }

    isLegalStopOnBonusMode(data: IResponseData): boolean {
        return data.mode == LeprechaunGameMode.NORMAL && data.nextMode == LeprechaunGameMode.FS_PICK;
    }

    private isFreeSpinTriggered(response: ILeprechaunGameData): boolean {
        return response.mode == LeprechaunGameMode.NORMAL && response.nextMode == LeprechaunGameMode.FS_PICK;
    }

    private isRoundComplete(response: ILeprechaunGameData): boolean {
        return response.mode != LeprechaunGameMode.FS_PICK;
    }

    private isBonusEnd(response: ILeprechaunGameData): boolean {
        return response.mode === LeprechaunGameMode.FREESPIN && response.nextMode === LeprechaunGameMode.NORMAL;
    }

}