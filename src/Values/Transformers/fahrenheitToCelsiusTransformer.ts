import { IValueTransformer } from './IValueTransformer'
import { ValueType } from '../ValueType'

export default function fahrenheitToCelsiusTransformer(): IValueTransformer {
	return {
		homekitToZwave(homekitValue: ValueType): ValueType {
			return Number(homekitValue) * (9 / 5) + 32
		},
		zwaveToHomeKit(zwaveValue: ValueType): ValueType {
			return (Number(zwaveValue) - 32) * (5 / 9)
		},
	}
}
