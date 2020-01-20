import { IAccessoryConfig } from './IAccessoryConfig'

export type IConfig = {
	zwave?: {
		devicePath?: string
	}
	accessories?: {
		[x in string]: IAccessoryConfig | false
	}
	uuidPrefix?: string
	databasePath?: string
}
