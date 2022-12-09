import { Device } from './factory'
import { DeviceConfig, PlatformAccessory } from '../platform'
import { API, Logger } from 'homebridge'
import { Scanner } from '../scanner'
import { Peripheral } from '@abandonware/noble'

export class Toothbrush implements Device {
    constructor(
        private readonly config: DeviceConfig,
        private readonly scanner: Scanner,
        private readonly log: Logger,
        private readonly api: API
    ) {
        scanner.on(config.address, this.update.bind(this))
    }

    async update(peripheral: Peripheral) {
        const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
            [peripheral.uuid],
            ['2a19']
        )
        const batteryLevel = (await characteristics[0].readAsync())[0]

        this.log.warn(`${peripheral.address} (${peripheral.advertisement.localName}): ${batteryLevel}%`)
    }

    configureAccessory(accessory: PlatformAccessory): void {}
}
