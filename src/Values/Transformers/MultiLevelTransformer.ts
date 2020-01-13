import { IValueTransformer } from './IValueTransformer'
import { ValueType } from '../ValueType'

const MultiLevelTransformer: IValueTransformer = {
	homekitToZwave(homekitValue: ValueType): ValueType {
		return homekitValue
	},
	zwaveToHomeKit(zwaveValue: ValueType): ValueType {
		return Math.min(99, Math.max(0, Number(zwaveValue)))
	},
	isZwaveValid(zwaveValue: ValueType) {
		return zwaveValue != 0xff
	},
}

export default MultiLevelTransformer
