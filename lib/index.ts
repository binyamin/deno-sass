import { path, sass } from '../deps.ts';
import createImporter from './create-importer.ts';
import createLogger from './create-logger.ts';

export function compile(filepath: string, options: sass.Options<'sync'> = {}) {
	options.importers ??= [];
	options.importers.push(
		createImporter(path.dirname(filepath)),
	);

	if (options.loadPaths && options.loadPaths.length > 0) {
		options.importers.push(
			...options.loadPaths.map((p) => createImporter(p)),
		);
	}

	options.logger ??= createLogger({
		alertColor: options.alertColor,
		alertAscii: options.alertAscii,
		verbose: options.verbose,
	});

	return sass.compile(filepath, options);
}

export function compileString(
	source: string,
	options: sass.StringOptions<'sync'> = {},
) {
	options.importers ??= [];

	if (options.loadPaths && options.loadPaths.length > 0) {
		options.importers.push(
			...options.loadPaths.map((p) => createImporter(p)),
		);
	}

	options.logger ??= createLogger({
		alertColor: options.alertColor,
		alertAscii: options.alertAscii,
		verbose: options.verbose,
	});

	return sass.compileString(source, {
		...options,
		importer: createImporter(
			options.url ? path.dirname(path.fromFileUrl(options.url)) : Deno.cwd(),
		),
	});
}

export type Options<sync extends 'sync' | 'async'> = sass.Options<sync>;
export type StringOptions<sync extends 'sync' | 'async'> = sass.StringOptions<
	sync
>;
