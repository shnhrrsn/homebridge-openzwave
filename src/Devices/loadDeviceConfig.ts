import { NodeInfo } from 'openzwave-shared'
import { IAccessoryConfig } from '../IAccessoryConfig'

export default async function loadDeviceConfig(
	nodeInfo: NodeInfo,
): Promise<IAccessoryConfig | undefined> {
	try {
		const config = await import(`./${nodeInfo.manufacturerid}/${nodeInfo.productid}`)
		return config?.default ?? config
	} catch (error) {
		if (error.code === 'MODULE_NOT_FOUND') {
			return undefined
		}

		throw error
	}
}
