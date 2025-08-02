import Booking from "../models/Booking.js";
import Show from "../models/Show.js"
import Movie from "../models/Movie.js"
import stripe from 'stripe'
import { inngest } from "../inngest/index.js";


const checkSeatAvailability = async (showId, selectedSeats) => {
    try{
        const showData = await Show.findById(showId)
        if(!showData) return false;

        const occupiedSeats = showData.occupiedSeats || {};

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat])

        return !isAnySeatTaken
    }
    catch(err){
        console.log(err.message)
        return false;
    }



    }

export const createBooking = async(req, res) => {
        try {
            const {userId} = req.auth();
            const {showId, selectedSeats}= req.body
            const {origin} = req.headers;

            const isAvailable = await checkSeatAvailability(showId, selectedSeats)
            if(!isAvailable) {
                return res.json({success: false, message: "Selected seats are not available"});
            }

            const showData = await Show.findById(showId)
            const movieData = await Movie.findById(showData.movie)

            const booking = await Booking.create({
                user: userId,
                show: showId,
                amount: showData.showPrice * selectedSeats.length,
                bookedSeats: selectedSeats,
                isPaid: false,
            })
            selectedSeats.map((seat)=>{
                showData.occupiedSeats[seat]= userId;
            })
            showData.markModified('occupiedSeats');

            await showData.save();

            //Stripe gateway init
            const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

            //Line items for stripe
            const line_items=[{
                price_data: {
                    currency: 'usd',
                    product_data:{
                        name: movieData.title
                    },
                    unit_amount: Math.floor(booking.amount * 100) // Convert to cents
                },
                quantity: 1
            }]

            const session = await stripeInstance.checkout.sessions.create({
                success_url: `${origin}/loading/my-bookings`,
                cancel_url:`${origin}/my-bookings`,
                line_items: line_items,
                mode:'payment',
                metadata:{
                    bookingId: booking._id.toString()
                },
                expires_at: Math.floor(Date.now()/1000)+30*60, //expiry in 30 mins
            })
            
            booking.paymentLink= session.url
            await booking.save()


            await inngest.send({
                name: "app/checkpayment",
                data:{
                    bookingId: booking._id.toString()
                }
            })

            res.json({success:true, url:session.url })
        } catch (error) {
            console.log(error.message);
            res.json({
                success:false,
                message:error.message
            })
            
        }
    }

export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        // Free up seats in the show
        const show = await Show.findById(booking.show);
        if (show) {
            booking.bookedSeats.forEach(seat => {
                if (show.occupiedSeats[seat]) {
                    delete show.occupiedSeats[seat];
                }
            });
            show.markModified('occupiedSeats');
            await show.save();
        }
        await Booking.findByIdAndDelete(id);
        res.json({ success: true, message: 'Booking deleted successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const markBookingAsPaid = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findByIdAndUpdate(bookingId, {
            isPaid: true,
            paymentLink: ""
        }, { new: true });
        
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        res.json({ success: true, message: 'Booking marked as paid', booking });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}


export const getOccupiedSeats= async(req, res)=>{
    try{
        const {showId} = req.params;
        const showData = await Show.findById(showId);
        if(!showData) {
            return res.json({success: false, message: "Show not found"});
        }

        const occupiedSeats = Object.keys(showData.occupiedSeats) 

        res.json({
            success: true,

            occupiedSeats
        })
    }catch(err){
        console.log(err.message);
        res.json({
            success:false,
            message:err.message
        })
    }
}