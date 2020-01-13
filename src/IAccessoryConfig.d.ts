import { CommandClass } from './Zwave/CommandClass'

export type AccessoryHintType = 'fan' | 'light'

export interface IAccessoryConfig {
	name?: string
	hints?: AccessoryHintType[]
	ignoredClasses?: CommandClass[]
}
