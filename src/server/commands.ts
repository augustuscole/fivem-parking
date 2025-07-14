import { Command } from '@nativewrappers/server';
import Config from '../common/config';
import { Garage } from './garage/class';

new Command(['list', 'vg'], 'View a list of your owned vehicles.', async ({ source }) => {
  await Garage.prototype.listVehicles(source);
});

new Command(['park', 'vp'], 'Store a vehicle in to your personal garage.', async ({ source }) => {
  await Garage.prototype.parkVehicle(source);
});

new Command(
  ['return', 'vi'],
  'Restore a vehicle from the impound lot to your personal garage.',
  async (args) => {
    await Garage.prototype.returnVehicle(args.source, { vehicleId: args.vehicleId });
  },
  [
    {
      name: 'vehicleId',
      type: 'number',
    },
  ] as const,
);

new Command(
  ['addveh'],
  'Create a new vehicle and grant it to the target player.',
  async (args) => {
    await Garage.prototype.adminGiveVehicle(args.source, { model: args.model, playerId: args.playerId });
  },
  [
    {
      name: 'model',
      type: 'string',
    },
    {
      name: 'playerId',
      type: 'number',
    },
  ] as const,
  Config.Group,
);

new Command(
  ['deleteveh', 'delveh'],
  "Delete a vehicle from the database and the owner's personal garage.",
  async (args) => {
    await Garage.prototype.adminDeleteVehicle(args.source, { plate: args.plate });
  },
  [
    {
      name: 'plate',
      type: 'string',
    },
  ] as const,
  Config.Group,
);

new Command(
  ['admincar', 'acar'],
  'Create a new vehicle and set it as owned.',
  async (args) => {
    await Garage.prototype.adminSetVehicle(args.source, { model: args.model });
  },
  [
    {
      name: 'model',
      type: 'string',
    },
  ] as const,
  Config.Group,
);

new Command(
  ['alist', 'avg'],
  "View a list of the target player's owned vehicles.",
  async (args) => {
    await Garage.prototype.adminViewVehicles(args.source, { playerId: args.playerId });
  },
  [
    {
      name: 'playerId',
      type: 'number',
    },
  ] as const,
  Config.Group,
);
