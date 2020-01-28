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

		params.valueObservables.additions.subscribe(value => {
			const index = this.indexes.get(value.index)
			this.values.set(index, value)
			this.addValue(index, value)
		})
	}

	abstract addValue(index: number, value: Value): void

	getValue(index: number): Value | undefined {
		return this.values.get(index)
	}

	registerCharacteristic(
		index: number,
		value: Value,
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
			readonly: value.read_only,
			listening: this.accessory.isListeningDevice,
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
