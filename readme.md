# rhachet-artifact-git

![test](https://github.com/ehmpathy/rhachet-artifact-git/workflows/test/badge.svg)
![publish](https://github.com/ehmpathy/rhachet-artifact-git/workflows/publish/badge.svg)

use git artifacts with ease

# purpose

- use a simple, universal contract (.get, .set, .del)
- add a pit-of-success, with best practices


# install

```sh
npm install rhachet-artifact-git
```

# use

## `Artifact<typeof GitFile>`

### get, set, del

```ts
import { genArtifactGitFile } from 'artifact-git';
import { readFile } from 'fs/promises';

const ref = { uri: '/tmp/example.txt' };
const artifact = genArtifactGitFile(ref);

// write to file
await artifact.set({ content: 'hello world' });

// read the file
const gitFile = await artifact.get();
console.log(gitFile?.content); // 'hello world'

// delete the file
await artifact.del();
```

### null on dne

if the file does not exist yet, get will return null

```ts
const artifact = genArtifactGitFile({ uri: '/tmp/does-not-exist.txt' });

const got = await artifact.get(); // null

await artifact.set({ content: 'created now' }); // ✅ creates file
```

### .get().expect('isPresent')

you can fail-fast if you expect the file to be present

```ts
const before = await artifact.get(); // null | GitFile
console.log(before.content) // ❌ can not read .content of possibly null

const after = await artifact.get().expect('isPresent'); // GitFile
console.log(before.content) // ✅ now typescript knows its not null
```

### @gitroot alias

you can use the `@gitroot` alias in uri's, to resolve relative to the nearest git root

```ts
const artifact = genArtifactGitFile({ uri: '@gitroot/src/example.txt' });

await artifact.set({ content: 'saved under gitroot' });
// => creates file like `/your/repo/src/example.txt`
```


### options: { access: 'readonly' | 'readwrite' }

you can safeguard content which should never be overwritten

```ts
const artifact = genArtifactGitFile(ref, { access: 'readonly' });

const got = await artifact.get(); // ✅ reads content
await artifact.set({ content: 'nope' }); // ❌ throws "readonly"
await artifact.del(); // ❌ throws "readonly"
```

### options: { version: { retain: true } }

you can ask to retain each version of the file too

```ts
const artifact = genArtifactGitFile(ref, {
  versions: {
    retain: true,
  },
});

await artifact.set({ content: 'v1' });
```

this will ensure that each version of the artifact is also written to a meta directory, `.rhachet/artifact/example.txt/*`

```md
📁 /your/repo/
│
├── 📁 .rhachet/
│   └── 📁 artifact/
│       └── 📁 example.txt
│           └── 2025-07-14T103045Z.ab12cd34ef.txt        ← this version
│
├── 📄 example.txt                                       ← this file
```

the version will be written in `${unidatetime}.{hash}.{ext}` format
- `unidatetime` so you can see when the change was effectiveAt
- `hash` so you can easily see duplicate versions
