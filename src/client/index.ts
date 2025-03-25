import lib, { onServerCallback, triggerServerCallback } from '@overextended/ox_lib/client';
import Locale from '../common/locale';

onServerCallback(
  'fivem-parking:client:listVehicles',
  (vehicles: { id: number; plate: string; model: string; stored: string | null }[]) => {
    const options = vehicles.map((vehicle) => ({
      title: `(#${vehicle.id}) ${vehicle.model} (${vehicle.plate})`,
      description: `${vehicle.stored}`,
      onSelect:
        vehicle.stored === 'stored'
          ? () => triggerServerCallback('fivem-parking:server:spawnVehicle', 200, vehicle.id)
          : undefined,
      disabled: vehicle.stored !== 'stored',
    }));

    lib.registerContext({
      id: 'vehicle_menu',
      title: Locale('your_vehicles'),
      options: options,
    });

    lib.showContext('vehicle_menu');
  },
);
