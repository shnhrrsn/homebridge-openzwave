import { IValueTransformer } from './IValueTransformer'
import { ValueType } from '../ValueType'

export default function multiLevelBinaryTransformer(): IValueTransformer {
	return {
		homekitToZwave(homekitValue: ValueType): ValueType {
			return homekitValue ? 0xff : 0
		},
		zwaveToHomeKit(zwaveValue: ValueType): ValueType {
			return zwaveValue > 0 ? true : false
		},
	}
}
