import { Logging, LogLevel } from 'homebridge'

export default class MockNoopLogger implements Logging {
	prefix: string
	log(level: LogLevel, message: string, ...parameters: any[]): void {}
	debug() {}
	info() {}
	warn() {}
	error() {}
}
