import { IAccessoryCommandIndexesRewriteConfig } from '../../IAccessoryConfig'
import { IValueIndexes } from './IValueIndexes'

// An implementation of IValueIndexes that allows for dynamically remapping
// indexes based on provided config
export default class MappedValueIndexes implements IValueIndexes {
	private indexes = new Map<number, number>()

	constructor(indexes: IAccessoryCommandIndexesRewriteConfig) {
		for (const [from, to] of Object.entries(indexes)) {
			this.indexes.set(Number(from), to)
		}
	}

	get(index: number) {
		return this.indexes.get(index) ?? index
	}
}
