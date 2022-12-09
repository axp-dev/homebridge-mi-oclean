"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scanner = void 0;
const noble_1 = __importDefault(require("@abandonware/noble"));
const events_1 = require("events");
class Scanner extends events_1.EventEmitter {
    constructor(log) {
        super();
        this.addresses = [];
        this.log = log;
        this.stackWaitAddresses = new Set();
        this.registerEvents();
    }
    addAddress(address) {
        this.addresses.push(this.normalizeAddress(address));
    }
    registerEvents() {
        noble_1.default.on('discover', this.onDiscover.bind(this));
        noble_1.default.on('scanStart', this.onScanStart.bind(this));
        noble_1.default.on('scanStop', this.onScanStop.bind(this));
        noble_1.default.on('warning', this.onWarning.bind(this));
        noble_1.default.on('stateChange', this.onStateChange.bind(this));
    }
    async start() {
        try {
            this.log.debug('Scanning...');
            this.addresses.forEach((address) => this.stackWaitAddresses.add(this.normalizeAddress(address)));
            await noble_1.default.startScanningAsync([], true);
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
            const normalizeAddress = this.normalizeAddress(peripheral.address);
            if (this.stackWaitAddresses.has(normalizeAddress)) {
                this.log.debug('device found: ' + peripheral.address);
                this.emit(peripheral.address, peripheral);
                this.stackWaitAddresses.delete(normalizeAddress);
            }
        }
        if (this.stackWaitAddresses.size === 0) {
            this.stop();
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
    normalizeAddress(address) {
        return address.replace(':', '').toLowerCase();
    }
}
exports.Scanner = Scanner;
//# sourceMappingURL=scanner.js.map