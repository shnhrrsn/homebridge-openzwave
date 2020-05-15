import { pluginName, platformName } from './settings'
import Platform from './Platform'
import { API } from 'homebridge'

export default function registerPlatform(homebridge: API) {
	homebridge.registerPlatform(pluginName, platformName, Platform)
}
