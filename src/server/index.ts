import * as Cfx from '@nativewrappers/fivem';
import { GetPlayer, SpawnVehicle } from '@overextended/ox_core/server';
import { onClientCallback } from '@overextended/ox_lib/server';
import Config from '../common/config';
import Locale from '../common/locale';
import { hasItem, removeItem, sendChatMessage, sendLog } from '../common/utils';
import './commands';
import db from './db';

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

  if (!hasItem(source, Config.Item, Config.Garage.RetrieveCost)) {
    sendChatMessage(source, Locale('not_enough_money'));
    return false;
  }

  const money = await removeItem(source, Config.Item, Config.Garage.RetrieveCost);
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
  await sendLog(`[VEHICLE] ${player.get('name')} (${source}) just spawned their vehicle #${vehicleId}! Position: ${player.getCoords()[0]} ${player.getCoords()[1]} ${player.getCoords()[2]} - dimension: ${GetPlayerRoutingBucket(String(source))}.`);
});
