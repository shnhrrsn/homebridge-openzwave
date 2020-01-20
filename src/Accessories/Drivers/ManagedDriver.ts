import Driver, { IDriverParams } from './Driver'
import BoundValueStream from '../../Streams/BoundValueStream'
import ValueCoordinator, { CoordinateValuesParams } from '../../Values/ValueCoordinator'
import makePrefixedLogger from '../../Support/makePrefixedLogger'
import { Value } from 'openzwave-shared'

export interface RegisterCharacteristicParams {
	service?: HAPNodeJS.Service
	characteristic: Function
	valueStream: BoundValueStream
	options?: Partial<CoordinateValuesParams>
}

export default abstract class ManagedDriver extends Driver {
	private values = new Map<number, Value>()

	constructor(params: IDriverParams) {
		super(params)

		for (const value of params.values ?? []) {
			const index = this.indexes.get(value.index)
			this.values.set(index, value)
			this.addValue(index, value)
		}
	}

	abstract addValue(index: number, value: Value): void

	getValue(index: number): Value | undefined {
		return this.values.get(index)
	}

	registerCharacteristic(
		index: number,
		{ service, characteristic, valueStream, options }: RegisterCharacteristicParams,
	) {
		if (!service) {
			return
		}

		const characteristicInstance = service.getCharacteristic(characteristic)

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
