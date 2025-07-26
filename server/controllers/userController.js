import { clerkClient } from "@clerk/express";
import Movie from "../models/Movie.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

export const getUserBookings = async (req, res) => {
    try {
        const user= req.auth().userId;

        const bookings = await Booking.find({user}).sort({createdAt: -1});

        // Manually populate show and movie data since they're stored as strings
        const populatedBookings = await Promise.all(
            bookings.map(async (booking) => {
                const show = await Show.findById(booking.show);
                if (show) {
                    const movie = await Movie.findById(show.movie);
                    
                    return {
                        ...booking.toObject(),
                        show: {
                            ...show.toObject(),
                            movie: movie ? movie.toObject() : null
                        }
                    };
                }
                return booking.toObject();
            })
        );

        // console.log('Final populated bookings:', JSON.stringify(populatedBookings, null, 2));

        res.json({
            success: true,
            bookings: populatedBookings
        })
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//API controller function to addd fav movie in clerk user metadata

export const addFavMovie = async (req, res) => {
    try {
        const {movieId}= req.body;
        const userId = req.auth().userId
        
        const user = await clerkClient.users.getUser(userId)

        if(!user.privateMetadata.favorites){
            user.privateMetadata.favorites = []
        }
        if(!user.privateMetadata.favorites.includes(movieId)){
            user.privateMetadata.favorites.push(movieId)
        }
        await clerkClient.users.updateUserMetadata(userId, {privateMetadata:user.privateMetadata})

        res.json({
            success:true,
            message:"favourite added successfully"
        })
        
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const updateFavorite = async (req, res) => {
    try {
        const {movieId}= req.body;
        const userId = req.auth().userId
        
        const user = await clerkClient.users.getUser(userId)

        if(!user.privateMetadata.favorites){
            user.privateMetadata.favorites = []
        }

        if(!user.privateMetadata.favorites.includes(movieId)){
            user.privateMetadata.favorites.push(movieId)
        }
        else{
            user.privateMetadata.favorites= user.privateMetadata.favorites.filter(item => item !== movieId)
        }
        await clerkClient.users.updateUserMetadata(userId, {privateMetadata:user.privateMetadata})

        res.json({
            success:true,
            message:"favourite updated successfully"
        })
        
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// export const getFavorites = async(req, res)=>{
//     try {
//         const user = await clerkClient.users.getUser(req.auth().userId)
//         const favorites= user.privateMetadata.favorites

//         //get movies from db

//         const movies = await Movie.find({_id: {$in: favorites}})

//         res.json({success:true, movies})
//     } catch (error) {
//         console.log(error.message);
//         res.json({success: false, message: error.message})
        
//     }
// }

export const getFavorites = async(req, res) => {
    try {
        // Check for auth
        const auth = req.auth();
        if (!auth || !auth.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Get user and check for favorites
        const user = await clerkClient.users.getUser(auth.userId);
        if (!user.privateMetadata?.favorites) {
            return res.json({
                success: true,
                movies: [] // Return empty array if no favorites exist
            });
        }

        // Get movies from database
        const movies = await Movie.find({
            _id: { $in: user.privateMetadata.favorites }
        }).lean();

        return res.json({
            success: true,
            movies
        });

    } catch (error) {
        console.error("Error in getFavorites:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}