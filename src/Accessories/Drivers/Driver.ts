import { Homebridge } from '../../../types/homebridge'
import { Accessory } from '../Accessory'
import { IValueStreams } from '../../Streams/IValueStreams'
import { IZwave } from '../../Zwave/IZwave'
import { Value } from 'openzwave-shared'

export interface IDriverParams {
	hap: Homebridge.Hap
	log: Homebridge.Logger
	accessory: Accessory
	valueStreams: IValueStreams
	values: Map<number, Value>
	hints: Set<string>
	zwave: IZwave
}

export default abstract class Driver {
	hap: Homebridge.Hap
	log: Homebridge.Logger
	accessory: Accessory
	valueStreams: IValueStreams
	hints: Set<string>
	zwave: IZwave

	constructor(params: IDriverParams) {
		this.hap = params.hap
		this.log = params.log
		this.accessory = params.accessory
		this.valueStreams = params.valueStreams
		this.hints = params.hints
		this.zwave = params.zwave
	}

	abstract ready(): void
	abstract destroy(): void
}
