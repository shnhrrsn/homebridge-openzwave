import { Homebridge } from '../../../types/homebridge'
import { Accessory } from '../Accessory'
import { IZwave } from '../../Zwave/IZwave'
import { Value } from 'openzwave-shared'
import { CommandClass } from '../../Zwave/CommandClass'
import { IValueIndexes } from '../../Values/Indexes/IValueIndexes'
import { AccessoryHintType } from '../../IAccessoryConfig'
import { IValueObservables } from '../../Values/IValueObservables'

export interface IDriverParams {
	hap: Homebridge.Hap
	log: Homebridge.Logger
	commandClass: CommandClass
	accessory: Accessory
	valueObservables: IValueObservables
	prefetchedValues?: Value[]
	indexes: IValueIndexes
	hints: Set<AccessoryHintType>
	zwave: IZwave
}

export default abstract class Driver {
	readonly hap: Homebridge.Hap
	readonly log: Homebridge.Logger
	readonly commandClass: CommandClass
	readonly accessory: Accessory
	readonly valueObservables: IValueObservables
	readonly indexes: IValueIndexes
	readonly hints: Set<string>
	readonly zwave: IZwave

	constructor(params: IDriverParams) {
		this.hap = params.hap
		this.log = params.log
		this.commandClass = params.commandClass
		this.accessory = params.accessory
		this.valueObservables = params.valueObservables
		this.indexes = params.indexes
		this.hints = params.hints
		this.zwave = params.zwave
	}

	abstract ready(): void
	abstract destroy(): void
}
