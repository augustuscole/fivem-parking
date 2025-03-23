import * as Cfx from '@nativewrappers/fivem';
import { CreateVehicle, GetPlayer, GetVehicle } from '@overextended/ox_core/server';
import { triggerClientCallback } from '@overextended/ox_lib/server';
import Config from '../../common/config';
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

  async listVehicles(source: number) {
    const player = GetPlayer(source);

    if (!player?.charId) return [];

    const vehicles = await db.getOwnedVehicles(player.charId);
    if (!vehicles || vehicles.length === 0) {
      sendChatMessage(source, '^#d73232You do not own any vehicles!');
      return [];
    }

    triggerClientCallback('fivem-parking:client:listVehicles', source, vehicles);

    return vehicles;
  }

  async parkVehicle(source: number): Promise<boolean> {
    const player = GetPlayer(source);

    if (!player?.charId) return false;

    const ped = GetVehiclePedIsIn(GetPlayerPed(source), false);
    if (ped === 0) {
      sendChatMessage(source, '^#d73232You are not inside a vehicle!');
      return false;
    }

    const vehicle = GetVehicle(ped);
    if (!vehicle?.owner) {
      sendChatMessage(
        source,
        `^#d73232You are not the owner of this vehicle ^#ffffff(${vehicle?.plate || 'unknown'})^#d73232.`,
      );
      return false;
    }

    if (!hasItem(source, 'money', Config.Garage.StoreCost)) {
      sendChatMessage(source, `^#d73232You need ^#ffffff$${Config.Garage.StoreCost} ^#d73232to park your vehicle.`);
      return false;
    }

    const success = await removeItem(source, 'money', Config.Garage.StoreCost);
    if (!success) return false;

    vehicle.setStored('stored', true);
    sendChatMessage(
      source,
      `^#5e81acYou paid ^#ffffff$${Config.Garage.StoreCost} ^#5e81acto park your vehicle ^#ffffff${vehicle.model} ^#5e81acwith plate number ^#ffffff${vehicle.plate}.`,
    );
    await sendLog(
      `[VEHICLE] ${player.get('name')} (${source}) just parked vehicle #${vehicle.id} with plate #${vehicle.plate} at X: ${player.getCoords()[0]} Y: ${player.getCoords()[1]} Z: ${player.getCoords()[2]}, dimension: #${GetPlayerRoutingBucket(String(source))}.`,
    );

    return true;
  }

  async returnVehicle(source: number, args: { vehicleId: number }): Promise<boolean> {
    const player = GetPlayer(source);

    if (!player?.charId) return false;

    const vehicleId = args.vehicleId;
    const coords = player.getCoords();
    if (!getArea({ x: coords[0], y: coords[1], z: coords[2] }, Config.Impound.Location)) {
      sendChatMessage(source, '^#d73232You are not in the impound area!');
      return false;
    }

    const owner = await db.getVehicleOwner(vehicleId, player.charId);
    if (!owner) {
      sendChatMessage(source, '^#d73232You cannot restore a vehicle you do not own!');
      return false;
    }

    const status = await db.getVehicleStatus(vehicleId, 'impound');
    if (!status) {
      sendChatMessage(source, `^#d73232Vehicle with id ^#ffffff${vehicleId} ^#d73232is not impounded.`);
      return false;
    }

    if (!hasItem(source, 'money', Config.Impound.Cost)) {
      sendChatMessage(source, `^#d73232You need ^#ffffff$${Config.Impound.Cost} ^#d73232to restore your vehicle.`);
      return false;
    }

    const success = await removeItem(source, 'money', Config.Impound.Cost);
    if (!success) return false;

    await db.setVehicleStatus(vehicleId, 'stored');
    sendChatMessage(source, `^#5e81acYou paid ^#ffffff$${Config.Impound.Cost} ^#5e81acto restore your vehicle.`);

    return true;
  }

  async adminGiveVehicle(source: number, args: { model: string; playerId: number }): Promise<boolean> {
    const player = GetPlayer(source);

    if (!player?.charId) return false;

    const model = args.model;
    const playerId = args.playerId;

    const target = GetPlayer(playerId);
    if (!target?.charId) {
      sendChatMessage(source, `^#d73232No player found with id ^#ffffff${playerId}^#d73232.`);
      return false;
    }

    await Cfx.Delay(100);

    const vehicle = await CreateVehicle({ owner: target.charId, model: model }, player.getCoords());
    if (!vehicle || vehicle.owner !== target.charId) {
      sendChatMessage(source, '^#d73232Failed to give vehicle.');
      return false;
    }

    vehicle.setStored('stored', true);
    sendChatMessage(
      source,
      `^#5e81acSuccessfully gave vehicle ^#ffffff${vehicle.make} ${model} (${vehicle.plate}) ^#5e81acto ^#ffffff${target.get('name')}`,
    );

    return true;
  }

  async adminDeleteVehicle(source: number, args: { plate: string }): Promise<boolean> {
    const player = GetPlayer(source);

    if (!player?.charId) return false;

    const plate = args.plate;
    const result = await db.getVehiclePlate(plate);
    if (!result) {
      sendChatMessage(source, `^#d73232Vehicle with plate number ^#ffffff${plate} ^#d73232does not exist.`);
      return false;
    }

    await Cfx.Delay(100);

    const success = await db.deleteVehicle(plate);
    if (!success) {
      sendChatMessage(
        source,
        `^#d73232Failed to delete vehicle with plate number ^#ffffff${plate} ^#d73232from the database.`,
      );
      return false;
    }

    sendChatMessage(
      source,
      `^#5e81acSuccessfully deleted vehicle with plate number ^#ffffff${plate} ^#5e81acfrom the database.`,
    );

    return true;
  }

  async adminSetVehicle(source: number, args: { model: string }): Promise<boolean> {
    const player = GetPlayer(source);

    if (!player?.charId) return false;

    const model = args.model;

    await Cfx.Delay(100);

    const vehicle = await CreateVehicle({ owner: player.charId, model: model }, player.getCoords());
    if (!vehicle || vehicle.owner !== player.charId) {
      sendChatMessage(source, '^#d73232Failed to spawn vehicle or set ownership.');
      return false;
    }

    vehicle.setStored('outside', false);
    sendChatMessage(
      source,
      `^#5e81acSuccessfully spawned vehicle ^#ffffff${vehicle.make} ${vehicle.model} ^#5e81acwith plate number ^#ffffff${vehicle.plate} ^#5e81acand set it as owned.`,
    );

    return true;
  }

  async adminViewVehicles(source: number, args: { playerId: number }): Promise<boolean> {
    const player = GetPlayer(source);

    if (!player?.charId) return false;

    const playerId = args.playerId;
    const target = GetPlayer(playerId);
    if (!target?.charId) {
      sendChatMessage(source, `^#d73232No player found with id ^#ffffff${playerId}^#d73232.`);
      return false;
    }

    const vehicles = await db.getOwnedVehicles(target.charId);
    if (vehicles.length === 0) {
      sendChatMessage(source, `^#d73232No vehicles found for player with id ^#ffffff${playerId}^#d73232.`);
      return false;
    }

    sendChatMessage(
      source,
      `^#5e81ac--------- ^#ffffff${target.get('name')} (${playerId}) Owned Vehicles ^#5e81ac---------`,
    );
    sendChatMessage(
      source,
      vehicles
        .map(
          (vehicle: { id: number; plate: string; model: string; stored: string | null }): string =>
            `ID: ^#5e81ac${vehicle.id} ^#ffffff| Plate: ^#5e81ac${vehicle.plate} ^#ffffff| Model: ^#5e81ac${vehicle.model} ^#ffffff| Status: ^#5e81ac${vehicle.stored ?? 'N/A'}^#ffffff --- `,
        )
        .join('\n'),
    );
    await sendLog(
      `${player.get('name')} (${source}) just used '/playervehicles' on ${target.get('name')} (${target.source}).`,
    );

    return true;
  }
}
