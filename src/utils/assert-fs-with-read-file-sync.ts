import fs from 'fs';

type Fs = typeof fs;

export function assertFs(
	mfs: any,
): asserts mfs is Fs {
	if (!('readFileSync' in mfs)) {
		throw new Error('Missing readFileSync');
	}
	if (!('writeFileSync' in mfs)) {
		throw new Error('Missing writeFileSync');
	}
}
