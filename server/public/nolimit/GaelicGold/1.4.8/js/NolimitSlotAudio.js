"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NolimitSlotAudio = void 0;
const NolimitLauncher_1 = require("@nolimitcity/slot-launcher/bin/NolimitLauncher");
const ApiPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/ApiPlugin");
const APIEventSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem");
const APISettingsSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APISettingsSystem");
const APIOptions_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIOptions");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const NolimitAudioPlayer_1 = require("./NolimitAudioPlayer");
const ajaxPromise = require('@nolimitcity/core/api/ajax-promise');
class NolimitSlotAudio {
    get AudioPlayer() { return NolimitSlotAudio._audioPlayer; }
    get loading() { return !!this.AudioPlayer && this.AudioPlayer.isLoading; }
    get isLoaded() { return !!this.AudioPlayer && this.AudioPlayer.isLoaded; }
    get isLoading() { return !!this.AudioPlayer && this.AudioPlayer.isLoading; }
    constructor() {
        this.name = "NolimitSlotAudio";
        this.muteSettingName = "mute";
        this._ignoreClick = false;
        if (!this.AudioPlayer)
            this.createAudioPlayer();
    }
    createAudioPlayer() {
        NolimitSlotAudio._audioPlayer = new NolimitAudioPlayer_1.NolimitAudioPlayer();
    }
    get isEnabled() {
        return !!NolimitSlotAudio.apiPlugIn.settings.get(this.muteSettingName);
    }
    set isEnabled(value) {
        NolimitSlotAudio.apiPlugIn.settings.set(this.muteSettingName, value);
    }
    // If sound settings haven't been defined.
    get isFirstOpened() {
        return NolimitSlotAudio.apiPlugIn.settings.get(APISettingsSystem_1.APISetting.SFX) === undefined ||
            NolimitSlotAudio.apiPlugIn.settings.get(APISettingsSystem_1.APISetting.MUSIC) === undefined ||
            NolimitSlotAudio.apiPlugIn.settings.get(this.muteSettingName) === undefined;
    }
    // If sound settings haven't been defined.
    get isSettingsOff() {
        return !NolimitSlotAudio.apiPlugIn.settings.get(APISettingsSystem_1.APISetting.SFX) && !NolimitSlotAudio.apiPlugIn.settings.get(APISettingsSystem_1.APISetting.MUSIC);
    }
    // Only way to set this true is to set one of this options not equal to the other one.
    get isSettingsModified() {
        return NolimitSlotAudio.apiPlugIn.settings.get(APISettingsSystem_1.APISetting.SFX) != NolimitSlotAudio.apiPlugIn.settings.get(APISettingsSystem_1.APISetting.MUSIC);
    }
    get sfxOn() {
        return NolimitSlotAudio.apiPlugIn.settings.get(APISettingsSystem_1.APISetting.SFX);
    }
    get musicOn() {
        return NolimitSlotAudio.apiPlugIn.settings.get(APISettingsSystem_1.APISetting.MUSIC);
    }
    get player() { return this.AudioPlayer; }
    //------------- EVENT LISTENERS -----------//
    addEventListeners() {
        const events = NolimitSlotAudio.apiPlugIn.events;
        const settings = NolimitSlotAudio.apiPlugIn.settings;
        //There is no data sent with these events:
        events.on(APIEventSystem_1.APIEvent.PAUSE, (value) => this.eventTrigger(APIEventSystem_1.APIEvent.PAUSE, true));
        events.on(APIEventSystem_1.APIEvent.RESUME, (value) => this.eventTrigger(APIEventSystem_1.APIEvent.RESUME, false));
        events.on(APIEventSystem_1.APIEvent.HALT, (value) => this.eventTrigger(APIEventSystem_1.APIEvent.HALT, value));
        events.on(APIEventSystem_1.APIEvent.HIDDEN, (value) => this.eventTrigger(APIEventSystem_1.APIEvent.HIDDEN, value));
        settings.on(APISettingsSystem_1.APISetting.SFX, () => this.setInteractiveSettings(APISettingsSystem_1.APISetting.SFX));
        settings.on(APISettingsSystem_1.APISetting.MUSIC, () => this.setInteractiveSettings(APISettingsSystem_1.APISetting.MUSIC));
    }
    eventTrigger(event, value) {
        if (!this.checkIsLoaded())
            return;
        switch (event) {
            case APIEventSystem_1.APIEvent.PAUSE:
            case APIEventSystem_1.APIEvent.RESUME:
            case APIEventSystem_1.APIEvent.HIDDEN:
                if (this.isEnabled)
                    this.AudioPlayer.setPause(!!value);
                break;
            case APIEventSystem_1.APIEvent.HALT:
                this.AudioPlayer.onHalt();
                break;
            default:
                throw new Error("Unkown Event Called: " + event);
        }
    }
    checkIsLoaded() {
        if (!this.AudioPlayer.isLoadReady)
            return this.AudioPlayer.isLoadReady;
        if (this.isEnabled && !this.isLoaded && !this.isLoading) {
            Logger_1.Logger.logDev("SOUND: Start Loading");
            this.load().then(() => { this.tryStartSound(); });
        }
        return this.isLoaded;
    }
    load() {
        return this.AudioPlayer.startLoading().then(() => { return this.AudioPlayer; });
    }
    tryStartSound() {
        if (!this.player.checkLoadingState()) {
            if (this.loadTimeOutLoop)
                clearTimeout(this.loadTimeOutLoop);
            this.loadTimeOutLoop = setTimeout(() => this.tryStartSound(), 200);
            Logger_1.Logger.logDev("SOUND: Checking if it's complete.");
        }
        else {
            this.loadTimeOutLoop = undefined;
            Logger_1.Logger.logDev("SOUND: Loaded");
            // Done loading, trigger current defined settings.
            NolimitSlotAudio.apiPlugIn.settings.trigger(APISettingsSystem_1.APISetting.SFX);
            NolimitSlotAudio.apiPlugIn.settings.trigger(APISettingsSystem_1.APISetting.MUSIC);
        }
    }
    setInteractiveSettings(event) {
        if (this.updateSoundSetting())
            return;
        if (event == APISettingsSystem_1.APISetting.SFX) {
            if (this.isEnabled)
                this.AudioPlayer.onSfx(this.sfxOn);
            else
                this.AudioPlayer.onSfx(false);
        }
        else if (event == APISettingsSystem_1.APISetting.MUSIC) {
            if (this.isEnabled)
                this.AudioPlayer.onMusic(this.musicOn);
            else
                this.AudioPlayer.onMusic(false);
        }
    }
    updateSoundSetting() {
        if (!this._ignoreClick) {
            if (!this.sfxOn && !this.musicOn)
                this.isEnabled = false;
            if (this.isSettingsModified)
                this.isEnabled = true;
        }
        if (!this.checkIsLoaded()) {
            return true;
        }
        return false;
    }
    setSoundSettings() {
        const isReplay = !!NolimitSlotAudio.apiPlugIn.options.replay;
        const isReplayWithSound = isReplay && !!NolimitSlotAudio.apiPlugIn.options.replay.sound;
        if (isReplayWithSound && !this.isEnabled) {
            this.toggleMute();
            Logger_1.Logger.logDev("SOUND: isReplayWithSound: " + isReplayWithSound);
            return;
        }
        const isMutedInOptions = !!NolimitSlotAudio.apiPlugIn.options.mute;
        if (isMutedInOptions && this.isEnabled) {
            this.toggleMute();
            Logger_1.Logger.logDev("SOUND: isMutedInOptions: " + isMutedInOptions);
            return;
        }
        // Defines Default value if Audio is enabled on device. MOBILE = False, DESKTOP = True;
        const isMobile = NolimitSlotAudio.apiPlugIn.options.device === APIOptions_1.Device.MOBILE;
        if (!isMobile && this.isFirstOpened)
            this.toggleMute();
        if (this.isFirstOpened)
            this.isEnabled = !!(NolimitSlotAudio.apiPlugIn.settings.get(APISettingsSystem_1.APISetting.SFX) || NolimitSlotAudio.apiPlugIn.settings.get(APISettingsSystem_1.APISetting.MUSIC));
    }
    //---------------PUBLIC INTERFACE
    isQuickMute() {
        return !this.isEnabled;
    }
    toggleQuickMute() {
        return this.toggleMute(false);
    }
    toggleMute(usePreSettings = true) {
        this.isEnabled = !this.isEnabled;
        this._ignoreClick = true;
        if (usePreSettings || !this.isSettingsModified) {
            NolimitSlotAudio.apiPlugIn.settings.set(APISettingsSystem_1.APISetting.SFX, this.isEnabled);
            NolimitSlotAudio.apiPlugIn.settings.set(APISettingsSystem_1.APISetting.MUSIC, this.isEnabled);
        }
        else {
            NolimitSlotAudio.apiPlugIn.settings.trigger(APISettingsSystem_1.APISetting.SFX);
            NolimitSlotAudio.apiPlugIn.settings.trigger(APISettingsSystem_1.APISetting.MUSIC);
        }
        this._ignoreClick = false;
        return this.isEnabled;
    }
    pause() {
        this.eventTrigger(APIEventSystem_1.APIEvent.PAUSE, true);
    }
    resume() {
        this.eventTrigger(APIEventSystem_1.APIEvent.RESUME, false);
    }
    //------------------ PLUGIN BUSINESS
    init() {
        return new Promise((resolve, reject) => {
            for (let plugin of NolimitLauncher_1.NolimitLauncher.plugins) {
                if ((0, ApiPlugin_1.isApiPlugin)(plugin)) {
                    NolimitSlotAudio.apiPlugIn = plugin;
                }
            }
            this.setSoundSettings();
            this.addEventListeners();
            resolve(this);
        });
    }
    getReady() {
        return new Promise((resolve, reject) => {
            this.getSoundUrl().then(soundUrl => {
                ajaxPromise.get(soundUrl).json((soundDatas) => {
                    this.AudioPlayer.createPlaylist(this.loadPlayer(soundDatas, soundUrl)).then(() => {
                        this.updateSoundSetting();
                        resolve(this);
                    });
                }).catch(reject);
            }).catch(reject);
        });
    }
    getReadyToStart() {
        return Promise.resolve(this);
    }
    start() {
        return Promise.resolve(this);
    }
    getSoundUrl() {
        return new Promise((resolve, reject) => {
            const config = NolimitSlotAudio.apiPlugIn.resources.getConfig();
            if (config) {
                resolve(config.staticRoot + NolimitSlotAudio.AUDIO_JSON);
            }
            else {
                NolimitSlotAudio.apiPlugIn.events.on(APIEventSystem_1.APIEvent.CONFIG, () => {
                    const config = NolimitSlotAudio.apiPlugIn.resources.getConfig();
                    resolve(config.staticRoot + NolimitSlotAudio.AUDIO_JSON);
                });
            }
        });
    }
    loadPlayer(soundDatas, soundUrl) {
        soundDatas = Array.isArray(soundDatas) ? soundDatas : [soundDatas];
        return Promise.all(soundDatas.map((data) => { return this.processSoundData(soundUrl, data); }));
    }
    processSoundData(url, soundData) {
        const base = this.getBaseUrl(url);
        const deviceSrc = soundData[NolimitSlotAudio.apiPlugIn.options.device] || soundData.src;
        soundData.src = deviceSrc.map((src) => {
            return `${base}/${src}`;
        });
        return soundData;
    }
    getBaseUrl(url) {
        return url.substring(0, url.lastIndexOf('/'));
    }
    playKeypadEffect(name) {
        this.player.playKeypadSound(name);
    }
}
NolimitSlotAudio.AUDIO_JSON = '/resources/sounds/audio.json';
exports.NolimitSlotAudio = NolimitSlotAudio;
//# sourceMappingURL=NolimitSlotAudio.js.map