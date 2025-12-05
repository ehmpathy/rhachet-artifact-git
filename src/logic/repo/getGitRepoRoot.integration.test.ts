import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { given, when, then } from 'test-fns';

import { getGitRepoRoot } from './getGitRepoRoot';

describe('getGitRepoRoot', () => {
  given('a standard git repository', () => {
    when('called from the repo root', () => {
      then('it should return the git root directory', async () => {
        const result = await getGitRepoRoot({ from: process.cwd() });
        expect(result).toBe(resolve(process.cwd()));
      });
    });

    when('called from a subdirectory', () => {
      then('it should return the git root directory', async () => {
        const result = await getGitRepoRoot({
          from: join(process.cwd(), 'src'),
        });
        expect(result).toBe(resolve(process.cwd()));
      });
    });
  });

  given('a git worktree', () => {
    const testDir = join(tmpdir(), `git-worktree-test-${Date.now()}`);
    const mainRepoDir = join(testDir, 'main-repo');
    const worktreeDir = join(testDir, 'worktree');

    beforeAll(() => {
      // setup: create a git repo with a worktree
      mkdirSync(testDir, { recursive: true });
      mkdirSync(mainRepoDir, { recursive: true });

      // init main repo
      execSync('git init', { cwd: mainRepoDir });
      execSync('git config user.email "test@test.com"', { cwd: mainRepoDir });
      execSync('git config user.name "Test"', { cwd: mainRepoDir });
      writeFileSync(join(mainRepoDir, 'README.md'), '# Test');
      execSync('git add .', { cwd: mainRepoDir });
      execSync('git commit -m "init"', { cwd: mainRepoDir });

      // create a branch and worktree
      execSync('git branch worktree-branch', { cwd: mainRepoDir });
      execSync(`git worktree add ${worktreeDir} worktree-branch`, {
        cwd: mainRepoDir,
      });
    });

    afterAll(() => {
      // cleanup
      if (existsSync(testDir)) rmSync(testDir, { recursive: true });
    });

    when('called from the worktree root', () => {
      then('it should return the worktree root directory', async () => {
        const result = await getGitRepoRoot({ from: worktreeDir });
        expect(result).toBe(resolve(worktreeDir));
      });
    });

    when('called from a subdirectory within the worktree', () => {
      const subdir = join(worktreeDir, 'subdir');

      beforeAll(() => {
        mkdirSync(subdir, { recursive: true });
      });

      then('it should return the worktree root directory', async () => {
        const result = await getGitRepoRoot({ from: subdir });
        expect(result).toBe(resolve(worktreeDir));
      });
    });
  });

  given('a directory outside any git repository', () => {
    when('called from that directory', () => {
      then('it should throw a BadRequestError', async () => {
        await expect(getGitRepoRoot({ from: tmpdir() })).rejects.toThrow(
          'Not inside a Git repository',
        );
      });
    });
  });
});
