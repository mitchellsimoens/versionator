# @mitchellsimoens/versionator

[![npm](https://img.shields.io/npm/v/@mitchellsimoens/versionator.svg)](https://www.npmjs.com/package/@mitchellsimoens/versionator)
[![npm](https://img.shields.io/npm/dm/@mitchellsimoens/versionator.svg)](https://www.npmjs.com/package/@mitchellsimoens/versionator)
[![CircleCI](https://circleci.com/gh/mitchellsimoens/versionator.svg?style=svg&circle-token=a552b2094264094f567d0e9c0e1c76d6e44b7a04)](https://circleci.com/gh/mitchellsimoens/versionator)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![MIT Licensed](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](./LICENSE)

Allows checking locally installed node modules for updates against [npm](https://www.npmjs.com/) repository. This also can enforce dependencies to be unprefixed for security reasons.

## Installation

```shell
# with npm
npm install -g @mitchellsimoens/versionator

# or with yarn
yarn global add @mitchellsimoens/versionator
```

## Usage

From the project you want to check, run:

```shell
versionator
```

This will look for all `package.json` files under the current directory and check for any updates and prefixed versions (excluding the `package.json` files under `node_modules`). If a module has an update or is using a prefixed version, the process will exit with code `1` and the associated row in the rendered table will be red.

You can disable the prefix version checking:

```shell
versionator --allow-prefixed
```

You can disable the nested `package.json` lookup and only look at the `package.json` in the current directory:

```shell
versionator --shallow
```

If you need to exclude a path, you can provide the `--exclude` as a glob relative to the current directory:

```shell
versionator --exclude "examples/**/package.json"
```

## Programmatic Execution

While you will likely only use the cli means of this, you can programmatically execute this. When you do so, the table will not render, the array of reports will be returned.

```typescript
import versionator, { Report } from '@mitchellsimoens/versionator';

(async (): Promise<void> => {
  const reports: Report[] = await versionator();
})();
```

You can also pass the options to the `versionator` function:

```typescript
import versionator, { Report } from '@mitchellsimoens/versionator';

(async (): Promise<void> => {
  const reports: Report[] = await versionator({
    'allow-prefixed': true,
    exclude: 'examples/{foo,bar}/package.json',
    shallow: true,
  });
})();
```

## Sample

<center><img width="550" style="margin-bottom: 20px;" src="assets/sample.png" /></center>
