"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceError = exports.createDevice = void 0;
const createDevice = (name, address, model, options, log, api) => {
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