import { IDriverRegistry } from './IDriverRegistry'
import { CommandClass } from '../../Zwave/CommandClass'
import { AccessoryHintType } from '../../IAccessoryConfig'
import Driver, { IDriverParams } from '../Drivers/Driver'

export interface IRegisterableDriverRegistry extends IDriverRegistry {
	register(commandClass: CommandClass, driverCreator: new (params: IDriverParams) => Driver): void
	remap(
		hint: AccessoryHintType,
		fromCommandClass: CommandClass,
		toCommandClass: CommandClass,
	): void
}
