# fivem-parking

A simple vehicle garage system created with a more versatile structure, allowing players to conveniently store and retrieve owned vehicles from any location.

[![](https://img.shields.io/badge/License-MIT-blue?logo=opensource)](./LICENSE)
[![](https://img.shields.io/github/contributors/augustuscole/fivem-parking?logo=github)](https://github.com/augustuscole/fivem-parking/graphs/contributors)
[![](https://img.shields.io/github/last-commit/augustuscole/fivem-parking?logo=github)](https://github.com/augustuscole/fivem-parking/commits/main)

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

### Building this resource

1. Download and install the LTS version of [Node.js](https://nodejs.org/en).
2. Open a command-line terminal (e.g., Terminal, Command Prompt).
3. Enter `node --version` to verify the installation.
4. Run `npm install -g pnpm` to globally install the package manager [pnpm](https://pnpm.io).
5. Download or clone the repository with `git clone https://github.com/augustuscole/fivem-parking`.
6. Install all dependencies with `pnpm i`.
7. Create a new file named `.env` within the root directory.
8. Copy the contents of `.env.example` to the newly created `.env` file and edit accordingly.
9. Connect your database to add Prisma models to `schema.prisma` and generate Prisma client using `pnpm connect`.
10. Build the resource with `pnpm build`.

Use `pnpm watch` to rebuild whenever a file is modified.

## Usage

### Commands

#### `/list` _(alias: `/vg`)_

- Displays a list of your owned vehicles along with their status and allows you to spawn them.

##### _You're only able to spawn vehicles that are in the `stored` state._

#### `/park` _(alias: `/vp`)_

- Stores your vehicle into your vehicle garage.

#### `/return [vehicleId]` _(alias: `/vi`)_

- Retrieve your vehicle from the impound via its unique identifier, restoring it to the `stored` state.

##### _This command will only work if you are within the radius of the location defined in `static/config.json`._

#### [ADMIN] `/addvehicle [model] [playerId]`

- Adds a vehicle to the database and target player's vehicle garage.

#### [ADMIN] `/adeletevehicle [plate]` _(alias: `/delveh`)_

- Removes a vehicle from the database and owner's vehicle garage.

##### _This action cannot be reversed._

#### [ADMIN] `/admincar [model]` _(alias: `/acar`)_

- Spawns a vehicle and saves it to the database and your vehicle garage.

#### [ADMIN] `/alist [playerId]` _(alias: `/avg`)_

- Displays a list of the target player's owned vehicles.

## Contact

For any feedback or support regarding this script, you can either create an issue or reach out on [Discord](https://discord.com/invite/r7X3hztFG4).

## Credits

- [BerkieB](https://github.com/BerkieBb) originally made this resource. I wanted it publicly available, so here it is.