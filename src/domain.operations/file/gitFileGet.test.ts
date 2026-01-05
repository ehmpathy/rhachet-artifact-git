import { refByUnique } from 'domain-objects';
import { tmpdir } from 'os';
import { join } from 'path';
import { given, then } from 'test-fns';

import { GitFile } from '@src/domain.objects/GitFile';

import { gitFileGet } from './gitFileGet';
import * as gitFileGetLocalModule from './gitFileGetLocal';

jest.mock('./gitFileGetLocal');

describe('gitFileGet', () => {
  given('a local GitFile ref', () => {
    const tmpUrl = join(tmpdir(), `gitFile-${Date.now()}.txt`);

    const mockResult = new GitFile({
      uri: tmpUrl,
      content: 'hello world',
      hash: 'abc123',
    });

    beforeEach(() => {
      (gitFileGetLocalModule.gitFileGetLocal as jest.Mock).mockResolvedValue(
        mockResult,
      );
    });

    then('it should delegate to gitFileGetLocal with the ref', async () => {
      const result = await gitFileGet({ ref: refByUnique(mockResult) });

      expect(gitFileGetLocalModule.gitFileGetLocal).toHaveBeenCalledWith({
        ref: { uri: tmpUrl },
      });
      expect(result).toBe(mockResult);
    });
  });
});
