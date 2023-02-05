import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createTicketTypeRemote() {
    return prisma.ticketType.create({
      data: {
        name: faker.name.findName(),
        price: faker.datatype.number(),
        isRemote: true,
        includesHotel: faker.datatype.boolean(),
      },
    });
  }
export async function createTicketTypeWithoutHotel() {
    return prisma.ticketType.create({
      data: {
        name: faker.name.findName(),
        price: faker.datatype.number(),
        isRemote: false,
        includesHotel: false,
      },
    });
}

export async function createTicketTypeWithHotel() {
    return prisma.ticketType.create({
      data: {
        name: faker.name.findName(),
        price: faker.datatype.number(),
        isRemote: false,
        includesHotel: true,
      },
    });
}


export async function createHotel() {
    return prisma.hotel.create({
      data: {
        name: faker.name.findName(),
        image: faker.image.imageUrl(),
      }
    });
}
  
export async function createRoom(hotelId: number) {
    return prisma.room.create({
      data: {
        name: faker.name.findName(),
        capacity: faker.datatype.number(),
        hotelId
      }
    });
}
  
