import { DeviceConfig, PlatformAccessory } from '../platform'
import { API, Logger } from 'homebridge'
import { Model } from './models'
import { Toothbrush } from './toothbrush'
import { Scanner } from '../scanner'

export interface Device {
    configureAccessory(accessory: PlatformAccessory): void
}

export const createDevice = (
    model: Model,
    options: DeviceConfig,
    scanner: Scanner,
    log: Logger,
    api: API
) => {
    if (model === 'toothbrush') {
        return new Toothbrush(options, scanner, log, api)
    }

    throw new DeviceError(`Unsupported humidifier model "${model}"`)
}

export class DeviceError extends Error {
    public cause?: Error

    constructor(message: string, cause?: Error) {
        super(message)

        this.cause = cause
    }
}
