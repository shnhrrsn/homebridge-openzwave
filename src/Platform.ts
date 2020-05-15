import AccessoryManager from './Accessories/AccessoryManager'
import Zwave from './Zwave/Zwave'

import { IConfig } from './IConfig'
import { Notification } from 'openzwave-shared'
import { Logging, API, DynamicPlatformPlugin, PlatformAccessory, PlatformConfig } from 'homebridge'

export default class Platform implements DynamicPlatformPlugin {
	log: Logging
	config?: IConfig
	api: API
	zwave: Zwave
	accessoryManager: AccessoryManager

	constructor(log: Logging, config: PlatformConfig, api: API) {
		this.log = log
		this.config = config as IConfig
		this.api = api
		this.zwave = new Zwave(this.log, {
			ConsoleOutput: false,
			Logging: false,
			SaveConfiguration: false,
		})
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

		this.zwave.ozw.on('connected', this.onConnected.bind(this))
		this.zwave.ozw.on('driver ready', this.onDriverReady.bind(this))
		this.zwave.ozw.on('driver failed', this.onDriverFailed.bind(this))
		this.zwave.ozw.on('scan complete', this.onScanComplete.bind(this))
		this.zwave.ozw.on('notification', this.onNotification.bind(this))

		this.zwave.ozw.connect(this.config.zwave.devicePath)
	}

	configureAccessory(accessory: PlatformAccessory): void {
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
		this.log.info('Finished Scanning')
		this.accessoryManager.purge()
	}

	onNotification(nodeId: number, notification: Notification, help: string) {
		if (notification === Notification.Nop) {
			return
		}

		this.log.debug('onNotification', { nodeId, notification, help })
	}
}
