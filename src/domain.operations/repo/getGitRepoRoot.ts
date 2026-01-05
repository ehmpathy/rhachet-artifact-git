import findUp from 'find-up';
import { BadRequestError } from 'helpful-errors';
import { resolve } from 'path';

/**
 * .what = gets the root directory of a Git repository
 * .why = used to resolve paths relative to the Git root
 */
export const getGitRepoRoot = async (input: {
  from: string;
}): Promise<string> => {
  const [gitDir, gitFile] = await Promise.all([
    findUp('.git', { cwd: input.from, type: 'directory' }), // standard repo: .git is a directory
    findUp('.git', { cwd: input.from, type: 'file' }), // worktree: .git is a file pointing to the main repo
  ]);
  const gitPath = gitDir ?? gitFile;

  if (!gitPath)
    throw new BadRequestError('Not inside a Git repository', { input });

  return resolve(gitPath, '..');
};
