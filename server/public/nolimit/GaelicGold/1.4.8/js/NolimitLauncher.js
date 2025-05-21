"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NolimitLauncher = exports.LauncherSettings = void 0;
const NolimitApplication_1 = require("./NolimitApplication");
const NolimitAutoPlayPlugin_1 = require("./plugins/concreteplugins/NolimitAutoPlayPlugin");
const NolimitApiPlugin_1 = require("./plugins/apiplugin/NolimitApiPlugin");
const AnalyticsIntegrationPlugin_1 = require("./plugins/concreteplugins/AnalyticsIntegrationPlugin");
const GuiPlugin_1 = require("./gui/plugin/GuiPlugin");
const Logger_1 = require("./utils/Logger");
class LauncherSettings {
    constructor() {
        this.log = Logger_1.LogLevel.DEV;
        this.maxResolution = 2;
        this.maxResolutionReplay = 2;
    }
}
exports.LauncherSettings = LauncherSettings;
class NolimitLauncher {
    static get instance() {
        if (this._instance == undefined) {
            this._instance = new NolimitLauncher();
        }
        return this._instance;
    }
    static get defaultResourcePath() {
        return "/node_modules/@nolimitcity/slot-launcher/resources/default/";
    }
    constructor() {
        this.settings = new LauncherSettings();
        this.logger = new Logger_1.NamedLogger("NolimitLauncher");
        this.logger.level = this.settings.log;
        NolimitLauncher.plugins = [];
        NolimitLauncher.apiPlugin = new NolimitApiPlugin_1.NolimitApiPlugin();
        NolimitLauncher.plugins.push(NolimitLauncher.apiPlugin);
        NolimitLauncher.plugins.push(new NolimitApplication_1.NolimitApplication());
        NolimitLauncher.plugins.push(new NolimitAutoPlayPlugin_1.NolimitAutoPlayPlugin());
        NolimitLauncher.plugins.push(new AnalyticsIntegrationPlugin_1.AnalyticsIntegrationPlugin());
        NolimitLauncher.plugins.push(new GuiPlugin_1.GuiPlugin());
    }
    destroy() {
        for (let i = 0; i < NolimitLauncher.plugins.length; i++) {
            if (NolimitLauncher.plugins[i].name == "NolimitApplication") {
                const app = NolimitLauncher.plugins[i];
                if (app.destroy) {
                    app.destroy();
                }
                NolimitLauncher.plugins.splice(i, 1);
                break;
            }
        }
        while (NolimitLauncher.plugins.length > 0) {
            let plugin = NolimitLauncher.plugins.pop();
            if (plugin === null || plugin === void 0 ? void 0 : plugin.destroy) {
                plugin.destroy();
            }
        }
        NolimitLauncher.plugins = [];
        if (this._destructionCallback != undefined) {
            this._destructionCallback();
        }
        NolimitLauncher._instance = undefined;
    }
    static destroy() {
        if (NolimitLauncher._instance) {
            NolimitLauncher._instance.destroy();
        }
    }
    setDestructionCallback(cb) {
        this._destructionCallback = cb;
    }
    removePlugin(pluginToRemove) {
        for (let i = 0; i < NolimitLauncher.plugins.length; i++) {
            const plugin = NolimitLauncher.plugins[i];
            if (pluginToRemove == plugin) {
                NolimitLauncher.plugins.splice(i, 1);
                return;
            }
        }
    }
    launch(plugins) {
        NolimitLauncher.plugins = NolimitLauncher.plugins.concat(plugins);
        this._allPluginNames = [];
        const promises = [];
        for (let plugin of NolimitLauncher.plugins) {
            this._allPluginNames.push(plugin.name);
            promises.push(plugin.init().then((value) => this.logValue(value, "loaded")));
        }
        this.resetPromisesLeft("init");
        const launch = Promise.all(promises);
        launch.then((value) => this.onLoaded(value), (reason) => this.onFail(reason));
    }
    onLoaded(plugins) {
        if (this._loadError != undefined) {
            return;
        }
        this.logger.log("initComplete");
        const promises = [];
        for (let plugin of plugins) {
            promises.push(plugin.getReady().then((value) => this.logValue(value, "ready")));
        }
        this.resetPromisesLeft("getReady");
        const ready = Promise.all(promises);
        ready.then((value) => this.onReady(value), (reason) => this.onFail(reason));
    }
    onReady(plugins) {
        if (this._loadError != undefined) {
            return;
        }
        this.logger.log("getReadyComplete");
        const promises = [];
        for (let plugin of plugins) {
            promises.push(plugin.getReadyToStart().then((value) => this.logValue(value, "onReadyToStart")));
        }
        this.resetPromisesLeft("getReadyToStart");
        const start = Promise.all(promises);
        start.then((value) => this.onReadyToStart(value), (reason) => this.onFail(reason));
    }
    onReadyToStart(plugins) {
        if (this._loadError != undefined) {
            return;
        }
        this.logger.log("getReadyToStartComplete");
        const promises = [];
        for (let plugin of plugins) {
            promises.push(plugin.start().then((value) => this.logValue(value, "start")));
        }
        this.resetPromisesLeft("start");
        const start = Promise.all(promises);
        start.then((value) => this.onStart(value), (reason) => this.onFail(reason));
    }
    onStart(value) {
        if (this._loadError != undefined) {
            return;
        }
        NolimitLauncher.started = true;
        this.logger.log("startComplete");
        NolimitLauncher.apiPlugin.startGame();
    }
    onFail(reason) {
        this._loadError = reason;
        console.log(reason);
        NolimitLauncher.apiPlugin.error.trigger(reason.message, reason.code);
    }
    logValue(plugin, message) {
        if (this.settings.log != Logger_1.LogLevel.NONE) {
            this._promisesLeft.pluginsLeft.splice(this._promisesLeft.pluginsLeft.indexOf(plugin.name), 1);
            this.logger.log(`Plugins left in phase (${this._promisesLeft.phase}): `, this._promisesLeft.pluginsLeft);
        }
        return plugin;
    }
    resetPromisesLeft(phase) {
        this._promisesLeft = {
            phase: phase,
            pluginsLeft: this._allPluginNames.concat()
        };
    }
}
NolimitLauncher.started = false;
exports.NolimitLauncher = NolimitLauncher;
//# sourceMappingURL=NolimitLauncher.js.map