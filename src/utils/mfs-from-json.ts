import path from 'path';
import { Volume, DirectoryJSON, createFsFromVolume } from 'memfs';

export const mfsFromJson = (volJson: DirectoryJSON) => {
	const mfs = createFsFromVolume(Volume.fromJSON(volJson));

	Object.assign(mfs, {
		join: path.join,
	});

	// this type deliberately doesn't have join
	return mfs;
};
