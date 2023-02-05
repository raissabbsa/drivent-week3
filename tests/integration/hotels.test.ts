import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { createEnrollmentWithAddress, createTicket, createTicketType, createUser} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import * as jwt from "jsonwebtoken";
import { createHotel, createRoom, createTicketTypeRemote, createTicketTypeWithHotel, createTicketTypeWithoutHotel } from "../factories/hotels-factory";
import { TicketStatus } from "@prisma/client";

beforeAll(async() => {
    await init();
});

beforeEach(async() => {
    await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
    it("should respond with status 401 if no token is given", async() => {
        const reponse = await server.get("/hotels");
        expect(reponse.status).toBe(401);
    });

    it("should respond with status 401 if given token is not valid", async() => {
        const token = faker.lorem.word();

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async() => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid, ", () => {
        it("should respond with status 404 when user doesnt have an enrollment yet", async () => {
            const token = await generateValidToken();
      
            const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      
            expect(response.status).toBe(httpStatus.NOT_FOUND);
          });

        it("should respond with status 402 when ticket has not been paid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user); 
            const ticketType = await createTicketType();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

            const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 402 when ticketType is remote", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user); 
            const ticketType = await createTicketTypeRemote();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

            const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 402 when ticketType doesn't include hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user); 
            const ticketType = await createTicketTypeWithoutHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

            const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 200 and hotel data when there is a enrollment and ticket for given user", async() => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();

            const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        image: expect.any(String),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                    })
                ])
            )
        });
    });
});

describe("GET /hotels/:hotelId", () => {
    it("should respond with status 401 if no token is given", async() => {
        const reponse = await server.get("/hotels/1");
        expect(reponse.status).toBe(401);
    });

    it("should respond with status 401 if given token is not valid", async() => {
        const token = faker.lorem.word();

        const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async() => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);

    });

    describe("when token is valid, ", () => {
        it("should respond with status 404 when user doesnt have an enrollment yet", async() => {
            const token = await generateValidToken();
            await createHotel();
            
            const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
      
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with status 404 when hotelId doesn't exist", async() => {
            const token = await generateValidToken();
      
            const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
      
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with status 402 when ticket has not been paid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user); 
            const ticketType = await createTicketType();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            await createHotel();

            const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
      
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 402 when ticketType is remote", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user); 
            const ticketType = await createTicketTypeRemote();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createHotel();

            const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
      
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 402 when ticketType doesn't include hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user); 
            const ticketType = await createTicketTypeWithoutHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            await createHotel();

            const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
      
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 200 and hotel data when there is a enrollment and ticket for given user", async() => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            await createRoom(hotel.id);

            const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

            expect(response.body).toEqual(
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        image: expect.any(String),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                        Rooms: expect.arrayContaining([
                            expect.objectContaining({
                                id: expect.any(Number),
                                name: expect.any(String),
                                capacity: expect.any(Number),
                                hotelId: expect.any(Number),
                                createdAt: expect.any(String),
                                updatedAt: expect.any(String),
                            })
                        ])
                    })
            )
        });

    });
});