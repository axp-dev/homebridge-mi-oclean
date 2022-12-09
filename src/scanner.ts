import { Logger } from 'homebridge'
import noble, { Peripheral, startScanningAsync } from '@abandonware/noble'
import { EventEmitter } from 'events'
import { DeviceConfig } from './platform'
import { Device } from './devices/factory'

export class Scanner extends EventEmitter {
    private readonly log: Logger
    private readonly addresses: string[] = []
    private stackWaitAddresses: Set<string>

    constructor(log: Logger) {
        super()

        this.log = log
        this.stackWaitAddresses = new Set()
        this.registerEvents()
    }

    addAddress(address: string) {
        this.addresses.push(this.normalizeAddress(address))
    }

    registerEvents() {
        noble.on('discover', this.onDiscover.bind(this))
        noble.on('scanStart', this.onScanStart.bind(this))
        noble.on('scanStop', this.onScanStop.bind(this))
        noble.on('warning', this.onWarning.bind(this))
        noble.on('stateChange', this.onStateChange.bind(this))
    }

    async start() {
        try {
            this.log.debug('Scanning...')
            this.addresses.forEach((address) => this.stackWaitAddresses.add(this.normalizeAddress(address)))
            await noble.startScanningAsync([], true)
        } catch (error) {
            this.emit('error', error)
        }
    }

    stop() {
        noble.stopScanning()
    }

    async onDiscover(peripheral: Peripheral) {
        if (peripheral.address) {
            const normalizeAddress = this.normalizeAddress(peripheral.address)

            if (this.stackWaitAddresses.has(normalizeAddress)) {
                this.log.debug('device found: ' + peripheral.address)
                this.emit(peripheral.address, peripheral)
                this.stackWaitAddresses.delete(normalizeAddress)
            }
        }

        if (this.stackWaitAddresses.size === 0) {
            this.stop()
        }
    }

    onScanStart(): void {
        this.log.debug('Started scanning.')
    }

    onScanStop(): void {
        this.log.debug('Stopped scanning.')
    }

    onWarning(message: string): void {
        this.log.warn('Warning: ', message)
    }

    onStateChange(state: string): void {
        if (state === 'poweredOn') {
            noble.startScanning([], true)
        } else {
            noble.stopScanning()
        }
    }

    private normalizeAddress(address: string): string {
        return address.replace(':', '').toLowerCase()
    }
}
