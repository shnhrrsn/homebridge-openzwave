import { CommandClass } from '../../Zwave/CommandClass'
import Driver, { IDriverParams } from '../Drivers/Driver'
import { AccessoryHintType } from '../../IAccessoryConfig'

export type DriverCreator = (params: IDriverParams) => Driver

export interface IDriverRegistry {
	get(commandClass: CommandClass, hints: Set<AccessoryHintType>): DriverCreator | undefined
}
