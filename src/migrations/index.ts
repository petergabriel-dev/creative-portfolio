import * as migration_20261110_033658_initial from './20261110_033658_initial';
import * as migration_20261110_043617_users_name from './20261110_043617_users_name';
import * as migration_20261110_044403_media_blob from './20261110_044403_media_blob';
import * as migration_20261110_050907_site_settings from './20261110_050907_site_settings';
import * as migration_20261110_093748_p1_portfolio from './20261110_093748_p1_portfolio';
import * as migration_20261111_040428_p2_journal from './20261111_040428_p2_journal';
import * as migration_20261111_083526_p3_inquiries from './20261111_083526_p3_inquiries';
import * as migration_20261111_104705_p4_home_about from './20261111_104705_p4_home_about';

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
    name: '20261110_093748_p1_portfolio',
  },
  {
    up: migration_20261111_040428_p2_journal.up,
    down: migration_20261111_040428_p2_journal.down,
    name: '20261111_040428_p2_journal',
  },
  {
    up: migration_20261111_083526_p3_inquiries.up,
    down: migration_20261111_083526_p3_inquiries.down,
    name: '20261111_083526_p3_inquiries',
  },
  {
    up: migration_20261111_104705_p4_home_about.up,
    down: migration_20261111_104705_p4_home_about.down,
    name: '20261111_104705_p4_home_about'
  },
];
