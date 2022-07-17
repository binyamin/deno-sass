import { colors, path, sass } from '../deps.ts';

function prettyUrl(url: URL): string {
	return path.relative(Deno.cwd(), path.fromFileUrl(url));
}

// TODO implement `verbose` option
function createLogger(
	opts: Pick<
		sass.Options<'sync'>,
		| 'alertAscii'
		| 'alertColor'
		| 'verbose'
	>,
): sass.Logger {
	const color = opts.alertColor ?? colors.getColorEnabled();

	return {
		warn(message, options) {
			let msg = '';

			if (color) {
				msg += colors.bold(colors.yellow(
					options.deprecation ? 'Deprecation Warning' : 'Warning',
				));
			} else {
				msg += (
					options.deprecation ? 'Deprecation Warning' : 'Warning'
				).toUpperCase();
			}

			if (!options.span) {
				msg += ': ' + message + '\n';
			} else if (options.stack) {
				msg += `: ${message}\n\n${options.span.text}\n`;
			} else {
				msg += ` on \n${message}\n`;
			}

			if (options.stack) {
				msg += ' '.repeat(4) + options.stack.trimEnd() + '\n';
			}

			console.error(msg);
		},
		debug(message, options) {
			const url = options.span.url ? prettyUrl(options.span.url) : '-';

			console.error(
				`${url}:${options.span.start.line + 1}`,
				(color ? colors.bold('Debug') : 'DEBUG') + ':',
				message,
			);
		},
	};
}

export default createLogger;
