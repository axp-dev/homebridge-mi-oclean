import { API, Logger } from 'homebridge'
import { Device, DeviceConfig } from './index'
import { PlatformAccessory } from '../platform'
import { Bluetooth } from '../providers/bluetooth'

interface ToothbrushProps {
    battery: number
    deviceNumber: string
}

export class Toothbrush implements Device {
    private provider: Bluetooth<ToothbrushProps>
    constructor(
        private readonly config: DeviceConfig,
        private readonly log: Logger,
        private readonly api: API
    ) {
        this.provider = new Bluetooth(config.uuid, log)
        this.provider.addProp({
            name: 'deviceNumber',
            serviceUUID: '180a',
            characteristicUUID: '2a24',
            executor: (buffer) => buffer.toString()
        })
    }

    async update() {
        // await this.provider.getProps()
    }

    configureAccessory(accessory: PlatformAccessory): void {}
}
