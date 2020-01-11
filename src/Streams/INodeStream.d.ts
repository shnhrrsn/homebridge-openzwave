import { Observable } from 'rxjs'
import { NodeInfo, Notification } from 'openzwave-shared'
import { IValueStream } from './IValueStream'

export interface INodeIdParams {
	nodeId: number
}

export interface INodeInfoParams {
	nodeId: number
	nodeInfo: NodeInfo
}

export interface INotificationParams {
	nodeId: number
	notification: Notification
	help: string
}

export interface INodeStream extends IValueStream {
	// A new node has been found
	readonly nodeAvailable: Observable<INodeInfoParams>

	// A new node has been added to OpenZWave's list. This may be due to a device being added to the Z-Wave network, or because the application is initializing itself.
	readonly nodeAdded: Observable<INodeIdParams>

	// Basic node information has been received, such as whether the node is a listening device, a routing device and its baud rate and basic, generic and specific types.
	readonly nodeReady: Observable<INodeInfoParams>

	// A node has been removed from OpenZWave's list. This may be due to a device being removed from the Z-Wave network, or because the application is closing.
	readonly nodeRemoved: Observable<INodeIdParams>

	// The Device has been reset and thus removed from the NodeList in OZW
	readonly nodeReset: Observable<INodeIdParams>

	// An error has occurred that we need to report.
	readonly notification: Observable<INotificationParams>
}
