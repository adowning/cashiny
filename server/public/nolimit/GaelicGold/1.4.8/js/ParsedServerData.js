"use strict";
/**
 * Created by Ning Jiang on 4/27/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedServerData = void 0;
const GameMode_1 = require("../../gamemode/GameMode");
class ParsedServerData {
    get mode() {
        return this._mode;
    }
    get nextMode() {
        return this._nextMode;
    }
    get reels() {
        return this._reels;
    }
    get nextReelSetName() {
        return this._nextReelSetName;
    }
    get totalWin() {
        return this._totalWin;
    }
    get currentMultiplier() {
        return this._currentMultiplier;
    }
    get overlayWilds() {
        return this._overlayWilds;
    }
    get scatterPositions() {
        return this._scatterPositions;
    }
    get freespinsLeft() {
        return this._freespinsLeft;
    }
    get freespinTriggeredThisSpin() {
        return this._freespinTriggeredThisSpin;
    }
    get addedNumberOfFreespinsThisSpin() {
        return this._addedNumberOfFreespinsThisSpin;
    }
    get numberOfFreespinsPlayed() {
        return this._numberOfFreespinsPlayed;
    }
    get isTotalWin() {
        return this._isTotalWin;
    }
    get isNextTotalWin() {
        return this._isNextTotalWin;
    }
    // This is only for the replay mode pick and click.
    get replayNextPlayerInteraction() {
        return this._replayNextPlayerInteraction;
    }
    constructor(rawData, dataParser) {
        this._mode = dataParser.parseMode(rawData);
        this._nextMode = dataParser.parseNextMode(rawData);
        this._reels = dataParser.parseReels(rawData);
        this._nextReelSetName = dataParser.parseNextReelSetName(rawData);
        this._totalWin = dataParser.parseTotalWin(rawData);
        this._currentMultiplier = dataParser.parseCurrentMultiplier(rawData);
        this._overlayWilds = dataParser.parseOverlayWilds(rawData);
        this._scatterPositions = this.parseScatterPositions(rawData, dataParser);
        this._freespinsLeft = dataParser.parseFreespinsLeft(rawData);
        this._freespinTriggeredThisSpin = dataParser.parseFreespinTriggeredThisSpin(rawData);
        this._addedNumberOfFreespinsThisSpin = dataParser.parseAddedNumberOfFreespinsThisSpin(rawData);
        this._numberOfFreespinsPlayed = dataParser.parseNumberOfFreespinsPlayed(rawData);
        this._replayNextPlayerInteraction = dataParser.parseReplayNextPlayerInteraction(rawData);
        this._isTotalWin = this.parseIsTotalWin(rawData);
        this._isNextTotalWin = this.parseIsNextTotalWin(rawData);
    }
    parseIsTotalWin(rawData) {
        return this.isRespin(rawData) ||
            this.isFreespin(rawData) ||
            this.isFreespinTriggered(rawData) ||
            this.isFeatureTotalWin(rawData);
    }
    parseIsNextTotalWin(rawData) {
        return this.isNextRespin(rawData) ||
            this.isNextFreespin(rawData) ||
            this.isNextFeatureTotalWin(rawData);
    }
    isRespin(rawData) {
        return this.mode === GameMode_1.GameMode.RESPIN || this.mode === GameMode_1.GameMode.NORMAL_AVALANCHE || this.mode === GameMode_1.GameMode.FREESPIN_AVALANCHE;
    }
    isFreespin(rawData) {
        return this.mode === GameMode_1.GameMode.FREESPIN;
    }
    isFreespinTriggered(rawData) {
        return this.freespinTriggeredThisSpin;
    }
    // To override in game
    isFeatureTotalWin(rawData) {
        return false;
    }
    isNextRespin(rawData) {
        return this.nextMode === GameMode_1.GameMode.RESPIN || this.nextMode === GameMode_1.GameMode.NORMAL_AVALANCHE || this.nextMode === GameMode_1.GameMode.FREESPIN_AVALANCHE;
    }
    isNextFreespin(rawData) {
        return this.nextMode === GameMode_1.GameMode.FREESPIN;
    }
    // To override in game
    isNextFeatureTotalWin(rawData) {
        return false;
    }
}
exports.ParsedServerData = ParsedServerData;
//# sourceMappingURL=ParsedServerData.js.map