import { ValueType } from './ValueType'

export interface IValueTransformer {
	zwaveToHomeKit(zwaveValue: ValueType): ValueType
	homekitToZwave?(homekitValue: ValueType): ValueType
	isZwaveValid?(zwaveValue: ValueType): boolean
	isHomekitValid?(homekitValue: ValueType): boolean
}
