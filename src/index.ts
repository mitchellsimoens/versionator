import globby from 'globby';
import { dirname } from 'path';
import readPkg, { NormalizedPackageJson } from 'read-pkg';
import semver from 'semver';
import request from './request';
import { Arguments, DependencyProps, Report, Result } from '../typings';

const PREFIX_RE = /^\^|~/;

type SortRet = -1 | 0 | 1;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type SortFn = (left: any, right: any) => SortRet;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const sort = (key: string): SortFn => (left: any, right: any): SortRet => {
  if (left[key] > right[key]) {
    return 1;
  }

  if (left[key] < right[key]) {
    return -1;
  }

  return 0;
};

const checkPackages = async (
  object: NormalizedPackageJson,
  key: DependencyProps,
  args: Arguments,
): Promise<Result[]> => {
  const versionObj = object[key];
  const results: Result[] = [];

  if (versionObj) {
    await Promise.all(
      Object.keys(versionObj).map(
        async (name: string): Promise<void> => {
          const version = versionObj[name];
          const versionParsed = version.replace(PREFIX_RE, '');
          const hasPrefix = version !== versionParsed;
          const {
            'dist-tags': { latest },
          } = await request(name);
          const hasUpdate = !semver.intersects(version, latest);
          const success = args['allow-prefixed'] ? !hasUpdate : !hasPrefix && !hasUpdate;

          results.push({
            hasPrefix,
            hasUpdate,
            latest,
            name,
            success,
            version,
            versionParsed,
          });
        },
      ),
    );
  }

  results.sort(sort('name'));

  return results;
};

const checkSuccess = (lastSuccess: boolean, result: Result): boolean => (result.success ? lastSuccess : result.success);

const checkPackage = async (cwd: string, args: Arguments): Promise<Report> => {
  const pkg = await readPkg({
    cwd,
  });

  const dependencies = await checkPackages(pkg, 'dependencies', args);
  const devDependencies = await checkPackages(pkg, 'devDependencies', args);
  const optionalDependencies = await checkPackages(pkg, 'optionalDependencies', args);
  const peerDependencies = await checkPackages(pkg, 'peerDependencies', args);
  const success =
    dependencies.reduce(checkSuccess, true) &&
    devDependencies.reduce(checkSuccess, true) &&
    optionalDependencies.reduce(checkSuccess, true) &&
    peerDependencies.reduce(checkSuccess, true);

  return {
    cwd,
    dependencies,
    devDependencies,
    optionalDependencies,
    peerDependencies,
    success,
  };
};

const versionator = async (args: Arguments): Promise<Report[]> => {
  const cwd = process.cwd();
  const paths = await globby([`${cwd}/**/package.json`, `!${cwd}/**/node_modules`]);

  const reports: Report[] = await Promise.all(
    paths.map((pkg: string): Promise<Report> => checkPackage(dirname(pkg), args)),
  );

  reports.sort(sort('cwd'));

  return reports;
};

export default versionator;
