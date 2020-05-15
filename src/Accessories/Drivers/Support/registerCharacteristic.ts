import ValueCoordinator, { CoordinateValuesParams } from '../../../Values/ValueCoordinator'
import BoundValueStream from '../../../Streams/BoundValueStream'
import makePrefixedLogger from '../../../Support/makePrefixedLogger'
import { Logging, Service } from 'homebridge'

export type RegisterCharacteristicParams = {
	service: Service
	characteristic: Function
	valueStream: BoundValueStream
	log: Logging
	options?: Partial<CoordinateValuesParams>
}

export default function registerCharacteristic({
	service,
	characteristic,
	valueStream,
	log,
	options,
}: RegisterCharacteristicParams) {
	const characteristicInstance = service?.getCharacteristic(characteristic as any)

	if (!characteristicInstance) {
		return
	}

	new ValueCoordinator({
		log: makePrefixedLogger(log, (characteristicInstance as any).displayName),
		valueStream,
		characteristic: characteristicInstance,
		...options,
	}).start()
}
