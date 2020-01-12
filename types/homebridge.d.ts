import HAPNodeJS from 'hap-nodejs'
import EventEmitter from 'events'

export namespace Homebridge {
	interface Api {
		hap: Hap
		serverVersion: string
		platformAccessory: new (name: string, id: string) => PlatformAccessory

		registerPlatform(
			pluginName: string,
			platformName: string,
			constructor: new () => Platform,
			dynamic: boolean,
		): void

		registerPlatformAccessories(
			pluginName: string,
			platformName: string,
			accessories: PlatformAccessory[],
		): void

		on(event: 'didFinishLaunching', listener: () => void): this
	}

	interface Hap {
		Service: HAPNodeJS.Service
		Characteristic: HAPNodeJS.Characteristic
		uuid: HAPNodeJS.uuid
	}

	interface Platform {
		configureAccessory(accessory: PlatformAccessory): void
	}

	interface Logger {
		debug(msg: string, ...args: any[]): void
		info(msg: string, ...args: any[]): void
		warn(msg: string, ...args: any[]): void
		error(msg: string, ...args: any[]): void
	}

	interface PlatformAccessory extends EventEmitter {
		UUID: string
		addService(service: HAPNodeJS.Service | HAPNodeJS.PredefinedService): HAPNodeJS.Service
		removeService(service: HAPNodeJS.Service): void
		getService(service: string | HAPNodeJS.PredefinedService): HAPNodeJS.Service | undefined
	}
}
