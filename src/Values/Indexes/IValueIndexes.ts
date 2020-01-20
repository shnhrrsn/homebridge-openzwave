// An interface to map value indexes
// This allows implementers to only have to work with the static indexes
// for their specific commands, while allowing the platform to remap them
// dynamically when neccessary.
export interface IValueIndexes {
	// Returns the value index for the requested index
	get(index: number): number
}
