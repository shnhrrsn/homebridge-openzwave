import { pluginName, platformName } from './settings'
import Platform from './Platform'
import { Homebridge } from '../types/homebridge'

export default function registerPlatform(homebridge: Homebridge.Api) {
	homebridge.registerPlatform(pluginName, platformName, Platform as any, true)
}
