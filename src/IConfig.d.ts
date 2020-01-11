export type IConfig = {
	zwave?: {
		devicePath?: string
	}
	accessories?: {
		[x in string]: IAccessoryConfig
	}
}

export type IAccessoryConfig = {
	name?: string
	ignoreClasses?: number[]
	values?: {
		[x in string]: number
	}
	hints?: AccessoryHintType[]
}

export type AccessoryHintType = 'fan' | 'light'
