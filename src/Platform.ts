import AccessoryManager from './Accessories/AccessoryManager'
import Ozw from './Zwave/Zwave'

import { Homebridge } from '../types/homebridge'
import { IConfig } from './IConfig'
import { Notification, ControllerState } from 'openzwave-shared'

export default class Platform implements Homebridge.Platform {
	log: Homebridge.Logger
	config?: IConfig
	api: Homebridge.Api
	zwave: Ozw
	accessoryManager: AccessoryManager

	constructor(log: Homebridge.Logger, config: IConfig | undefined, api: Homebridge.Api) {
		this.log = log
		this.config = config
		this.api = api
		this.zwave = new Ozw({ ConsoleOutput: false, Logging: false, SaveConfiguration: false })
		this.accessoryManager = new AccessoryManager(this)

		if (!config) {
			this.log.warn('A config.json entry is required. Aborting.')
		} else {
			this.api.on('didFinishLaunching', this.didFinishLaunching.bind(this))
		}
	}

	private didFinishLaunching() {
		if (!this.config?.zwave?.devicePath) {
			this.log.error('Platform unavailable, missing zwave.devicePath in config.')
			return
		}

		this.zwave.on('connected', this.onConnected.bind(this))
		this.zwave.on('driver ready', this.onDriverReady.bind(this))
		this.zwave.on('driver failed', this.onDriverFailed.bind(this))
		this.zwave.on('scan complete', this.onScanComplete.bind(this))
		this.zwave.on('notification', this.onNotification.bind(this))

		this.zwave.connect(this.config.zwave.devicePath)
	}

	configureAccessory(accessory: Homebridge.PlatformAccessory): void {
		this.accessoryManager.restoreAccessory(accessory)
	}

	// OpenZwave

	onConnected(version: string) {
		this.log.debug('onConnected', version)
	}

	onDriverReady(homeId: number) {
		this.log.debug('onDriverReady', homeId)
	}

	onDriverFailed() {
		this.log.error('Unable to connect to device.')
	}

	onScanComplete() {
		this.log.debug('onScanComplete')
	}

	onNotification(nodeId: number, notification: Notification, help: string) {
		if (notification === Notification.Nop) {
			return
		}

		this.log.debug('onNotification', { nodeId, notification, help })
	}
}