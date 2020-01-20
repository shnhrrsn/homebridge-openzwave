import Driver, { IDriverParams } from './Driver'
import BoundValueStream from '../../Streams/BoundValueStream'
import ValueCoordinator, { CoordinateValuesParams } from '../../Values/ValueCoordinator'
import makePrefixedLogger from '../../Support/makePrefixedLogger'
import { Value } from 'openzwave-shared'

export interface RegisterCharacteristicParams {
	service: HAPNodeJS.Service
	characteristic: Function
	valueStream: BoundValueStream
	options?: Partial<CoordinateValuesParams>
}

export default class ManagedDriver extends Driver {
	private values: Map<number, Value>

	constructor(params: IDriverParams) {
		super(params)

		this.values = params.values
	}

	getValue(index: number): Value | undefined {
		return this.values.get(index)
	}

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
