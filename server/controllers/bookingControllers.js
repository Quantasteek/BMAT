import Booking from "../models/Booking.js";
import Show from "../models/Show.js"

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

            const showData = await Show.findById(showId).populate('movie')

            const booking = await Booking.create({
                user: userId,
                show: showId,
                amount: showData.showPrice * selectedSeats.length,
                bookedSeats: selectedSeats,
                isPaid: false,
                // paymentLink: `${origin}/payment?showId=${showId}&userId=${userId}&amount=${showData.movie.ticketPrice * selectedSeats.length}`
            })
            selectedSeats.map((seat)=>{
                showData.occupiedSeats[seat]= userId;
            })
            showData.markModified('occupiedSeats');

            await showData.save();

            //Stripe gateway init

            res.json({
                success: true,
                message:'Booked successfully'
            })
        } catch (error) {
            console.log(error.message);
            res.json({
                success:false,
                message:error.message
            })
            
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