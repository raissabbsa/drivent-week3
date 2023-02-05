import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    try{
        const { userId } = req;

        const hotels = await hotelService.verifyGetHotels(userId);
        return res.status(httpStatus.OK).send(hotels);

    } catch (error) { 
        if(error.name === "payment required") {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
        }
        else if(error.name === "not found") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        else{
            return res.sendStatus(httpStatus.BAD_REQUEST);
        }
    }
}

export async function getHotelsId(req: AuthenticatedRequest, res: Response) {
    const hotelId: string = req.params.hotelId;
    const { userId } = req;
    try{
        const hotelWithRooms = await hotelService.verifyGetHotelsId(userId, Number(hotelId));
        return res.status(httpStatus.OK).send(hotelWithRooms);
        
    } catch (error) { 
        if(error.name === "payment required") {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
        }
        else if(error.name === "not found") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        else{
            return res.sendStatus(httpStatus.BAD_REQUEST);
        }
    }
}