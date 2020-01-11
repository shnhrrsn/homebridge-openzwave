import { CommandClass } from '../../Zwave/CommandClass'
import { Driver } from '../Drivers/Driver'

export type IDriverRegistry = Map<CommandClass, Driver>
