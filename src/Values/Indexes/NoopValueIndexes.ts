import { IValueIndexes } from './IValueIndexes'

// An implementation of IValueIndexes that simply returns the index
// that was requested.
export default class NoopValueIndexes implements IValueIndexes {
	get(index: number) {
		return index
	}
}
