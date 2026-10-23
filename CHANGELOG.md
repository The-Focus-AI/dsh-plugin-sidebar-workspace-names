# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-10-23

### Fixed

- The row action strip's archive and pin buttons no longer stay visible on every flat
  row. Sharing the strip with the chip forced it mounted; its buttons are now hidden
  until the row is hovered, matching their shipped behavior.

### Documentation

- README shows before/after screenshots of the flat session list.

## [0.1.0] - 2026-10-23

### Added

- Two-line session rows in the sidebar's **In one list** view: the owning workspace
  name renders below the session title, with a folder glyph and an ellipsis for names
  that overflow.
- The full workspace name in the session hover card.
- Localized `en` and `zh` copy for Ungrouped, the automatic default workspace, and the
  hover-card label.
- `engines.dsh` range pinning the tested harness version.

### Changed

- README leads with the npm install path; a checkout install is documented as the
  alternative.
