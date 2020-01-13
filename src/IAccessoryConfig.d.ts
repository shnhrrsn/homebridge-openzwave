import { CommandClass } from './Zwave/CommandClass'

export type AccessoryHintType = 'fan' | 'light'

export interface IAccessoryConfig {
	name?: string
	hints?: AccessoryHintType[]
	commands?: {
		ignored?: CommandClass[]
		rewrite?: IAccessoryCommandRewriteConfig[]
	}
}

export interface IAccessoryCommandRewriteConfig {
	from: CommandClass
	to: CommandClass
}
