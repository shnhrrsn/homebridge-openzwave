export default function wait(timeoutInterval): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, timeoutInterval))
}
