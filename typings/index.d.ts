export interface Arguments {
  'allow-prefixed'?: boolean;
}

export type DependencyProps = 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';

export interface Result {
  hasPrefix: boolean;
  hasUpdate: boolean;
  latest: string;
  name: string;
  success: boolean;
  version: string;
  versionParsed: string;
}

export type DependencyReport = {
  [key in DependencyProps]: Result[];
};

export type Report = DependencyReport & {
  cwd: string;
  success: boolean;
};
