import * as Cfx from '@nativewrappers/fivem';
import { CreateVehicle, GetPlayer, GetVehicle } from '@overextended/ox_core/server';
import { triggerClientCallback } from '@overextended/ox_lib/server';
import Config from '../../common/config';
import Locale from '../../common/locale';
import { getArea, hasItem, removeItem, sendChatMessage, sendLog } from '../../common/utils';
import db from '../db';

export class Garage {
  id: number;
  plate: string;
  owner: number;
  model: string;
  stored: string | null;

  constructor(id: number, plate: string, owner: number, model: string, stored: string | null) {
    this.id = id;
    this.plate = plate;
    this.owner = owner;
    this.model = model;
    this.stored = stored;
  }

  public async listVehicles(source: number) {
    const player = GetPlayer(source);

    if (!player?.charId) return [];

    const vehicles = await db.getOwnedVehicles(player.charId);
    if (!vehicles || vehicles.length === 0) {
      sendChatMessage(source, Locale('no_vehicles_owned'));
      return [];
    }

    triggerClientCallback('fivem-parking:client:listVehicles', source, vehicles);

    return vehicles;
  }

  public async parkVehicle(source: number): Promise<boolean> {
    const player = GetPlayer(source);

    if (!player?.charId) return false;

    const ped = GetVehiclePedIsIn(GetPlayerPed(source), false);
    if (ped === 0) {
      sendChatMessage(source, Locale('not_inside_vehicle'));
      return false;
    }

    const vehicle = GetVehicle(ped);
    if (!vehicle?.owner) {
      sendChatMessage(source, Locale('not_vehicle_owner'));
      return false;
    }

    if (!hasItem(source, Config.Item, Config.Garage.StoreCost)) {
      sendChatMessage(source, Locale('not_enough_money'));
      return false;
    }

    const success = await removeItem(source, Config.Item, Config.Garage.StoreCost);
    if (!success) return false;

    vehicle.setStored('stored', true);
    sendChatMessage(source, Locale('success_store'));
    await sendLog(`[VEHICLE] ${player.get('name')} (${source}) just parked vehicle #${vehicle.id} with plate #${vehicle.plate} at X: ${player.getCoords()[0]} Y: ${player.getCoords()[1]} Z: ${player.getCoords()[2]}, dimension: #${GetPlayerRoutingBucket(String(source))}.`);

    return true;
  }

  public async returnVehicle(source: number, args: { vehicleId: number }): Promise<boolean> {
    const player = GetPlayer(source);

    if (!player?.charId) return false;

    const vehicleId = args.vehicleId;
    const coords = player.getCoords();
    if (!getArea({ x: coords[0], y: coords[1], z: coords[2] }, Config.Impound.Location)) {
      sendChatMessage(source, Locale('not_in_impound_area'));
      return false;
    }

    const owner = await db.getVehicleOwner(vehicleId, player.charId);
    if (!owner) {
      sendChatMessage(source, Locale('not_vehicle_owner'));
      return false;
    }

    const status = await db.getVehicleStatus(vehicleId, 'impound');
    if (!status) {
      sendChatMessage(source, Locale('not_impounded'));
      return false;
    }

    if (!hasItem(source, Config.Item, Config.Impound.Cost)) {
      sendChatMessage(source, Locale('not_enough_money'));
      return false;
    }

    const success = await removeItem(source, Config.Item, Config.Impound.Cost);
    if (!success) return false;

    await db.setVehicleStatus(vehicleId, 'stored');
    sendChatMessage(source, Locale('success_restore'));

    return true;
  }

  public async adminGiveVehicle(source: number, args: { model: string; playerId: number }): Promise<boolean> {
    const player = GetPlayer(source);

    if (!player?.charId) return false;

    const model = args.model;
    const playerId = args.playerId;

    const target = GetPlayer(playerId);
    if (!target?.charId) {
      sendChatMessage(source, Locale('no_player_found'));
      return false;
    }

    await Cfx.Delay(100);

    const vehicle = await CreateVehicle({ owner: target.charId, model: model }, player.getCoords());
    if (!vehicle || vehicle.owner !== target.charId) {
      sendChatMessage(source, Locale('failed_to_give'));
      return false;
    }

    vehicle.setStored('stored', true);
    sendChatMessage(source, Locale('success_spawned'));

    return true;
  }

  public async adminDeleteVehicle(source: number, args: { plate: string }): Promise<boolean> {
    const player = GetPlayer(source);

    if (!player?.charId) return false;

    const plate = args.plate;
    const result = await db.getVehiclePlate(plate);
    if (!result) {
      sendChatMessage(source, Locale('failed_to_find'));
      return false;
    }

    await Cfx.Delay(100);

    const success = await db.deleteVehicle(plate);
    if (!success) {
      sendChatMessage(source, Locale('failed_to_delete'));
      return false;
    }

    sendChatMessage(source, Locale('success_deleted'));

    return true;
  }

  public async adminSetVehicle(source: number, args: { model: string }): Promise<boolean> {
    const player = GetPlayer(source);

    if (!player?.charId) return false;

    const model = args.model;

    await Cfx.Delay(100);

    const vehicle = await CreateVehicle({ owner: player.charId, model: model }, player.getCoords());
    if (!vehicle || vehicle.owner !== player.charId) {
      sendChatMessage(source, Locale('failed_to_spawn'));
      return false;
    }

    vehicle.setStored('outside', false);
    sendChatMessage(source, Locale('success_spawned'));

    return true;
  }

  public async adminViewVehicles(source: number, args: { playerId: number }): Promise<boolean> {
    const player = GetPlayer(source);

    if (!player?.charId) return false;

    const playerId = args.playerId;
    const target = GetPlayer(playerId);
    if (!target?.charId) {
      sendChatMessage(source, Locale('no_player_found'));
      return false;
    }

    const vehicles = await db.getOwnedVehicles(target.charId);
    if (vehicles.length === 0) {
      sendChatMessage(source, Locale('no_vehicles_for_player'));
      return false;
    }

    sendChatMessage(source, `^#5e81ac--------- ^#ffffff${target.get('name')} (${playerId}) Owned Vehicles ^#5e81ac---------`);
    sendChatMessage(source, vehicles.map((vehicle: { id: number; plate: string; model: string; stored: string | null }): string => `ID: ^#5e81ac${vehicle.id} ^#ffffff| Plate: ^#5e81ac${vehicle.plate} ^#ffffff| Model: ^#5e81ac${vehicle.model} ^#ffffff| Status: ^#5e81ac${vehicle.stored ?? 'N/A'}^#ffffff --- `).join('\n'));
    await sendLog(`${player.get('name')} (${source}) just used '/playervehicles' on ${target.get('name')} (${target.source}).`);

    return true;
  }
}
