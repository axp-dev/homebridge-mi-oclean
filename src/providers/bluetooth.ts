import { Logger } from 'homebridge'
import noble from '@abandonware/noble'

export type PropRecord = {
    name: string
    serviceUUID: string
    characteristicUUID: string
    executor: (buffer: Buffer) => unknown
}

export class Bluetooth<GetResultType extends Object> {
    private props: PropRecord[] = []

    constructor(private readonly uuid: string, private readonly log: Logger) {
        this.props.push({
            name: 'battery',
            serviceUUID: '180f',
            characteristicUUID: '2a19',
            executor: (buffer) => buffer[0]
        })
    }

    addProp(prop: PropRecord) {
        this.props.push(prop)
    }

    getProps(): Promise<GetResultType> {
        noble.startScanning([], false)

        return new Promise((resolve) => {
            noble.on('discover', async (peripheral) => {
                if (peripheral.uuid !== this.uuid) {
                    return
                }

                this.log.debug(`Device found with UUID "${this.uuid}"`)

                await noble.stopScanningAsync()
                await peripheral.connectAsync()

                const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
                    this.props.map((prop) => prop.serviceUUID),
                    this.props.map((prop) => prop.characteristicUUID)
                )

                let result = {}

                for (let index = 0; index < characteristics.length; index++) {
                    const characteristic = characteristics[index]
                    const name = this.props[index].name
                    const executor = this.props[index].executor

                    result[name] = await executor(await characteristic.readAsync())
                }

                await peripheral.disconnectAsync()

                resolve(result as GetResultType)
            })
        })
    }
}
