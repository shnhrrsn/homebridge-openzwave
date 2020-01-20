import { CommandClass } from '../../Zwave/CommandClass'
import Driver, { IDriverParams } from '../Drivers/Driver'

export type IDriverRegistry = Map<CommandClass, (params: IDriverParams) => Driver>
