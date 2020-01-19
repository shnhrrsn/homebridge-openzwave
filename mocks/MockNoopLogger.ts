import { Homebridge } from '../types/homebridge'

export default class MockNoopLogger implements Homebridge.Logger {
	debug() {}
	info() {}
	warn() {}
	error() {}
}
