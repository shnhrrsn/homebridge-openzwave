export default function config() {
	return {
		compileEnhancements: false,
		extensions: ['ts'],
		require: ['./utils/shared/bootstrap.js'],
		files: ['test/**/*', '!test/helpers'],
	}
}
