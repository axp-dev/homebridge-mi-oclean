import { PlatformAccessory } from '../platform'

export enum DeviceType {
    TOOTHBRUSH = 'toothbrush'
}

export type DeviceConfig = {
    name: string
    uuid: string
    updateInterval: number
    disabled: boolean
    type: DeviceType
} & DeviceOptions

export type DeviceOptions = {}

export interface Device {
    update(): void
    configureAccessory(accessory: PlatformAccessory): void
}
