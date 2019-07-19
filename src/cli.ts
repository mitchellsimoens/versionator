import yargs, { Argv } from 'yargs';
import versionator from './index';
import render from './render';
import { Arguments, Report } from '../typings';

const { argv }: Argv<Arguments> = yargs.boolean('allow-prefixed').boolean('shallow');

(async (): Promise<void> => {
  const reports = await versionator(argv);
  let hasFailure = false;

  reports.forEach((report: Report): void => {
    if (!report.success) {
      hasFailure = true;
    }

    render(report);
  });

  if (hasFailure) {
    process.exit(1);
  }
})();
