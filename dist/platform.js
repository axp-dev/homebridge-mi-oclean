"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiOcleanPlatform = void 0;
const settings_1 = require("./settings");
const factory_1 = require("./devices/factory");
const scanner_1 = require("./scanner");
class MiOcleanPlatform {
    constructor(log, config, api) {
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        this.log = log;
        this.config = config;
        this.accessories = new Map();
        this.devices = new Map();
        this.scanner = new scanner_1.Scanner(log);
        this.log.debug('Finished initializing platform:', this.config.name);
        this.api.on('didFinishLaunching', this.didFinishLaunching.bind(this));
    }
    configureAccessory(accessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);
        this.accessories.set(accessory.context.address, accessory);
    }
    async didFinishLaunching() {
        if (!Array.isArray(this.config.devices)) {
            this.log.error(`Invalid "devices" value, expected array`);
            return;
        }
        for (const config of this.config.devices) {
            if (config.disabled) {
                const accessory = this.accessories.get(config.address);
                if (accessory) {
                    this.api.unregisterPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [accessory]);
                }
                continue;
            }
            const { name, address, model } = config;
            let device;
            try {
                device = (0, factory_1.createDevice)(model, config, this.scanner, this.log, this.api);
            }
            catch (err) {
                this.log.error(`Fail to initialize oclean device. ${err}`);
                continue;
            }
            let accessory;
            if (this.accessories.has(address)) {
                accessory = this.accessories.get(address);
            }
            else {
                this.log.info(`Registering new device with MAC "${address}".`);
                accessory = new this.api.platformAccessory(name, this.api.hap.uuid.generate(address));
                accessory.context = { address };
                this.api.registerPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [accessory]);
            }
            device.configureAccessory(accessory);
            this.devices.set(address, device);
            this.scanner.addAddress(address);
            const update = this.update(address);
            setInterval(update, config.updateInterval * 1000 || 30000);
            await update();
        }
        this.accessories.forEach((accessory, address) => {
            if (!this.config.devices.find((it) => it.address === address)) {
                this.log.warn(`Unregistering device with MAC "${address}" because it wasn't found in config.json`);
                this.api.unregisterPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [accessory]);
            }
        });
    }
    update(address) {
        return async () => {
            const device = this.devices.get(address);
            if (!device) {
                this.log.warn(`Can't find Oclean device object for the device with MAC "${address}".`);
                return;
            }
            try {
                await this.scanner.start();
            }
            catch (err) {
                this.log.error(`Fail to update characteristics of the device with MAC "${address}".`);
            }
        };
    }
}
exports.MiOcleanPlatform = MiOcleanPlatform;
//# sourceMappingURL=platform.js.map