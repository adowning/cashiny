/**
 * Created by Ning Jiang on 11/22/2016.
 */
///<reference path="../../node_modules/@nolimitcity/slot-game/lib/gsap/src/CustomWiggle.d.ts"/>
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {LeprechaunGameModuleConfig} from "./LeprechaunGameModuleConfig";
import {WinFieldController} from "@nolimitcity/slot-game/bin/core/winpresentation/WinFieldController";
import {REWinFieldController} from "./keypad/REWinFieldController";
//import {NolimitConfig} from "@nolimitcity/slot-launcher/bin/settings/NolimitConfig";
//import {NolimitApplication} from "@nolimitcity/slot-launcher/bin/NolimitApplication";

export class Leprechaun extends SlotGame {

    constructor() {
        super(LeprechaunGameModuleConfig.instance);
    }

    protected createWinFieldController():WinFieldController {
        //if (NolimitConfig.isDevMode) {
        //    (<any>globalThis).__PIXI_APP__ = NolimitApplication.pixiApp;
        //}
        return new REWinFieldController();
    }


    getNoWinGameData():any {
        return {
            "reels": [
                [
                    "M3",
                    "M5",
                    "L4",
                    "L2",
                    "M1",
                    "M4",
                    "L1"
                ],
                [
                    "L2",
                    "M3",
                    "L3",
                    "L1",
                    "M5",
                    "L3",
                    "L2"
                ],
                [
                    "M3",
                    "L3",
                    "M1",
                    "L1",
                    "L3",
                    "L2",
                    "M4"
                ]
            ],
            "evaluatedArea": [
                [
                    "L4",
                    "L2",
                    "M1"
                ],
                [
                    "L3",
                    "L1",
                    "M5"
                ],
                [
                    "M1",
                    "L1",
                    "L3"
                ]
            ],
            "betLineWins": [],
            "totalBetLineSpinWinnings": 0,
            "totalSpinWinnings": 0,
            "totalSpinWinningsNonMultiplied": 0,
            "accumulatedRoundWin": 0,
            "playedBetValue": 100,
            "nearWinReels": [
                false,
                false,
                false
            ],
            "reelsNextSpin": "BASE_REELSET",
            "mode": "NORMAL",
            "nextMode": "NORMAL",
            "bonusFeatureTriggered": false,
            "playerSelection": -1,
            "doReelNudge": [
                false,
                false,
                false
            ],
            "extraSymbolsOnTop": [
                [
                    "L1",
                    "L3"
                ],
                [
                    "L1",
                    "L3"
                ],
                [
                    "L1",
                    "L3"
                ]
            ],
            "multiplierOnReel": [
                0,
                0,
                0
            ],
            "numberOfFreespinsPlayed": 0,
            "freespinsLeft": 0,
            "freespinMultiplier": 1,
            "freespinNbrOfLines": 5,
            "pickedIndexesBefore": [
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false
            ],
            "pickedIndexesAfter": [
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false
            ],
            "revealedBefore": [
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                ""
            ],
            "revealedAfter": [
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                ""
            ],
            "thisPickedIndex": -1,
            "thisRevealedPicked": "",
            "pickedExtraSpins": 0,
            "pickedExtraLines": 0,
            "pickedExtraMultiplier": 0,
            "addedNumberOfFreespins": [
                0,
                0,
                0
            ],
            "addedMultiplier": [
                0,
                0,
                0
            ],
            "addedLines": [
                0,
                0
            ],
            "possibleReveals": [],
            "featureBuyTimesBetValue": [
                {
                    "name": "FREESPIN",
                    "type": "FREESPIN",
                    "price": 50
                }
            ],
            "featureBet": false,
            "wasFeatureBuy": false
        };
    }
}