import { Accessory } from '../Accessory'
import { Value } from 'openzwave-shared'
import { IValueStreams } from '../../Streams/IValueStreams'
import { IZwave } from '../../Zwave/IZwave'
import { HAP, Logging } from 'homebridge'

export interface IDriverParams {
	hap: HAP
	log: Logging
	accessory: Accessory
	valueStreams: IValueStreams
	values: Map<number, Value>
	hints: Set<string>
	zwave: IZwave
}

export type Driver = (params: IDriverParams) => void
