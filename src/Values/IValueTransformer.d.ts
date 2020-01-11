import { ValueType } from './ValueType'

export interface IValueTransformer {
	homekitToZwave(homekitValue: ValueType): ValueType
	zwaveToHomeKit(zwaveValue: ValueType): ValueType
	isZwaveValid?(zwaveValue: ValueType): boolean
	isHomekitValid?(homekitValue: ValueType): boolean
}
