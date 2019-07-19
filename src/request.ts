import { IncomingMessage } from 'http';
import https from 'https';
import { NormalizedPackageJson } from 'read-pkg';

const request = (name: string): Promise<NormalizedPackageJson> =>
  new Promise((resolve, reject): void => {
    const options = {
      hostname: 'registry.npmjs.org',
      port: 443,
      path: `/${name}`,
      method: 'GET',
    };

    const req = https.request(options, (res: IncomingMessage): void => {
      const data: string[] = [];

      res.on('data', (d): void => {
        data.push(d);
      });

      res.on('close', (): void => {
        resolve(JSON.parse(data.join('')));
      });
    });

    req.on('error', (e: Error): void => reject(e));

    req.end();
  });

export default request;
