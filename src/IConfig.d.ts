export type IConfig = {
	zwave?: {
		devicePath?: string
	}
	accessories?: {
		[x in string]: IAccessoryConfig | false
	}
	uuidPrefix?: string
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
