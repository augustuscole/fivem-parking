import { PrismaClient } from '@prisma/client';

const db = new (class Database {
  prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private async handle<T>(operation: Promise<T>, name: string): Promise<T | null> {
    try {
      return await operation;
    } catch (error) {
      console.error(`${name}:`, error);
      return null;
    }
  }

  private async filterVehicle(filter: Record<string, any>) {
    return this.handle(this.prisma.vehicles.findFirst({ where: filter, select: { id: true } }), 'filterVehicle');
  }

  public async getVehicleById(id: number) {
    return (await this.filterVehicle({ id })) ?? false;
  }

  public async getVehicleOwner(id: number, owner: number) {
    return (await this.filterVehicle({ id, owner })) ?? false;
  }

  public async getVehicleStatus(id: number, status: string) {
    return await this.handle(this.prisma.vehicles.findFirst({ where: { id, stored: status } }), 'getVehicleStatus');
  }

  public async getVehiclePlate(plate: string) {
    return await this.handle(this.prisma.vehicles.findFirst({ where: { plate } }), 'getVehiclePlate');
  }

  public async getOwnedVehicles(owner: number) {
    return ((await this.handle(this.prisma.vehicles.findMany({ where: { owner }, select: { id: true, plate: true, owner: true, model: true, stored: true } }), 'getOwnedVehicles')) ?? []);
  }

  public async setVehicleStatus(id: number, status: string) {
    return await this.handle(this.prisma.vehicles.update({ where: { id }, data: { stored: status } }), 'setVehicleStatus');
  }

  public async deleteVehicle(plate: string) {
    return await this.handle(this.prisma.vehicles.delete({ where: { plate } }), 'deleteVehicle');
  }
})();

export default db;
