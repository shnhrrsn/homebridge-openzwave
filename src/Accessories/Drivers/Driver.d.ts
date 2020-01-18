import { Homebridge } from '../../../types/homebridge'
import { Accessory } from '../Accessory'
import { Value } from 'openzwave-shared'
import { IValueStreams } from '../../Streams/IValueStreams'
import { IZwave } from '../../Zwave/IZwave'

export interface IDriverParams {
	hap: Homebridge.Hap
	log: Homebridge.Logger
	accessory: Accessory
	valueStreams: IValueStreams
	values: Map<number, Value>
	hints: Set<string>
	zwave: IZwave
}

export type Driver = (params: IDriverParams) => void
