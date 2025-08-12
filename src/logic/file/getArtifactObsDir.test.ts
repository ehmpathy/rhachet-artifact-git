import path from 'path';
import { given, when, then } from 'test-fns';

import { getArtifactObsDir } from './getArtifactObsDir';

describe('getArtifactObsDir', () => {
  given('a posix absolute file path', () => {
    const uri = '/projects/app/src/file.txt';

    when('computing the observability directory', () => {
      let result: string;

      beforeAll(() => {
        result = getArtifactObsDir({ uri });
      });

      then('joins parent dir + ".rhachet" + basename', () => {
        expect(result).toBe(
          path.join('/projects/app/src', '.rhachet', 'file.txt'),
        );
      });
    });
  });

  given('a relative file path', () => {
    const uri = 'src/data/artifact.json';

    when('computing the observability directory', () => {
      let result: string;

      beforeAll(() => {
        result = getArtifactObsDir({ uri });
      });

      then('preserves relativity while inserting ".rhachet"', () => {
        expect(result).toBe(path.join('src/data', '.rhachet', 'artifact.json'));
      });
    });
  });

  given('a dotfile', () => {
    const uri = '/repo/.env';

    when('computing the observability directory', () => {
      let result: string;

      beforeAll(() => {
        result = getArtifactObsDir({ uri });
      });

      then('uses the dotfile name as the key', () => {
        expect(result).toBe(path.join('/repo', '.rhachet', '.env'));
      });
    });
  });

  given('a filename with multiple dots', () => {
    const uri = '/repo/build/app.v1.2.tar.gz';

    when('computing the observability directory', () => {
      let result: string;

      beforeAll(() => {
        result = getArtifactObsDir({ uri });
      });

      then('keeps the full basename with dots', () => {
        expect(result).toBe(
          path.join('/repo/build', '.rhachet', 'app.v1.2.tar.gz'),
        );
      });
    });
  });
});
