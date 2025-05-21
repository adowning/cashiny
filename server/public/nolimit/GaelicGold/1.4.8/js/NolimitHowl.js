"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NolimitHowl = exports.singelLoopPlayer = exports.singelEffectsPlayer = exports.HowlerStates = void 0;
const howler_1 = require("howler");
var HowlerStates;
(function (HowlerStates) {
    HowlerStates["unloaded"] = "unloaded";
    HowlerStates["loading"] = "loading";
    HowlerStates["loaded"] = "loaded";
})(HowlerStates = exports.HowlerStates || (exports.HowlerStates = {}));
class singelEffectsPlayer {
    constructor(conf) {
        this.playing = {};
        this.durations = {};
        this.timesLeft = {};
        this.paused = false;
        this._player = new howler_1.Howl(conf);
        for (let name in conf.sprite) {
            this.durations[name] = conf.sprite[name][1];
        }
    }
    play(name, times = 1) {
        const id = this._player.play(name);
        if (times > 1) {
            this._player.loop(true, id);
        }
        if (this.playing[name]) {
            this.stop(name);
        }
        this.playing[name] = id;
        this.timesLeft[id] = times;
        this._player.on('end', id => {
            this.timesLeft[id] = this.timesLeft[id] - 1;
            if (this.timesLeft[id] === 1) {
                this._player.loop(false, id);
            }
            else if (this.timesLeft[id] < 1) {
                delete this.playing[name];
                this._player.off('end', undefined, id);
            }
        }, id);
    }
    ;
    stop(name) {
        if (name) {
            if (this.playing[name]) {
                this._player.off('end', undefined, this.playing[name]);
                this._player.stop(this.playing[name]);
                delete this.playing[name];
            }
        }
        else {
            Object.keys(this.playing).forEach(name => {
                this.stop(name);
            });
        }
    }
    ;
    pause() {
        if (!this.paused) {
            this.paused = true;
            this._player.pause();
        }
    }
    ;
    resume() {
        if (this.paused) {
            this.paused = false;
            for (const name in this.playing) {
                this._player.play(this.playing[name]);
            }
        }
    }
    ;
    duration(name) {
        return this.durations[name];
    }
    ;
    volume(volume) {
        return this._player.volume(volume);
    }
    ;
    fade(volume, duration, name) {
        return new Promise(resolve => {
            if (name && this.playing[name]) {
                const id = this.playing[name];
                this._player.once('fade', () => resolve(name));
                this._player.fade(this._player.volume(id), volume, duration, id);
            }
            else {
                resolve(name);
            }
        });
    }
    ;
    mute(muted) {
        this._player.mute(muted);
    }
    unload() {
        return this._player.unload();
    }
    ;
}
exports.singelEffectsPlayer = singelEffectsPlayer;
;
class singelLoopPlayer {
    constructor(conf) {
        this.paused = true;
        this.loopNames = [];
        this.currentLoopName = "";
        this.volume = 1;
        this._player = new howler_1.Howl({
            src: conf.src,
            sprite: conf.sprite,
            loop: false
        });
        this._player.on("end", () => this.playNext());
    }
    loop(names, fadeOut = 0, fadeIn = fadeOut) {
        this.loopNames = Array.isArray(names) ? names : [names];
        if (this.paused || this.loopNames[0] === this.currentLoopName) {
            return Promise.resolve(0);
        }
        const removeId = this.currentLoopId;
        this.currentLoopName = this.loopNames[0];
        this.currentLoopId = this._player.play(this.currentLoopName);
        if (fadeIn > 0) {
            this._player.volume(0, this.currentLoopId);
            this.fadeTo(this.currentLoopId, this.volume, fadeIn);
        }
        return this.fadeTo(removeId, 0, fadeOut)
            .then(id => {
            if (id)
                this._player.stop(id);
            return Promise.resolve(id);
        });
    }
    pause(fadeOut = 0) {
        if (!this.paused) {
            this.paused = true;
            return this.fadeTo(this.currentLoopId, 0, fadeOut)
                .then(id => {
                if (this.currentLoopId === id) {
                    this._player.pause(id);
                }
            });
        }
        return Promise.resolve();
    }
    resume(fadeIn = 0) {
        if (this.paused) {
            this.paused = false;
            if (this.currentLoopId && this.loopNames[0] === this.currentLoopName) {
                this._player.play(this.currentLoopId);
                return this.fadeTo(this.currentLoopId, this.volume, fadeIn);
            }
            else {
                if (this.currentLoopId) {
                    this._player.stop(this.currentLoopId);
                }
                if (this.loopNames && this.loopNames.length > 0) {
                    this.currentLoopName = this.loopNames[0];
                    this.currentLoopId = this._player.play(this.currentLoopName);
                    this.fadeTo(this.currentLoopId, this.volume, fadeIn);
                }
            }
        }
        return Promise.resolve();
    }
    fade(newVolume, duration = 0) {
        if (Number.isFinite(newVolume) && newVolume >= 0 && newVolume <= 1.0) {
            this.volume = newVolume;
        }
        else {
            return Promise.reject('Invalid volume: ' + newVolume);
        }
        return this.fadeTo(this.currentLoopId, this.volume, duration);
    }
    fadeTo(id, volume, duration) {
        return new Promise(resolve => {
            if (!id) {
                setTimeout(resolve, duration);
            }
            else if (duration > 0 && this._player.volume(id) !== volume) {
                this._player.once('fade', id => resolve(id));
                this._player.fade(this._player.volume(id), volume, duration, id);
            }
            else {
                this._player.volume(volume, id);
                return resolve(id);
            }
        });
    }
    playNext() {
        if (this.paused)
            return;
        this.loopNames.push(this.loopNames.shift());
        this.currentLoopName = this.loopNames[0];
        this.currentLoopId = this._player.play(this.currentLoopName);
        this._player.volume(this.volume, this.currentLoopId);
    }
    unload() {
        return this._player.unload();
    }
    ;
}
exports.singelLoopPlayer = singelLoopPlayer;
class NolimitHowl {
    constructor(player, conf) {
        this._playIDs = [];
        this._soundName = "";
        this._repeatCount = 0;
        this._isPaused = false;
        this._expectedVolume = 1;
        this._expectedMuteState = undefined;
        this._config = conf;
        this._player = player;
    }
    get config() {
        return this._config;
    }
    /**
     * Only for init.
     * @param soundID
     */
    setSoundName(soundID = 0) {
        this._soundName = Object.keys(this._config.sprite)[soundID];
        this.eventTriggers();
    }
    /**
     *
     * @param name Check if this player matches with the sound you are looking for.
     * @returns true/false
     */
    isPlayerWithSound(name) {
        return this.soundName === name;
    }
    eventTriggers() {
        this.player.on("end", () => this.cleanIDs());
    }
    get soundName() {
        return this._soundName;
    }
    get triggerIDs() {
        return this._playIDs;
    }
    get lastTriggeredID() {
        return this._playIDs[this.amountOfInstances - 1];
    }
    get amountOfInstances() {
        return this._playIDs.length;
    }
    get isEmpty() {
        return this.amountOfInstances === 0;
    }
    get player() {
        return this._player;
    }
    get repeatCounter() {
        return this._repeatCount;
    }
    get isLooping() {
        return this.player.loop() || this.repeatCounter > 0;
    }
    get isPlaying() {
        return this.player.playing();
    }
    setLoop(loop) {
        return this.player.loop(loop);
    }
    ;
    play(repeat = 0, volume = this.currentVolume(), panning = 0) {
        // Make sure that someone don't send in a negative value.
        this._repeatCount = Math.max(0, repeat);
        this._expectedVolume = volume;
        this.setVolume(this._expectedVolume);
        // If current sound is playing.
        if (this.player.playing()) {
            if (this.isLooping) { // Repeat the same sound if it's an loop.
                this.player.play(this.lastTriggeredID);
            }
            else { // Create a new instance.
                const idFetched = this.player.play(this.soundName);
                if (this._playIDs.indexOf(idFetched) == -1)
                    this._playIDs.push(idFetched);
            }
            return;
        }
        // Play sound and fetch it's ID.
        const idFetched = this.player.play(this.isEmpty ? this.soundName : this.lastTriggeredID);
        if (this._playIDs.indexOf(idFetched) == -1)
            this._playIDs.push(idFetched);
    }
    ;
    cleanIDs() {
        // If this has repeat request but it's not defined as a general loop.
        if (this._repeatCount > 0) {
            this.play(--this._repeatCount, this.currentVolume());
            return;
        }
        ;
        if (this.isEmpty)
            return;
        // Find an TrackID that's playing. All tracks is bound to one Buffer so we can't clean ID on the fly.
        for (let i = 0; i < this.amountOfInstances; i++)
            if (this.player.playing(this._playIDs[i]))
                return;
        // If nothing is playing. Clean the ID.
        this.player.stop();
        this._playIDs = [];
    }
    resume() {
        if (!this.isEmpty && this._isPaused) {
            this.play(this._repeatCount, this._expectedVolume);
            this._isPaused = false;
        }
        return this.soundName;
    }
    pause() {
        if (!this.isEmpty && this.isPlaying) {
            this.player.pause();
            this._isPaused = true;
        }
        return this.soundName;
    }
    ;
    stop() {
        this._repeatCount = 0;
        this.player.stop();
        this.cleanIDs();
    }
    ;
    isMuted() {
        return this.player.mute();
    }
    ;
    mute(value) {
        this.player.mute(value);
        this._expectedMuteState = value;
        return this.player;
    }
    ;
    currentVolume() {
        return this.player.volume();
    }
    ;
    setVolume(volume) {
        return this.player.volume(volume);
    }
    ;
    fade(from = this.currentVolume(), to, duration = 1) {
        if (this.isEmpty)
            this.play();
        this._expectedVolume = to;
        if (duration <= 1)
            this.setVolume(this._expectedVolume);
        else {
            this.player.off("fade");
            if (this._expectedMuteState != undefined)
                this.mute(this._expectedMuteState);
            this.player.fade(from, this._expectedVolume, duration).once("fade", () => { this.setVolume(this._expectedVolume); });
        }
    }
    ;
    fadeToMute(mute, duration = 1) {
        this.player.off("fade");
        this._expectedMuteState = mute;
        if (this.isEmpty || !this.isPlaying) {
            this.mute(this._expectedMuteState);
            return;
        }
        if (!this._expectedMuteState) {
            this.mute(this._expectedMuteState);
            if (this._expectedVolume == 0)
                this.setVolume(this._expectedVolume);
            else
                this.player.fade(this.currentVolume(), this._expectedVolume, duration);
        }
        else {
            this.player.fade(this.currentVolume(), 0, duration).once("fade", () => {
                this.mute(this._expectedMuteState);
            });
        }
    }
    ;
    currentRate() {
        return this.player.rate();
    }
    ;
    setRate(idOrSetRate) {
        return this.player.rate(idOrSetRate);
    }
    ;
    idRate(rate) {
        this.player.rate(rate, this.lastTriggeredID);
    }
    ;
    seek(seek) {
        return this.player.seek(seek, this.lastTriggeredID);
    }
    ;
    trackDuration() {
        return this._config.sprite[this.soundName][1];
    }
    ;
    currentState() {
        return this.player.state();
    }
    ;
    load() { this.player.load(); }
    ;
    unload() { this.player.unload(); }
    ;
}
exports.NolimitHowl = NolimitHowl;
//# sourceMappingURL=NolimitHowl.js.map