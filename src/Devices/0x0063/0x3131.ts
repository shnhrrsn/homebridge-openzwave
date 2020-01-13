import { IAccessoryConfig } from '../../IAccessoryConfig'
import { CommandClass } from '../../Zwave/CommandClass'

// GE 14287 Fan Control Switch
const deviceConfig: IAccessoryConfig = {
	commands: {
		rewrite: [
			{
				from: CommandClass.SWITCH_MULTILEVEL,
				to: CommandClass.VIRTUAL_FAN_MULTILEVEL,
			},
		],
	},
}

export default deviceConfig
