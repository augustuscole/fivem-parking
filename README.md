[![](https://github.com/user-attachments/assets/3e7cc18b-8e52-4593-95f1-3b42dfdd3ed1)](https://stand-with-ukraine.pp.ua)

# fivem-parking

A realistic vehicle garage system for FiveM, allowing players to store and retrieve owned vehicles from any location.

[![](https://img.shields.io/badge/License-MIT-blue?logo=opensource)](./LICENSE)
[![](https://img.shields.io/github/contributors/jacobbernoulli/fivem-parking?logo=github)](https://github.com/jacobbernoulli/fivem-parking/graphs/contributors)
[![](https://img.shields.io/github/last-commit/jacobbernoulli/fivem-parking?logo=github)](https://github.com/jacobbernoulli/fivem-parking/commits/main)

## Features

- Utilizes [Prisma](https://www.prisma.io) to interact with your database.
- Menu is handled via ox_lib's [interface](https://overextended.dev/ox_lib/Modules/Interface/Client/context) module, which has replaced the old React + Mantine interface.
- Supports logging via Discord.
- Administrators have the ability to manage and oversee vehicles via command.

## Installation

### Dependencies

- [ox_core](https://github.com/overextended/ox_core)
- [ox_lib](https://github.com/overextended/ox_lib)
- [ox_inventory](https://github.com/overextended/ox_inventory)

### Build

1. Download the LTS version of [Node.js](https://nodejs.org/en) and the latest version of [Go](https://go.dev/dl/).
2. Open a command-line terminal (e.g., Terminal, Command Prompt).
3. Enter `node --version` and `go version` to verify the installation.
4. Run `npm install -g pnpm` to globally install the package manager [pnpm](https://pnpm.io).
5. Download or clone the repository with `git clone https://github.com/jacobbernoulli/fivem-parking`.
6. Install all dependencies with `pnpm i`.
7. Create a new file named `.env` within the root directory.
8. Copy the contents of `.env.example` to the newly created `.env` file and edit accordingly.
9. Connect your database to add Prisma models to `schema.prisma` and generate Prisma client using `pnpm connect`.
10. Build the resource with `pnpm build`.

Use `pnpm watch` to rebuild whenever a file is modified.

## Usage

### Commands

#### Player

- `/list` _(alias: `/vg`)_ – Lists owned vehicles and their status; only `stored` vehicles can be spawned.
- `/park` _(alias: `/vp`)_ – Store a vehicle in your vehicle garage.
- `/return [vehicleId]` _(alias: `/vi`)_ – Retrieve a vehicle from the impound.

#### Admin

- `/addveh [model] [playerId]` – Adds a vehicle to database and target player's vehicle garage.
- `/deleteveh [plate]` _(alias: `/delveh`)_ – Removes a vehicle from database and owner's vehicle garage.
- `/admincar [model]` _(alias: `/acar`)_ – Spawns and saves vehicle to database and your vehicle garage.
- `/alist [playerId]` _(alias: `/avg`)_ – Lists target player's owned vehicles.

## Credits

- [BerkieB](https://github.com/BerkieBb) originally made this resource. I wanted it publicly available, so here it is.