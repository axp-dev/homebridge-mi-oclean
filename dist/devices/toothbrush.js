"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toothbrush = void 0;
class Toothbrush {
    constructor(config, scanner, log, api) {
        this.config = config;
        this.scanner = scanner;
        this.log = log;
        this.api = api;
        scanner.on(config.address, this.update.bind(this));
    }
    async update(peripheral) {
        const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync([peripheral.uuid], ['2a19']);
        const batteryLevel = (await characteristics[0].readAsync())[0];
        this.log.warn(`${peripheral.address} (${peripheral.advertisement.localName}): ${batteryLevel}%`);
    }
    configureAccessory(accessory) { }
}
exports.Toothbrush = Toothbrush;
//# sourceMappingURL=toothbrush.js.map