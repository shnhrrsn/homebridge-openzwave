import { IValueTransformer } from './IValueTransformer'
import { ValueType } from '../ValueType'

export default function multiLevelBinaryTransformer(params?: {
	truthy?: boolean | number
	falsey?: boolean | number
}): IValueTransformer {
	const truthy = params?.truthy ?? true
	const falsey = params?.falsey ?? false

	return {
		homekitToZwave(homekitValue: ValueType): ValueType {
			return homekitValue ? 0xff : 0
		},
		zwaveToHomeKit(zwaveValue: ValueType): ValueType {
			return zwaveValue > 0 ? truthy : falsey
		},
	}
}
