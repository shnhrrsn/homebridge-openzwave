import { IValueTransformer } from './IValueTransformer'
import { ValueType } from '../ValueType'

// An implementation of ValueTransformer that simply
// passes through values 1:1
export default function noopValueTransformer(): IValueTransformer {
	return {
		homekitToZwave(homekitValue: ValueType): ValueType {
			return homekitValue
		},
		zwaveToHomeKit(zwaveValue: ValueType): ValueType {
			return zwaveValue
		},
	}
}
