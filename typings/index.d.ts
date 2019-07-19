export interface Arguments {
  'allow-prefixed'?: boolean;
  exclude?: string;
  shallow?: boolean;
}

export type DependencyProps = 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';

export interface Info {
  hasPrefix: boolean;
  name: string;
  version: string;
  versionParsed: string;
}

export interface FullResult extends Info {
  hasUpdate: boolean;
  latest: string;
  success: boolean;
}

export type Result = Info | FullResult;

export type DependencyReport = {
  [key in DependencyProps]: Result[];
};

export type InfoReport = DependencyReport & {
  cwd: string;
};

export type FullReport = DependencyReport & {
  cwd: string;
  success: boolean;
};

export type Report = InfoReport | FullReport;
