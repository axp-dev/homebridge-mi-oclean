import { API, Logger } from 'homebridge'
import { Toothbrush } from './toothbrush'
import { DeviceConfig, DeviceType } from './index'

export const createDevice = (type: DeviceType, config: DeviceConfig, log: Logger, api: API) => {
    if (type === 'toothbrush') {
        return new Toothbrush(config, log, api)
    }

    throw new Error(`Unsupported model type "${type}"`)
}
