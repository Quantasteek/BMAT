import express from 'express';
import { createBooking, getOccupiedSeats, deleteBooking } from '../controllers/bookingControllers.js';

const bookingRouter = express.Router();

bookingRouter.post('/create', createBooking)
bookingRouter.get('/seats/:showId', getOccupiedSeats)
bookingRouter.delete('/:id', deleteBooking)

export default bookingRouter;