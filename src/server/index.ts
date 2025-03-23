import * as Cfx from '@nativewrappers/fivem';
import { GetPlayer, SpawnVehicle } from '@overextended/ox_core/server';
import { addCommand, onClientCallback } from '@overextended/ox_lib/server';
import Config from '../common/config';
import { hasItem, removeItem, sendChatMessage, sendLog } from '../common/utils';
import db from './db';
import { Garage } from './garage/class';

onClientCallback('fivem-parking:server:spawnVehicle', async (source: number, vehicleId: number) => {
  const player = GetPlayer(source);

  if (!player?.charId) return false;

  const vehicle = await db.getVehicleById(vehicleId);
  if (!vehicle) {
    sendChatMessage(source, '^#d73232Something went wrong.');
    return false;
  }

  const owner = await db.getVehicleOwner(vehicleId, player.charId);
  if (!owner) {
    sendChatMessage(source, '^#d73232You cannot spawn a vehicle you do not own!');
    return false;
  }

  if (!hasItem(source, 'money', Config.Garage.RetrieveCost)) {
    sendChatMessage(
      source,
      `^#d73232You need ^#ffffff$${Config.Garage.RetrieveCost} ^#d73232to retrieve your vehicle.`,
    );
    return false;
  }

  const money = await removeItem(source, 'money', Config.Garage.RetrieveCost);
  if (!money) return false;

  await Cfx.Delay(100);

  const success = await SpawnVehicle(vehicleId, player.getCoords());
  if (!success) {
    sendChatMessage(source, '^#d73232Failed to spawn the vehicle.');
    return;
  }

  await Cfx.Delay(100);

  setImmediate(() => {
    TaskWarpPedIntoVehicle(GetPlayerPed(source), vehicleId, -1);
  });

  await db.setVehicleStatus(vehicleId, 'outside');
  sendChatMessage(source, `^#5e81acYou paid ^#ffffff$${Config.Garage.RetrieveCost} ^#5e81acto retrieve your vehicle.`);
  await sendLog(
    `[VEHICLE] ${player.get('name')} (${source}) just spawned their vehicle #${vehicleId}! Position: ${player.getCoords()[0]} ${player.getCoords()[1]} ${player.getCoords()[2]} - dimension: ${GetPlayerRoutingBucket(String(source))}.`,
  );
});

addCommand(['list', 'vg'], Garage.prototype.listVehicles, {
  restricted: false,
});

addCommand(['park', 'vp'], Garage.prototype.parkVehicle, {
  restricted: false,
});

addCommand(['return', 'vi'], Garage.prototype.returnVehicle, {
  params: [
    {
      name: 'vehicleId',
      paramType: 'number',
      optional: false,
    },
  ],
  restricted: false,
});

addCommand(['addvehicle'], Garage.prototype.adminGiveVehicle, {
  params: [
    {
      name: 'model',
      paramType: 'string',
      optional: false,
    },
    {
      name: 'playerId',
      paramType: 'number',
      optional: false,
    },
  ],
  restricted: 'group.admin',
});

addCommand(['adeletevehicle', 'delveh'], Garage.prototype.adminDeleteVehicle, {
  params: [
    {
      name: 'plate',
      paramType: 'string',
      optional: false,
    },
  ],
  restricted: 'group.admin',
});

addCommand(['admincar', 'acar'], Garage.prototype.adminSetVehicle, {
  params: [
    {
      name: 'model',
      paramType: 'string',
      optional: false,
    },
  ],
  restricted: 'group.admin',
});

addCommand(['alist', 'avg'], Garage.prototype.adminViewVehicles, {
  params: [
    {
      name: 'playerId',
      paramType: 'number',
      optional: false,
    },
  ],
  restricted: 'group.admin',
});
