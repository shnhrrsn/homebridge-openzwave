import { Homebridge } from '../../../types/homebridge'
import { Accessory } from '../Accessory'
import { Value } from 'openzwave-shared'
import { IValueStream } from '../../Streams/IValueStream'
import Ozw from '../../Zwave/Zwave'

export interface IDriverParams {
	hap: Homebridge.Hap
	log: Homebridge.Logger
	accessory: Accessory
	valueStream: IValueStream
	values: Map<number, Value>
	hints: Set<string>
	zwave: Ozw
}

export type Driver = (params: IDriverParams) => void
