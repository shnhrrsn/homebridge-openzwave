import { IValueTransformer } from './IValueTransformer'
import { ValueType } from '../ValueType'

// An implementation of ValueTransformer that simply
// passes through values 1:1
const NoopValueTransformer: IValueTransformer = {
	homekitToZwave(homekitValue: ValueType): ValueType {
		return homekitValue
	},
	zwaveToHomeKit(zwaveValue: ValueType): ValueType {
		return zwaveValue
	},
}

export default NoopValueTransformer
