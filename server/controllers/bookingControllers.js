import Booking from "../models/Booking";
import Show from "../models/Show"

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