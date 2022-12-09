"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceError = exports.createDevice = void 0;
const toothbrush_1 = require("./toothbrush");
const createDevice = (model, options, scanner, log, api) => {
    if (model === 'toothbrush') {
        return new toothbrush_1.Toothbrush(options, scanner, log, api);
    }
    throw new DeviceError(`Unsupported humidifier model "${model}"`);
};
exports.createDevice = createDevice;
class DeviceError extends Error {
    constructor(message, cause) {
        super(message);
        this.cause = cause;
    }
}
exports.DeviceError = DeviceError;
//# sourceMappingURL=factory.js.map