import yargs, { Argv } from 'yargs';
import versionator from './index';
import render from './render';
import { Arguments, FullReport } from '../typings';

const { argv }: Argv<Arguments> = yargs
  .boolean('allow-prefixed')
  .string('allow-update')
  .string('exclude')
  .boolean('shallow');

(async (): Promise<void> => {
  const reports = await versionator(argv);
  let hasFailure = false;

  reports.forEach((report: FullReport): void => {
    if (!report.success) {
      hasFailure = true;
    }

    render(report);

    /* eslint-disable-next-line no-console */
    console.log(''); // space between tables
  });

  if (hasFailure) {
    process.exit(1);
  }
})();
