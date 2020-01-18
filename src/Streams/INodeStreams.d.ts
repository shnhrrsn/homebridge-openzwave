import { NodeInfo, Notification, ControllerState } from 'openzwave-shared'

import { Observable } from 'rxjs'
import { IValueStreams } from './IValueStreams'
import { IZwave } from '../Zwave/IZwave'

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

export interface IControllerCommandParams {
	nodeId: number
	state: ControllerState
	notif: number
	message: string
	command: number
}

export interface INodeStreams extends IValueStreams {
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

	// When Controller Commands are executed, Notifications of Success/Failure etc are communicated via this
	readonly controllerCommand: Observable<IControllerCommandParams>

	// Access to the underlying zwave instance
	readonly zwave: IZwave
}
