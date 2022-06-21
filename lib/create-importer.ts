import { path, sass } from '../deps.ts';

function fileExists(url: string): boolean {
	try {
		const stat = Deno.statSync(url);
		return stat.isFile;
	} catch (_error) {
		return false;
	}
}

function getFiles(url: string): string[] {
	const stem = path.basename(url);
	const ext = path.extname(stem);

	const files = [];

	if (['.scss', '.sass', '.css'].includes(ext) === false) {
		files.push(...[
			stem + '.scss',
			`_${stem}.scss`,
			stem + '.sass',
			`_${stem}.sass`,
		]);
	} else {
		files.push(stem, '_' + stem);
	}

	const results = [];

	for (const file of files) {
		const fullpath = path.join(path.dirname(url), file);

		if (fileExists(fullpath)) {
			results.push(fullpath);
		}
	}

	return results;
}

function createImporter(root: string): sass.Importer<'sync'> {
	return ({
		canonicalize(url) {
			if (url.startsWith('file://')) {
				url = url.replace('file://', '');
			}

			const file = url.startsWith(path.resolve(root))
				? url
				: path.isAbsolute(url)
				? path.join(root, url)
				: path.resolve(root, url);

			// Check for two file-paths:
			// 1] with/without underscore, scss/sass extension
			// 2] same as (1), but with "index" appended
			for (const input of [file, path.join(file, 'index')]) {
				const results = getFiles(input);

				if (results.length === 1) {
					return path.toFileUrl(results[0]);
				}

				if (results.length >= 2) {
					throw new Error(
						`Multiple files found for ${url}\n${JSON.stringify(results)}`,
					);
				}
			}

			return null;
		},
		load(url) {
			try {
				const contents = Deno.readTextFileSync(url);
				const filepath = path.fromFileUrl(url);

				return {
					contents,
					sourceMapUrl: url,
					syntax: path.extname(filepath) === '.scss'
						? 'scss'
						: path.extname(filepath) === '.sass'
						? 'indented'
						: 'css',
				};
			} catch (_error) {
				return null;
			}
		},
	});
}

export default createImporter;
