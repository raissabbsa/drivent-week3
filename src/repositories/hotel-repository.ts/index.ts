import { prisma } from "@/config";

async function findEnrollmentWithUserId( id: number) {
    return prisma.enrollment.findFirst({
        where: {
            userId: id
        }
    });
}

async function findTicketWithEnrollmentId( id: number ) {
    return prisma.ticket.findFirst({
        where: {
            enrollmentId: id
        }
    });
}

async function findTicketTypeId( id: number ) {
    return prisma.ticketType.findFirst({
        where: { id }
    });
}

async function sendHotels() {
    return prisma.hotel.findMany();
}

async function sendHotelWithRooms( hotelId: number ) {
    return prisma.hotel.findFirst({
        where: { id: hotelId },
        select: {
            id: true,
            name: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            Rooms: true

        }
    })
}

async function findHotel( id: number ) {
    return prisma.hotel.findFirst({
        where: { id }
    })
}

const hotelRepository = {
    findEnrollmentWithUserId,
    findTicketWithEnrollmentId,
    findTicketTypeId,
    findHotel,
    sendHotels,
    sendHotelWithRooms
}

export default hotelRepository;