import * as migration_20261110_033658_initial from './20261110_033658_initial';
import * as migration_20261110_043617_users_name from './20261110_043617_users_name';

export const migrations = [
  {
    up: migration_20261110_033658_initial.up,
    down: migration_20261110_033658_initial.down,
    name: '20261110_033658_initial',
  },
  {
    up: migration_20261110_043617_users_name.up,
    down: migration_20261110_043617_users_name.down,
    name: '20261110_043617_users_name'
  },
];
