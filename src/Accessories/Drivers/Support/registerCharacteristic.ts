import ValueCoordinator, { CoordinateValuesParams } from '../../../Values/ValueCoordinator'
import { IDriverParams } from '../Driver'
import { Value } from 'openzwave-shared'

export type RegisterCharacteristicParams = {
	service: HAPNodeJS.Service
	characteristic: Function
	value: Value
	params: IDriverParams
	options?: Partial<CoordinateValuesParams>
}

export default function registerCharacteristic({
	service,
	characteristic,
	value,
	params,
	options,
}: RegisterCharacteristicParams) {
	const characteristicInstance = service?.getCharacteristic(characteristic)

	if (!characteristicInstance) {
		return
	}

	new ValueCoordinator({
		log: params.log,
		characteristic: characteristicInstance,
		valueId: value,
		valueStream: params.valueStream,
		...options,
	}).start()
}
