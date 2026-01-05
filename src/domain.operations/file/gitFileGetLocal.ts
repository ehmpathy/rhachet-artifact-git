import { createHash } from 'crypto';
import type { RefByUnique } from 'domain-objects';
import { readFile } from 'fs/promises';

import { GitFile } from '@src/domain.objects/GitFile';

export const gitFileGetLocal = async <TContent = string>(input: {
  ref: RefByUnique<typeof GitFile>;
}): Promise<GitFile<TContent> | null> => {
  try {
    // Attempt to read the file as UTF-8 text. This assumes TContent = string by default.
    const content = await readFile(input.ref.uri, 'utf-8');

    // Compute a SHA-256 hash of the content to track changes or verify integrity.
    const hash = createHash('sha256').update(content).digest('hex');

    // Return a GitFile instance with content and its computed hash.
    return new GitFile({
      ...input.ref,
      content,
      hash,
    });
  } catch (err: any) {
    // If the file does not exist, return null to signal "not found" rather than throwing, so upstream logic can handle optional files.
    if (err.code === 'ENOENT') return null;

    // For any other errors (e.g. permissions, I/O failure), fail loudly.
    throw err;
  }
};
