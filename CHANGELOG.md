# Changelog

## 0.14.0

### Added

- Added Baizhu and Kaveh

## 0.13.0

### Added

- Added Dehya and Mika

### Removed

- Removed unnecessary assets

## 0.12.0

### Added

- Added Alhaitham and Yaoyao

### Changed

- Change name image generation logic

## 0.11.0

### Added

- Added Wanderer and Faruzan

## 0.10.0

### Added

- Added Nahida and Layla

## 0.9.0

### Added

- Added Candace, Cyno and Nilou

### Changed

- Updated prisma to `^4.3.1`
- Changed tab width to `2`

## 0.8.0

### Added

- Added Collei, Dori and Tighnari

## 0.7.0

### Added

- Added Heizou

## 0.6.0

### Added

- Added Shinobu

## 0.5.0

To update from `v0.4.2` or below, run the following command to baseline the initial migration.

```sh
npx prisma migrate resolve --applied 20220408143101_initial_migration
```

After which you should apply the rest of the Prisma database migrations:

```sh
npx prisma migrate deploy
```

### Added

- Added Yelan

### Changed

- Moved from Knex to Prisma

## 0.4.2

### Fixed

- Fixed an oversight causing crash on start

## 0.4.1

### Changed

- Changed database client

## 0.4.0

### Added

- Fuzzy search in team member parsing

## 0.3.0

### Added

- Added Kamisato Ayato

## 0.2.1

### Added

- Added `--nobg` back for backwards compatibility

## 0.2.0

### Added

- Added the ability to change team member count in `ThumbnailGenerator`
- Added `--size` option in `team` command
- Added Yae Miko

### Changed

- `team` command now defaults to no background
- Replaced `--nobg` flag with `--bg` in `team` command

## 0.1.9

### Added

- Added Shenhe and Yun Jin

## 0.1.8

### Added

- Added `--nobg` option for `team` command

### Changed

- Character resolver now ignores spaces in character names
- An error is now thrown if the `team` command is used with invalid character names

## 0.1.7

### Added

- Added a CHANGELOG file
- Added support for Elements (e.g. Anemo, Cryo etc.) as team members

### Changed

- Prefix check is now case insensitive
- Moved list of available characters to `team` command

### Removed

- `Characters` command
