import {
    API,
    DynamicPlatformPlugin,
    Logger,
    PlatformAccessory as PlatformAccessoryBase,
    PlatformConfig as PlatformConfigBase,
    Service,
    Characteristic
} from 'homebridge'

import { PLATFORM_NAME, PLUGIN_NAME } from './settings'
import { createDevice, Device } from './devices/factory'
import { Model } from './devices/models'

export type DeviceOptions = {}

export type DeviceConfig = {
    name: string
    address: string
    updateInterval: number
    disabled: boolean
    model: Model
} & DeviceOptions

export type AccessoryContext = {
    address: string
}

type PlatformConfig = {
    platform: string
    devices: DeviceConfig[]
}

export type PlatformAccessory = PlatformAccessoryBase<AccessoryContext>

export class MiOcleanPlatform implements DynamicPlatformPlugin {
    public readonly Service: typeof Service = this.api.hap.Service
    public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic

    public readonly accessories: Map<string, PlatformAccessory>
    public readonly devices: Map<string, Device>

    public readonly config: PlatformConfigBase
    public readonly log: Logger

    constructor(log: Logger, config: PlatformConfigBase, public readonly api: API) {
        this.log = log
        this.config = config as PlatformConfig
        this.accessories = new Map()
        this.devices = new Map()

        this.log.debug('Finished initializing platform:', this.config.name)
        this.api.on('didFinishLaunching', this.didFinishLaunching.bind(this))
    }

    configureAccessory(accessory: PlatformAccessory): void {
        this.log.info('Loading accessory from cache:', accessory.displayName)

        this.accessories.set(accessory.context.address, accessory)
    }

    async didFinishLaunching(): Promise<void> {
        if (!Array.isArray(this.config.devices)) {
            this.log.error(`Invalid "devices" value, expected array`)
            return
        }

        for (const config of this.config.devices) {
            if (config.disabled) {
                const accessory = this.accessories.get(config.address)

                if (accessory) {
                    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory])
                }
                continue
            }

            const { name, address, model, ...options } = config

            let device: Device

            try {
                device = await createDevice(name, address, model, options, this.log, this.api)
            } catch (err) {
                this.log.error(`Fail to initialize oclean device. ${err}`)
                continue
            }

            let accessory: PlatformAccessory

            if (this.accessories.has(address)) {
                accessory = this.accessories.get(address)!
            } else {
                this.log.info(`Registering new device with MAC "${address}".`)

                accessory = new this.api.platformAccessory(name, this.api.hap.uuid.generate(address))
                accessory.context = { address }

                this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory])
            }

            device.configureAccessory(accessory)

            this.devices.set(address, device)

            const update = this.update(address)
            setInterval(update, config.updateInterval * 1000 || 30000)

            await update()
        }

        this.accessories.forEach((accessory, address) => {
            if (!this.config.devices.find((it) => it.address === address)) {
                this.log.warn(
                    `Unregistering device with MAC "${address}" because it wasn't found in config.json`
                )

                this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory])
            }
        })
    }

    private update(address: string): () => Promise<void> {
        return async () => {
            const device = this.devices.get(address)

            if (!device) {
                this.log.warn(`Can't find Oclean device object for the device with MAC "${address}".`)
                return
            }

            try {
                await device.update()
            } catch (err) {
                this.log.error(`Fail to update characteristics of the device with MAC "${address}".`)
            }
        }
    }
}
