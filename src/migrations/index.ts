import * as migration_20261110_033658_initial from './20261110_033658_initial';
import * as migration_20261110_043617_users_name from './20261110_043617_users_name';
import * as migration_20261110_044403_media_blob from './20261110_044403_media_blob';
import * as migration_20261110_050907_site_settings from './20261110_050907_site_settings';
import * as migration_20261110_093748_p1_portfolio from './20261110_093748_p1_portfolio';

export const migrations = [
  {
    up: migration_20261110_033658_initial.up,
    down: migration_20261110_033658_initial.down,
    name: '20261110_033658_initial',
  },
  {
    up: migration_20261110_043617_users_name.up,
    down: migration_20261110_043617_users_name.down,
    name: '20261110_043617_users_name',
  },
  {
    up: migration_20261110_044403_media_blob.up,
    down: migration_20261110_044403_media_blob.down,
    name: '20261110_044403_media_blob',
  },
  {
    up: migration_20261110_050907_site_settings.up,
    down: migration_20261110_050907_site_settings.down,
    name: '20261110_050907_site_settings',
  },
  {
    up: migration_20261110_093748_p1_portfolio.up,
    down: migration_20261110_093748_p1_portfolio.down,
    name: '20261110_093748_p1_portfolio'
  },
];
