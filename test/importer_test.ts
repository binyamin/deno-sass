import {
	assertEquals,
	assertThrows,
} from 'https://deno.land/std@0.148.0/testing/asserts.ts';
import { path } from '../deps.ts';
import { compileString } from '../mod.ts';

// We won't validate the output. That job belongs to
// dart-sass. All we do here is make sure the importer works.

const expected = await Deno.readTextFile(path.resolve('test/fixtures/out.css'));

function runTest(content: string, root?: string) {
	root ??= path.resolve('test/fixtures');

	const output = compileString(content, {
		// loadPaths: [ root ], // why does this fail?
		url: path.toFileUrl(path.join(root, 'style.scss')),
	});

	assertEquals<string>(output.css.replace(/\ {2}/g, '\t'), expected.trim());
}

Deno.test('Importer', async (t) => {
	await t.step('Base import', async (t) => {
		await t.step('no underscore + no extension', () => runTest('@use "a";'));
		await t.step('no underscore', () => runTest('@use "a.scss";'));
		await t.step('no extension', () => runTest('@use "_a";'));
		await t.step('full file-stem', () => runTest('@use "_a.scss";'));
	});

	await t.step('Folder import', () => {
		runTest('@use "folder-import";');
	});

	await t.step('Root import', () => {
		runTest('@use "folder";', path.resolve('test/fixtures/root-import'));
	});

	await t.step('Two matching files', async (t) => {
		await t.step('no extension fails', () => {
			assertThrows(() => runTest('@use "two-matches/a";'));
		});
		await t.step(
			'with extension passes',
			() => runTest('@use "two-matches/a.sass";'),
		);
	});
})
