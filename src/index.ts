import globby from 'globby';
import { dirname, join } from 'path';
import readPkg, { NormalizedPackageJson } from 'read-pkg';
import semver, { ReleaseType } from 'semver';
import request from './request';
import {
  Arguments,
  DependencyProps,
  FullReport,
  FullResult,
  Info,
  InfoReport,
  ReleaseValues,
  Report,
  Result,
} from '../typings';

const PREFIX_RE = /^\^|~/;

type SortRet = -1 | 0 | 1;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type SortFn = (left: any, right: any) => SortRet;

const dependencyMap = new Map<string, Info[]>();
const packageMap = new Map<string, string>();

const releaseValues: ReleaseValues = {
  prerelease: 1,
  prepatch: 2,
  patch: 3,
  preminor: 4,
  minor: 5,
  premajor: 6,
  major: 7,
};

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

const collectInfo = (object: NormalizedPackageJson, key: DependencyProps): Result[] => {
  const versionObj = object[key];
  const results: Result[] = [];

  if (versionObj) {
    Object.keys(versionObj).forEach((name: string): void => {
      const version = versionObj[name];
      const versionParsed = version.replace(PREFIX_RE, '');
      const hasPrefix = version !== versionParsed;
      const mapItem = dependencyMap.get(name);
      const result: Info = {
        hasPrefix,
        name,
        version,
        versionParsed,
      };

      if (mapItem) {
        mapItem.push(result);
      } else {
        dependencyMap.set(name, [result]);
      }

      results.push(result);
    });

    results.sort(sort('name'));
  }

  return results;
};

const collectPackageInfo = async (cwd: string): Promise<InfoReport> => {
  const pkg = await readPkg({
    cwd,
  });

  const dependencies = collectInfo(pkg, 'dependencies');
  const devDependencies = collectInfo(pkg, 'devDependencies');
  const optionalDependencies = collectInfo(pkg, 'optionalDependencies');
  const peerDependencies = collectInfo(pkg, 'peerDependencies');

  return {
    cwd,
    dependencies,
    devDependencies,
    optionalDependencies,
    peerDependencies,
  };
};

const checkLatestVersions = (): Promise<void[]> =>
  Promise.all(
    Array.from(dependencyMap.keys()).map(
      async (name: string): Promise<void> => {
        const {
          'dist-tags': { latest },
        } = await request(name);

        packageMap.set(name, latest);
      },
    ),
  );

const checkForUpdate = (version: string, latest: string, args: Arguments): boolean => {
  const satisfies = semver.satisfies(latest, `<=${version}`);

  if (satisfies) {
    return false;
  }

  const diff = semver.diff(version, latest);

  if (diff === null) {
    return false;
  }

  const { 'allow-update': allowUpdate } = args;

  if (!allowUpdate) {
    return true;
  }

  const allowedValue = releaseValues[allowUpdate as ReleaseType];
  const diffValue = releaseValues[diff];

  return allowedValue < diffValue;
};

const assertSuccess = (args: Arguments): void => {
  const { 'allow-prefixed': allowPrefixed } = args;

  dependencyMap.forEach((infos: Result[], key: string): void => {
    const latest = packageMap.get(key);

    if (latest) {
      infos.forEach((info: Result): void => {
        const hasUpdate = checkForUpdate(info.version, latest, args);
        const success = allowPrefixed ? !hasUpdate : !info.hasPrefix && !hasUpdate;

        Object.assign(info, {
          hasUpdate,
          latest,
          success,
        });
      });
    }
  });
};

const checkSuccess = (lastSuccess: boolean, result: Result): boolean =>
  (result as FullResult).success ? lastSuccess : (result as FullResult).success;

const assertReportSuccess = (reports: Report[]): FullReport[] =>
  reports.map(
    (report: Report): FullReport => ({
      ...report,
      success:
        report.dependencies.reduce(checkSuccess, true) &&
        report.devDependencies.reduce(checkSuccess, true) &&
        report.optionalDependencies.reduce(checkSuccess, true) &&
        report.peerDependencies.reduce(checkSuccess, true),
    }),
  );

const getGlobs = (cwd: string, args: Arguments): string[] => {
  const globs = [`${cwd}/**/package.json`, `!${cwd}/**/node_modules`];

  if (args.exclude) {
    globs.push(`!${join(cwd, args.exclude)}`);
  }

  return globs;
};

const versionator = async (args: Arguments = {}): Promise<FullReport[]> => {
  const cwd = process.cwd();
  const paths = args.shallow ? [cwd] : await globby(getGlobs(cwd, args));

  const reports: Report[] = await Promise.all(
    paths.map((pkg: string): Promise<Report> => collectPackageInfo(dirname(pkg))),
  );

  reports.sort(sort('cwd'));

  await checkLatestVersions();

  assertSuccess(args);

  return assertReportSuccess(reports);
};

export default versionator;
