import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository.ts";
import httpStatus from "http-status";

async function verifyGetHotels( userId: number ) {
    const enrollment = await hotelRepository.findEnrollmentWithUserId(userId);
    if(!enrollment) throw { name: "not found"};

    const ticket = await hotelRepository.findTicketWithEnrollmentId(enrollment.id);
    if(!ticket) throw { name: "not found"};

    const ticketType = await hotelRepository.findTicketTypeId(ticket.ticketTypeId);
    if(!ticketType) throw { name: "not found"};

    if(ticket.status === "RESERVED" || ticketType.isRemote || !ticketType.includesHotel){
        throw { name: "payment required"};
    }
    const hotels = await hotelRepository.sendHotels();
    return hotels;  
}

async function verifyGetHotelsId( userId: number, hotelId: number ) {
    const enrollment = await hotelRepository.findEnrollmentWithUserId(userId);
    if(!enrollment) throw { name: "not found"};

    const ticket = await hotelRepository.findTicketWithEnrollmentId(enrollment.id);
    if(!ticket) throw { name: "not found"};

    const ticketType = await hotelRepository.findTicketTypeId(ticket.ticketTypeId);
    if(!ticketType) throw { name: "not found"};

    const existHotel = await hotelRepository.findHotel(hotelId);
    if(!existHotel) throw { name: "not found"};
    
    if(ticket.status === "RESERVED" || ticketType.isRemote || !ticketType.includesHotel){
        throw { name: "payment required"};
    }
    const hotel = await hotelRepository.sendHotelWithRooms(hotelId);
    return hotel;
}

const hotelService = {
    verifyGetHotels,
    verifyGetHotelsId
}

export default hotelService;