"use strict";
/**
 * Created by Jonas Wålekvist on 2019-11-08.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NolimitAudioPlayer = void 0;
const NolimitHowl_1 = require("./NolimitHowl");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const NolimitSlotAudio_1 = require("./NolimitSlotAudio");
const howler_1 = require("howler");
class CatalogNames {
}
CatalogNames.MUSIC = "loops";
CatalogNames.EFFECT = "effects";
CatalogNames.KEYPAD = "keypad";
class NolimitAudioPlayer {
    get isLoaded() { return this._isLoaded; }
    get isLoading() { return this._isLoading; }
    get isLoadReady() { return !!this._playCatalog; }
    get catalogs() { return this._playCatalog.catalogs; }
    constructor() {
        this.name = "AudioPlayer";
        this.FADE_TIME = 500;
        this._loopToBePlayed = [];
        this._loadingData = {
            howlerPlayers: [],
            configs: []
        };
        this._loggerEnabled = false;
        this._isLoaded = false;
        this._isLoading = false;
        this._singelPlayers = {};
        this._loopCache = [];
    }
    getEffectDuration(name) {
        if (!this.isLoaded)
            return 0;
        return this._singelPlayers.effects.duration(name);
    }
    showLogs(enable) { this._loggerEnabled = enable; }
    soundLog(type, message) {
        Logger_1.Logger.log("[SOUND" + (type ? "-" + type + "] : " : "] : ") + message);
    }
    // --------------- CREATION & CLEANING
    createPlaylist(soundDataList) {
        return soundDataList.then(lists => {
            this._playCatalog = { catalogs: [] };
            //Filters out undefined, can it be though?
            lists = lists.filter((list) => {
                return !!list;
            });
            const normal = [];
            const censored = [];
            lists.forEach((list) => {
                const split = list.name.split("Censored");
                if (split.length > 1) {
                    list.name = split[0];
                    list.censored = true;
                    censored.push(list);
                }
                else {
                    normal.push(list);
                }
            });
            let listsToBeUsed = normal;
            if (NolimitSlotAudio_1.NolimitSlotAudio.apiPlugIn.gameClientConfiguration.useCensoredSoundUS === true) {
                for (let cList of censored) {
                    for (let i = 0; i < listsToBeUsed.length; i++) {
                        if (listsToBeUsed[i].name == cList.name) {
                            listsToBeUsed[i] = cList;
                        }
                    }
                }
            }
            listsToBeUsed.forEach((list) => {
                const temp = { categoryName: list.name, soundList: {} };
                const spritePaths = Object.keys(list.sprite);
                this._loadingData.configs.push({
                    src: list.src,
                    loop: list.name === CatalogNames.MUSIC,
                    sprite: list.sprite
                });
                for (let id = 0; id < spritePaths.length; id++)
                    temp.soundList[spritePaths[id]] = undefined;
                this._playCatalog.catalogs.push(temp);
            });
        });
    }
    startLoading() {
        this._isLoading = true;
        return new Promise(resolve => {
            for (let i = 0; i < this._loadingData.configs.length; i++)
                this._loadingData.howlerPlayers.push(new howler_1.Howl(this._loadingData.configs[i]));
            resolve();
        });
    }
    checkLoadingState() {
        for (let i = 0; i < this._loadingData.howlerPlayers.length; i++)
            if (this._loadingData.howlerPlayers[i].state() !== "loaded")
                return false;
        for (let c = 0; c < this.catalogs.length; c++) {
            const cata = this.getCategory(this.catalogs[c].categoryName);
            const sounds = this.getAllSoundInCatalog(cata);
            if (this.catalogs[c].categoryName == CatalogNames.EFFECT)
                this._singelPlayers.effects = new NolimitHowl_1.singelEffectsPlayer(this._loadingData.configs[c]);
            if (this.catalogs[c].categoryName == CatalogNames.MUSIC)
                this._singelPlayers.loops = new NolimitHowl_1.singelLoopPlayer(this._loadingData.configs[c]);
            for (let s = 0; s < sounds.length; s++) {
                const h = new howler_1.Howl(this._loadingData.configs[c]);
                cata.soundList[sounds[s]] = new NolimitHowl_1.NolimitHowl(h, this._loadingData.configs[c]);
                cata.soundList[sounds[s]].setSoundName(s);
            }
            this._loadingData.howlerPlayers[c].unload();
            delete this._loadingData.howlerPlayers[c];
            delete this._loadingData.configs[c];
        }
        this._loadingData = undefined;
        this._isLoading = false;
        this._isLoaded = true;
        return true;
    }
    // --------------- FETCHERS
    getCategory(category) {
        let cat = this.catalogs.find((c) => { return c.categoryName === category; });
        if (!cat)
            throw new Error("Trying to fetch sound from undefined soundFolder: " + category);
        return cat;
    }
    getAllSoundInCatalog(category) {
        return Object.keys(category.soundList);
    }
    getCategoryPlayer(category) {
        const arr = [];
        const cat = Array.isArray(category) ? category : [category];
        for (let c = 0; c < cat.length; c++) {
            const cata = this.getCategory(cat[c]);
            const sounds = this.getAllSoundInCatalog(cata);
            arr.push(...sounds.map((name) => { return cata.soundList[name]; }));
        }
        return arr;
    }
    allPlayers() { return this.getCategoryPlayer([CatalogNames.KEYPAD, CatalogNames.MUSIC, CatalogNames.EFFECT]); }
    getPlayerAtCategory(category, soundName) {
        const cat = Array.isArray(category) ? category : [category];
        for (let c = 0; c < cat.length; c++) {
            let catalog = this.getCategory(cat[c]);
            if (this.getAllSoundInCatalog(catalog).indexOf(soundName) === -1)
                continue;
            else
                return catalog.soundList[soundName];
        }
        return undefined;
    }
    fetchSoundPlayer(soundName) {
        for (let c = 0; c < this.catalogs.length; c++) {
            let catalog = this.getCategory(this.catalogs[c].categoryName);
            if (this.getAllSoundInCatalog(catalog).indexOf(soundName) === -1)
                continue;
            else
                return catalog.soundList[soundName];
        }
        return undefined;
    }
    getContext() {
        return howler_1.Howler.ctx;
    }
    getMasterGain() {
        return howler_1.Howler.masterGain;
    }
    // --------------- EVENTS & SETTINGS
    setPause(paused) {
        if (!this.isLoaded)
            return;
        this.getCategoryPlayer([CatalogNames.KEYPAD, CatalogNames.MUSIC, CatalogNames.EFFECT]).forEach((player) => {
            paused ? player.pause() : player.resume();
        });
        this.onOldPause(paused);
    }
    onOldPause(paused) {
        if (paused) {
            this._singelPlayers.loops.pause();
            this._singelPlayers.effects.pause();
        }
        else {
            if (this._loopCache.length > 0) {
                this._singelPlayers.loops.loop(this._loopCache);
                this._loopCache = [];
            }
            this._singelPlayers.loops.resume(this.FADE_TIME);
            this._singelPlayers.effects.resume();
        }
    }
    onHalt() {
        this.setPause(true);
        howler_1.Howler.unload();
    }
    onSingleMusic(music) {
        if (music) {
            if (this._loopCache.length > 0) {
                this._singelPlayers.loops.loop(this._loopCache);
                this._loopCache = [];
            }
            this._singelPlayers.loops.resume(this.FADE_TIME);
        }
        else {
            this._singelPlayers.loops.pause(this.FADE_TIME);
        }
    }
    onSingleSfx(sfx) {
        this._singelPlayers.effects.mute(sfx);
    }
    onMusic(music) {
        if (!this.isLoaded)
            return;
        if (this._loggerEnabled)
            this.soundLog("MUSIC-MUTE", !music);
        this.onSingleMusic(music);
        this.getCategoryPlayer(CatalogNames.MUSIC).forEach(player => {
            if (this._loopToBePlayed != undefined && music) {
                for (let i = 0; i < this._loopToBePlayed.length; i++) {
                    if (player.isPlayerWithSound(this._loopToBePlayed[i].name)) {
                        if (this._loggerEnabled)
                            this.soundLog("MUSIC-PLAY", "Name: " + this._loopToBePlayed[i].name + ", Volume: " + this._loopToBePlayed[i].volume);
                        player.fade(0, this._loopToBePlayed[i].volume, this.FADE_TIME);
                        break;
                    }
                }
                player.mute(!music);
            }
            else {
                player.fadeToMute(!music, this.FADE_TIME);
            }
        });
        if (this._loopToBePlayed != undefined && music)
            delete this._loopToBePlayed;
    }
    onSfx(sfx) {
        if (!this.isLoaded)
            return;
        if (this._loggerEnabled)
            this.soundLog("SFX-MUTE", !sfx);
        this.onSingleSfx(!sfx);
        this.getCategoryPlayer([CatalogNames.KEYPAD, CatalogNames.EFFECT]).forEach(player => {
            player.fadeToMute(!sfx, this.FADE_TIME);
        });
    }
    //---------------PUBLIC INTERFACE
    /**
     * @deprecated since, v 0.4.3
     * LEGACY: Plays an Effect sound.
     * @param {string} name Sound Name.
     * @param {number} amount How many times it should be play.
     */
    playEffect(name, amount = 1) {
        Logger_1.Logger.deprecated("playEffect, use SlotGame.Sound.PlayTrack instead.", "0.4.3");
        if (!this.isLoaded)
            return Promise.resolve("Not Loaded");
        if (this._loggerEnabled)
            this.soundLog("PLAY-EFFECT", "Name: " + name + ", Amount: " + amount);
        return Promise.resolve(this._singelPlayers.effects.play(name, amount));
    }
    /**
    * @deprecated since, v 0.4.3
    * LEGACY: Stops an Effect sound.
    * @param {string} name Sound Name.
    * @param {number} fadeDurationMs FadeOut duration in milliseconds.
    */
    stopEffect(name, fadeDurationMs = 0) {
        Logger_1.Logger.deprecated("stopEffect, use SlotGame.Sound.StopTrack instead.", "0.4.3");
        if (!this.isLoaded)
            return Promise.resolve("Not Loaded");
        if (this._loggerEnabled)
            this.soundLog("STOP-EFFECT", "Name: " + name + ", FadeDurationMs: " + fadeDurationMs);
        if (fadeDurationMs <= 0) {
            this._singelPlayers.effects.stop(name);
            return Promise.resolve(name);
        }
        else {
            return this.fadeEffect(name, 0, fadeDurationMs).then((name) => this.stopEffect(name, 0));
        }
    }
    /**
     * @deprecated since, v 0.4.3
     * LEGACY: Fade an Effect sound.
     * @param {string} name Sound Name.
     * @param {number} volume fade to volume.
     * @param {number} durationMS Fade duration in milliseconds.
     */
    fadeEffect(name, volume, durationMS) {
        Logger_1.Logger.deprecated("fadeEffect, use SlotGame.Sound.FadeTrack instead.", "0.4.3");
        if (!this.isLoaded)
            return Promise.resolve("Not Loaded");
        if (this._loggerEnabled)
            this.soundLog("FADE-EFFECT", "Name: " + name + ", ToVolume: " + volume + ", DurationMS: " + durationMS);
        return this._singelPlayers.effects.fade(volume, durationMS, name);
    }
    /**
    * @deprecated since, v 0.4.3
    * LEGACY: Play an loop sound. Stops all other loop sounds.
    * @param {string| string[]} name Sound Names, use array if you want to play multiple loops in order.
    * @param {number} fadeOutMs fade out the current playing loop.
    * @param {number} fadeInMs Fade in the new loop.
    */
    playAmbience(names, fadeOutMs, fadeInMs) {
        Logger_1.Logger.deprecated("playAmbience, use SlotGame.Sound.PlayTrack instead.", "0.4.3");
        this._loopCache = Array.isArray(names) ? names : [names];
        if (!this.isLoaded)
            return;
        if (this._loggerEnabled)
            this.soundLog("AMBIENCE-PLAY", "Sounds: " + this._loopCache + ", FadeOutMS: " + fadeOutMs + ", FadeInMs: " + fadeInMs);
        this._singelPlayers.loops.loop(this._loopCache, fadeOutMs, fadeInMs);
        this._loopCache = [];
    }
    /**
     * LEGACY: Pauses the current loop sound in play.
     * @param {number} fadeOutDurationMs fade out the current playing loop before it pauses.
    */
    pauseAmbience(fadeOutDurationMs = 0) {
        Logger_1.Logger.deprecated("pauseAmbience, use SlotGame.Sound.PlayTrack instead.", "0.4.3");
        if (!this.isLoaded)
            return Promise.resolve("Not Loaded");
        if (this._loggerEnabled)
            this.soundLog("AMBIENCE-PAUSE", "FadeOutDurationMs: " + fadeOutDurationMs);
        return this._singelPlayers.loops.pause(fadeOutDurationMs);
    }
    /**
     * @deprecated since, v 0.4.3
     * LEGACY: Resume the paused loop sound.
     * @param {number} fadeInDurationMs fade in the current playing loop that have been paused.
    */
    resumeAmbience(fadeInDurationMs = 0) {
        Logger_1.Logger.deprecated("resumeAmbience, use SlotGame.Sound.PlayTrack instead.", "0.4.3");
        if (!this.isLoaded)
            return Promise.resolve("Not Loaded");
        if (this._loggerEnabled)
            this.soundLog("AMBIENCE-RESUME", "FadeInDurationMs: " + fadeInDurationMs);
        return this._singelPlayers.loops.resume(fadeInDurationMs);
    }
    /**
     * @deprecated since, v 0.4.3
     * LEGACY: Fade the current loop in play.
     * @param {number} ToVolume define the volume it should fade to.
     * @param {number} fadeDurationMs duration in ms.
    */
    fadeAmbience(ToVolume, fadeDurationMs) {
        Logger_1.Logger.deprecated("fadeAmbience, use SlotGame.Sound.FadeTrack instead.", "0.4.3");
        if (!this.isLoaded)
            return Promise.resolve("Not Loaded");
        if (this._loggerEnabled)
            this.soundLog("AMBIENCE-FADE", "ToVolume: " + ToVolume + ", FadeDurationMs: " + fadeDurationMs);
        return this._singelPlayers.loops.fade(ToVolume, fadeDurationMs);
    }
    /**
     * Config includes: name, volume, repeat.
     * >name: SoundName to be played.
     * >volume: What voulume it will start with.
     * >repeat: How many times it should repeat itself, counts as a temporary Loop when repeatCounter is more than 0.
     * @param {IPlayTrackConf} conf
    */
    playTrack(conf) {
        if (this._loopToBePlayed) {
            const vol = (conf.volume != undefined ? conf.volume : 1);
            const indx = this._loopToBePlayed.findIndex((c) => { return c.name == conf.name; });
            if (indx == -1) {
                this._loopToBePlayed.push({ name: conf.name, volume: vol });
            }
            else {
                this._loopToBePlayed[indx].volume = vol;
            }
        }
        if (!this.isLoaded)
            return undefined;
        const player = this.getPlayerAtCategory([CatalogNames.EFFECT, CatalogNames.MUSIC], conf.name);
        if (player) {
            if (this._loggerEnabled) {
                this.soundLog("PLAY", "Name: " + conf.name + ", Volume: " + (conf.volume != undefined ? conf.volume : 1) + ", Repeat: " + (conf.repeat != undefined ? conf.repeat : 0));
            }
            player.play(conf.repeat, conf.volume != undefined ? conf.volume : 1);
        }
        return player;
    }
    /**
     * UPDATED: Stops both loops and effects.
     * Config includes: name, duration
     * >duration: the duration in ms for it to turn the volume of the track to 0.
     * @param {IStopTrackConf} conf
    */
    stopTrack(name) {
        if (this._loopToBePlayed)
            this._loopToBePlayed = this._loopToBePlayed.filter((c) => { return name != c.name; });
        if (!this.isLoaded)
            return;
        const player = this.getPlayerAtCategory([CatalogNames.EFFECT, CatalogNames.MUSIC], name);
        if (player) {
            if (this._loggerEnabled) {
                this.soundLog("STOP", "Name: " + name);
            }
            player.stop();
        }
        return player;
    }
    /**
     * UPDATED: Fades both loop and effects.
     * Config includes: name, from, to, duration
     * >from: starting volume.
     * >to: end volume.
     * >duration: duration in ms.
     * @param {IFadeTrackConf} conf
    */
    fadeTrack(conf) {
        if (this._loopToBePlayed) {
            const indx = this._loopToBePlayed.findIndex((c) => { return c.name == conf.name; });
            if (indx >= 0) {
                this._loopToBePlayed[indx].volume = (conf.to != undefined ? conf.to : 1);
            }
        }
        if (!this.isLoaded)
            return;
        const player = this.getPlayerAtCategory([CatalogNames.EFFECT, CatalogNames.MUSIC], conf.name);
        if (player) {
            if (this._loggerEnabled) {
                this.soundLog("FADE", "Name: " + conf.name + ", FromVolume: " + conf.from + ", FromVolume: " + conf.to + ", Duration: " + (conf.duration ? conf.duration : player.trackDuration()));
            }
            player.fade(conf.from, conf.to, conf.duration ? conf.duration : player.trackDuration());
        }
        return player;
    }
    /**
     * GENERAL: Fetches the duration of a sound clip.
     * @param {string} name Sound name.
     * @returns {number} Sound Duration.
    */
    getSoundDuration(name) {
        if (!this.isLoaded)
            return 0;
        return this.getPlayerAtCategory([CatalogNames.EFFECT, CatalogNames.MUSIC], name) ? this.getPlayerAtCategory([CatalogNames.EFFECT, CatalogNames.MUSIC], name).trackDuration() : 0;
    }
    /**
     * GENERAL: Plays an keypad sound.
     * @param {string} name Sound name.
    */
    playKeypadSound(name) {
        if (!this.isLoaded || document.hidden)
            return;
        const player = this.getPlayerAtCategory([CatalogNames.KEYPAD], name);
        if (player) {
            if (this._loggerEnabled) {
                this.soundLog("KEYPAD-PLAY", "Name: " + name);
            }
            player.play(undefined, 1);
        }
        return player;
    }
    /**
   * GENERAL: Stops an keypad sound.
   * @param {string} name Sound name.
  */
    stopKeypadSound(name) {
        if (!this.isLoaded || document.hidden)
            return;
        const player = this.getPlayerAtCategory([CatalogNames.KEYPAD], name);
        if (player) {
            if (this._loggerEnabled) {
                this.soundLog("KEYPAD-STOP", "Name: " + name);
            }
            player.stop();
        }
        return player;
    }
}
exports.NolimitAudioPlayer = NolimitAudioPlayer;
//# sourceMappingURL=NolimitAudioPlayer.js.map