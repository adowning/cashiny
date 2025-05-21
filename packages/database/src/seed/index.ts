import { parseArgs } from 'node:util';

import { db } from '../index.js';
import seedDev from './development';
import seedProd from './production.js';

const options: { environment: { type: 'string' } } = {
  environment: { type: 'string' },
};

async function main() {
  const {
    values: { environment },
  } = parseArgs({ options });
  switch (environment) {
    case 'production':
      /** data for your production */
      await seedProd();
      break;
    case 'staging':
      /** data for your staging */
      await seedDev();
      break;
    case 'development':
      /** data for your development */
      await seedDev();
      break;
    default:
      await seedDev();
      break;
  }
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
