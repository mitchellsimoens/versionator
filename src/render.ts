import Table, { Cell, HorizontalTable } from 'cli-table3';
import { green, red } from 'colorette';
import { DependencyProps, Report, Result } from '../typings';

const outputResults = (table: HorizontalTable, name: DependencyProps, report: Report): boolean => {
  const results = report[name];

  if (results.length) {
    table.push(
      [{ colSpan: 7, content: name }],
      ...results.map((result: Result): Cell[] => {
        const color = result.success ? green : red;

        return [
          '  ',
          color(result.name),
          color(result.version),
          color(result.latest),
          color(result.hasPrefix ? 'y' : 'n'),
          color(result.hasUpdate ? 'y' : 'n'),
          color(result.success ? '✓' : 'x'),
        ];
      }),
    );

    return true;
  }

  return false;
};

const render = (report: Report): void => {
  const table = new Table({
    head: ['', 'Package', 'Local Version', 'Latest Version', 'Has Prefix', 'Has Update', 'Success'],
    style: { head: ['white'] },
  }) as HorizontalTable;

  table.push([{ colSpan: 7, content: report.cwd }]);

  const hadDependencies = outputResults(table, 'dependencies', report);
  const hadDevDependencies = outputResults(table, 'devDependencies', report);
  const hadOptionalDependencies = outputResults(table, 'optionalDependencies', report);
  const hadPeerDependencies = outputResults(table, 'peerDependencies', report);

  const hadRows = hadDependencies || hadDevDependencies || hadOptionalDependencies || hadPeerDependencies;

  if (!hadRows) {
    table.push([{ colSpan: 7, content: 'No dependencies found' }]);
  }

  // eslint-disable-next-line no-console
  console.log(table.toString());
};

export default render;
