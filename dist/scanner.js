"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scanner = void 0;
const noble_1 = __importDefault(require("@abandonware/noble"));
const events_1 = require("events");
class Scanner extends events_1.EventEmitter {
    constructor(log, address) {
        var _a;
        super();
        this.log = log;
        this.address = address.replace(':', '').toLowerCase();
        this.log.debug((_a = process.env.inspect) !== null && _a !== void 0 ? _a : 'no env');
        this.registerEvents();
    }
    registerEvents() {
        noble_1.default.on('discover', this.onDiscover.bind(this));
        noble_1.default.on('scanStart', this.onScanStart.bind(this));
        noble_1.default.on('scanStop', this.onScanStop.bind(this));
        noble_1.default.on('warning', this.onWarning.bind(this));
        noble_1.default.on('stateChange', this.onStateChange.bind(this));
    }
    start() {
        try {
            this.log.debug('Scanning...');
            noble_1.default.startScanning([], true);
        }
        catch (error) {
            this.emit('error', error);
        }
    }
    stop() {
        noble_1.default.stopScanning();
    }
    async onDiscover(peripheral) {
        if (peripheral.address) {
            if (peripheral.address.replace(':', '').toLowerCase() == this.address) {
                this.log.debug('device found: ' + peripheral.address);
                const serviceData = peripheral.advertisement.serviceData;
                for (const j in serviceData) {
                    let b = serviceData[j].data;
                    this.emit('updateValues', ...b.values());
                    this.stop();
                }
            }
        }
    }
    onScanStart() {
        this.log.debug('Started scanning.');
    }
    onScanStop() {
        this.log.debug('Stopped scanning.');
    }
    onWarning(message) {
        this.log.warn('Warning: ', message);
    }
    onStateChange(state) {
        if (state === 'poweredOn') {
            noble_1.default.startScanning([], true);
        }
        else {
            noble_1.default.stopScanning();
        }
    }
    onNotify(state) {
        this.log.debug('Characteristics notification received.');
    }
    onDisconnect() {
        this.log.debug(`Disconnected.`);
    }
}
exports.Scanner = Scanner;
//# sourceMappingURL=scanner.js.map