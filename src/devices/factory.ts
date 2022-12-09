import { DeviceOptions, PlatformAccessory } from '../platform'
import { API, Logger } from 'homebridge'
import { Model } from './models'

export interface Device {
    configureAccessory(accessory: PlatformAccessory): void
    update(): Promise<void>
}

export const createDevice = (
    name: string,
    address: string,
    model: Model,
    options: DeviceOptions,
    log: Logger,
    api: API
) => {
    throw new DeviceError(`Unsupported humidifier model "${model}"`)
}

export class DeviceError extends Error {
    public cause?: Error

    constructor(message: string, cause?: Error) {
        super(message)

        this.cause = cause
    }
}
