import { IAccessoryConfig } from '../IAccessoryConfig'

export default function mergeDeviceConfig(
	lhs: IAccessoryConfig,
	rhs: IAccessoryConfig,
): IAccessoryConfig {
	const merged: IAccessoryConfig = {}
	merged.name = lhs.name ?? rhs.name
	merged.hints = lhs.hints ?? rhs.hints
	merged.commands = {
		ignored: lhs.commands?.ignored ?? rhs.commands?.ignored,
		rewrite: lhs.commands?.rewrite ?? rhs.commands?.rewrite,
	}

	return merged
}
