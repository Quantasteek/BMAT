import Booking from "../models/Booking.js"
import Show from "../models/Show.js"
import User from "../models/User.js"

export const isAdmin = (req, res) =>{
    res.json({
        success: true,
        isAdmin:true
    })
}

// export const getDashboardData = async (req, res) => {   

//     try {
//         const bookings = await Booking.find({isPaid: true})

//         const activeShows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie')

//         const totalUser = await User.countDocuments() 

//         const dashboardData = {
//             totalBookings: bookings.length,
//             totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),       
//             activeShows,
//             totalUser
//             }

//         res.json({success: true, dashboardData})
//     } catch (error) {
//      res.json({success: false, message: error.message})   
//     }
// }

export const getDashboardData = async (req, res) => {   
    try {
        const bookings = await Booking.find({isPaid: true})

        const activeShows = await Show.find({
            showDateTime: {$gte: new Date()}
        }).populate({
            path: 'movie',
            model: 'Movie',
            select: 'title poster_path vote_average release_date' // Specify fields to populate
        });
        // console.log("Active Shows with populated movies:", 
        //     JSON.stringify(activeShows.map(show => ({
        //         id: show._id,
        //         movieData: show.movie
        //     })), null, 2)
        // );

        const totalUser = await User.countDocuments() 

        // Add debug logging
        

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),       
            activeShows,
            totalUser
        }

        res.json({success: true, dashboardData})
    } catch (error) {
        console.error("Dashboard Error:", error); // Better error logging
        res.status(500).json({success: false, message: error.message})   
    }
}


//API to get all shows



export const getAllShows = async (req, res) => {
    try{
        const shows = await Show.find({showDateTime: {$gte :new Date()}}).populate({
            path: 'movie',
            model: 'Movie',
            select: 'title vote_average release_date' // Specify fields to populate
        }).sort({showDateTime: 1})
        res.json({success: true, shows})
    }catch(err){
        console.log(err.message);
        res.json({success: false, message: err.message})
    }
}

//API to get all bookings   

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
        .populate('user')
        .populate({
            path: 'show',
            populate: {path: 'movie'}
        }).sort({createdAt: -1})
        res.json({success: true, bookings})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}