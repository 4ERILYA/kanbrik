import * as migration_20261007_195120_initial from './20261007_195120_initial';

export const migrations = [
  {
    up: migration_20261007_195120_initial.up,
    down: migration_20261007_195120_initial.down,
    name: '20261007_195120_initial'
  },
];
