import Driver from './Driver'
import BoundValueStream from '../../Streams/BoundValueStream'
import ValueCoordinator, { CoordinateValuesParams } from '../../Values/ValueCoordinator'
import makePrefixedLogger from '../../Support/makePrefixedLogger'

export interface RegisterCharacteristicParams {
	service: HAPNodeJS.Service
	characteristic: Function
	valueStream: BoundValueStream
	options?: Partial<CoordinateValuesParams>
}

export default class ManagedDriver extends Driver {
	registerCharacteristic({
		service,
		characteristic,
		valueStream,
		options,
	}: RegisterCharacteristicParams) {
		const characteristicInstance = service?.getCharacteristic(characteristic)

		if (!characteristicInstance) {
			return
		}

		new ValueCoordinator({
			log: makePrefixedLogger(this.log, (characteristicInstance as any).displayName),
			valueStream,
			characteristic: characteristicInstance,
			...options,
		}).start()
	}

	ready(): void {
		// TODO
	}

	destroy(): void {
		// TODO
	}
}
