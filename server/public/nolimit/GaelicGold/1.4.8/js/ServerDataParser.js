"use strict";
/**
 * Created by Ning Jiang on 4/19/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerDataParser = void 0;
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const GameConfig_1 = require("../gameconfig/GameConfig");
const StateReelSymbol_1 = require("../reelsymbol/StateReelSymbol");
const GameSetting_1 = require("../setting/GameSetting");
class ServerDataParser {
    // TODO: remove the overlayWilds, scatterPositions and freespin values from this general classes.
    constructor() { }
    // ServerData:
    parseMode(rawData) {
        return rawData.mode;
    }
    parseNextMode(rawData) {
        return rawData.nextMode;
    }
    parseReels(rawData) {
        return ServerDataParser.parseStackedSymbolsInReels(rawData.reels);
    }
    static parseStackedSymbolsInReels(rawReels, parsedSymbolNamesUnder) {
        let result = [];
        for (let i = 0; i < rawReels.length; i++) {
            if (GameConfig_1.GameConfig.instance.STACKED_SYMBOLS == null) {
                result.push(rawReels[i].concat());
            }
            else {
                result.push(this.parseStackedSymbolsInReel(rawReels[i], i, parsedSymbolNamesUnder == null ? undefined : parsedSymbolNamesUnder[i]));
            }
        }
        return result;
    }
    // Always start to parse the reel from the bottom because in all cases the bottom of the reel is already known.
    // For special cases like the reel is up side down, please create your own parsing.
    static parseStackedSymbolsInReel(rawReel, reelIndex, parsedSymbolNameUnder) {
        const input = rawReel.concat();
        const result = [];
        if (parsedSymbolNameUnder == null) {
            let bottomStackedSymName = StateReelSymbol_1.StateReelSymbol.parseStackedSymbolName(input[input.length - 1], reelIndex);
            // Find out if the reel has half stacked symbols in the bottom
            if (bottomStackedSymName.isStacked) {
                let i;
                for (i = 1; i < input.length; i++) {
                    const testStackedSymName = StateReelSymbol_1.StateReelSymbol.parseStackedSymbolName(input[input.length - 1 - i], reelIndex);
                    if (testStackedSymName.isStacked && testStackedSymName.symName === bottomStackedSymName.symName) {
                        bottomStackedSymName = testStackedSymName;
                    }
                    else {
                        break;
                    }
                }
                // i is the first symbol that's not in the stack.
                i = i % bottomStackedSymName.totalNum; // If num of stacked symbols in the bottom is bigger than stacked.totalNum.
                parsedSymbolNameUnder = `${bottomStackedSymName.symName}*${i.toString()}`;
            }
            else {
                parsedSymbolNameUnder = "NonStackedDummySym";
            }
        }
        while (input.length > 0) {
            const stackedSymNameUnder = StateReelSymbol_1.StateReelSymbol.parseStackedSymbolName(result.length > 0 ? result[0] : parsedSymbolNameUnder, reelIndex);
            const stackedSymName = StateReelSymbol_1.StateReelSymbol.parseStackedSymbolName(input.pop(), reelIndex);
            // For continue stacked symbol
            if (stackedSymNameUnder.isStacked && stackedSymNameUnder.index > 0) {
                if (!stackedSymName.isStacked || stackedSymName.symName !== stackedSymNameUnder.symName) {
                    debugger;
                    Logger_1.Logger.logDev("If you are using the outcome setter, this might be a case that the outcome made an illegal server data. Please take to the server dev to check if that worth a fix.");
                    throw new Error(`ServerDataParser.parseStackedSymbolsInReel():reelId = ${reelIndex}, reelData = ${rawReel.toString()}, symName = ${stackedSymName.symName}, the symbol should be ${stackedSymName.totalNum}-stacked!`);
                }
                result.unshift(`${stackedSymName.symName}*${(stackedSymNameUnder.index - 1).toString()}`);
                continue;
            }
            // For starting a new stacked symbol
            if (stackedSymName.isStacked) {
                result.unshift(`${stackedSymName.symName}*${(stackedSymName.totalNum - 1).toString()}`);
                continue;
            }
            // For non stacked symbol
            result.unshift(stackedSymName.symName);
        }
        return result;
    }
    parseNextReelSetName(rawData) {
        return rawData.reelsNextSpin;
    }
    parseInitReelSet(rawData) {
        if (rawData.initReelSet) {
            return rawData.initReelSet;
        }
        Logger_1.Logger.logDev("ServerDataParser.parseInitReelSet(): initReelSet is missing, use nextReelSetName for init. This might not be a problem if your game doesn't have full Stacked reel.");
        return this.parseNextReelSetName(rawData);
    }
    parseTotalWin(rawData) {
        if (rawData.accumulatedRoundWin != null) {
            return parseFloat(rawData.accumulatedRoundWin);
        }
        return 0;
    }
    parseCurrentMultiplier(rawData) {
        return rawData.currentMultiplier != null ? rawData.currentMultiplier : 1;
    }
    parseOverlayWilds(rawData) {
        return rawData.overlayWilds;
    }
    parseFreespinsLeft(rawData) {
        return rawData.freespinsLeft != null ? rawData.freespinsLeft : 0;
    }
    parseFreespinTriggeredThisSpin(rawData) {
        return rawData.freespinTriggeredThisSpin != null ? rawData.freespinTriggeredThisSpin : false;
    }
    parseAddedNumberOfFreespinsThisSpin(rawData) {
        return rawData.addedNumberOfFreespinsThisSpin != null ? rawData.addedNumberOfFreespinsThisSpin : 0;
    }
    parseReplayNextPlayerInteraction(rawData) {
        if (!GameSetting_1.GameSetting.replayMode) {
            return undefined;
        }
        return rawData.nextPlayerInteraction;
    }
    parseScatterPositionsEnteringFreespin(rawData) {
        return rawData.scatterPositionsEnteringFreespin;
    }
    // Init Data:
    parseBetLines(rawData) {
        return rawData.betLines;
    }
    parseSymbolValues(rawData) {
        return rawData.symbolValues;
    }
    parseIsRestoreState(rawData) {
        return rawData.isRestoreState;
    }
    // Game Data:
    parseBetWins(rawData) {
        switch (GameConfig_1.GameConfig.instance.BET_WIN_MODE) {
            case 1 /* BetWinMode.BET_LINE */:
                return rawData.betLineWins;
            case 2 /* BetWinMode.BET_WAY */:
                return rawData.betWayWins;
            default:
                debugger;
                throw new Error("ServerDataParser.parseBetWins(): Invalid BetWinMode from GameConfig!");
        }
    }
    parseSingleWin(rawData) {
        return parseFloat(rawData.totalSpinWinnings);
    }
    parsePlayedBetValue(rawData) {
        return parseFloat(rawData.playedBetValue);
    }
    parseWasFeatureBuy(rawData) {
        return rawData.wasFeatureBuy;
    }
    parseScatterPositions(rawData) {
        return rawData.scatterPositions;
    }
    parseReelsEnteringFreespin(rawData) {
        if (rawData.reelsEnteringFreespin != undefined) {
            return ServerDataParser.parseStackedSymbolsInReels(rawData.reelsEnteringFreespin);
        }
        return undefined;
    }
    parseBetLineWinsEnteringFreespin(rawData) {
        return rawData.betLineWinsEnteringFreespin;
    }
    parseNumberOfFreespinsPlayed(rawData) {
        return rawData.numberOfFreespinsPlayed;
    }
}
exports.ServerDataParser = ServerDataParser;
//# sourceMappingURL=ServerDataParser.js.map