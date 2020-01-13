import { NodeInfo } from 'openzwave-shared'
import { IAccessoryConfig } from '../IAccessoryConfig'

export default async function loadDeviceConfig(
	nodeInfo: NodeInfo,
): Promise<IAccessoryConfig | undefined> {
	try {
		return await import(`./${nodeInfo.manufacturerid}/${nodeInfo.productid}`)
	} catch (error) {
		if (error.code === 'MODULE_NOT_FOUND') {
			return undefined
		}

		throw error
	}
}
