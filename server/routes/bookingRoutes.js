import express from 'express';
import { createBooking, getOccupiedSeats, deleteBooking, markBookingAsPaid } from '../controllers/bookingControllers.js';

const bookingRouter = express.Router();

bookingRouter.post('/create', createBooking)
bookingRouter.get('/seats/:showId', getOccupiedSeats)
bookingRouter.delete('/:id', deleteBooking)
bookingRouter.patch('/:bookingId/mark-paid', markBookingAsPaid)

export default bookingRouter;