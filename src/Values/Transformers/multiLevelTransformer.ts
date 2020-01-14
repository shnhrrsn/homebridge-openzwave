import { IValueTransformer } from './IValueTransformer'
import { ValueType } from '../ValueType'

export default function multiLevelTransformer(): IValueTransformer {
	return {
		homekitToZwave(homekitValue: ValueType): ValueType {
			return Math.min(99, Math.max(0, Number(homekitValue)))
		},
		zwaveToHomeKit(zwaveValue: ValueType): ValueType {
			return zwaveValue >= 99 ? 100 : Math.min(99, Math.max(0, Number(zwaveValue)))
		},
		isZwaveValid(zwaveValue: ValueType) {
			return zwaveValue !== 0xff
		},
	}
}
