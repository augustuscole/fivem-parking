import * as Cfx from '@nativewrappers/fivem';
import { GetPlayer, SpawnVehicle } from '@overextended/ox_core/server';
import { addCommand, onClientCallback } from '@overextended/ox_lib/server';
import Config from '../common/config';
import Locale from '../common/locale';
import { hasItem, removeItem, sendChatMessage, sendLog } from '../common/utils';
import db from './db';
import { Garage } from './garage/class';

onClientCallback('fivem-parking:server:spawnVehicle', async (source: number, vehicleId: number) => {
  const player = GetPlayer(source);

  if (!player?.charId) return false;

  const vehicle = await db.getVehicleById(vehicleId);
  if (!vehicle) {
    sendChatMessage(source, Locale('something_went_wrong'));
    return false;
  }

  const owner = await db.getVehicleOwner(vehicleId, player.charId);
  if (!owner) {
    sendChatMessage(source, Locale('not_vehicle_owner'));
    return false;
  }

  if (!hasItem(source, 'money', Config.Garage.RetrieveCost)) {
    sendChatMessage(source, Locale('not_enough_money'));
    return false;
  }

  const money = await removeItem(source, 'money', Config.Garage.RetrieveCost);
  if (!money) return false;

  await Cfx.Delay(100);

  const success = await SpawnVehicle(vehicleId, player.getCoords());
  if (!success) {
    sendChatMessage(source, Locale('failed_to_spawn'));
    return;
  }

  setImmediate(() => {
    TaskWarpPedIntoVehicle(GetPlayerPed(source), success.entity, -1);
  });

  await db.setVehicleStatus(vehicleId, 'outside');
  sendChatMessage(source, Locale('success_spawned'));
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
