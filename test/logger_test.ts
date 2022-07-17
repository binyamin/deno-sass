import { assertEquals } from 'https://deno.land/std@0.148.0/testing/asserts.ts';
import { path, sass as _sass } from '../deps.ts';
import { compileString } from '../mod.ts';

const root = path.resolve('test', 'fixtures');

// TODO Finish writing tests for logger

Deno.test('Custom Logger', async (t) => {
	await t.step('Debug statement doesn\'t error', () => {
		const output = compileString('body {\n\t@debug "hi";\n\tcolor: red;\n}\n', {
			url: path.toFileUrl(path.join(root, 'style.css')),
		});

		assertEquals<string>(
			output.css.replace(/\ {2}/g, '\t'),
			'body {\n\tcolor: red;\n}',
		);
	});

	await t.step({
		name: 'Warn doesn\'t error',
		fn() {
			const output = compileString('body {\n\t@warn "hi";\n\tcolor: red;\n}\n', {
				url: path.toFileUrl(path.join(root, 'style.css')),
			});

			assertEquals<string>(
				output.css.replace(/\ {2}/g, '\t'),
				'body {\n\tcolor: red;\n}',
			);
		}
	});
})
