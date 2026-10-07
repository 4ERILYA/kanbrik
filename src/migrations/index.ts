import * as migration_20261007_195120_initial from './20261007_195120_initial';
import * as migration_20261007_202853_customers from './20261007_202853_customers';

export const migrations = [
  {
    up: migration_20261007_195120_initial.up,
    down: migration_20261007_195120_initial.down,
    name: '20261007_195120_initial',
  },
  {
    up: migration_20261007_202853_customers.up,
    down: migration_20261007_202853_customers.down,
    name: '20261007_202853_customers'
  },
];
