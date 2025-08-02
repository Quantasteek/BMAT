import axios from 'axios';
import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import dotenv from 'dotenv';
import { inngest } from '../inngest/index.js';
dotenv.config();

//API to fetch now playing movies from TMDB

export const getNowPlayingMovies = async (req, res) => {
    try{
        const {data}=  await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            accept: 'application/json',
            headers:{Authorization: `Bearer ${process.env.TMDB_API_KEY}`},
        })
        const movies= data.results;
        res.json({success:true, movies:movies})
    }catch(error) {
        console.error("Error fetching now playing movies:", error);
        res.status(500).json({ error: "Internal server error" });
        res.json({success:false, message:error.message})
    }
}

//API TO ADD NEW SHOW TO DB

export const addShow = async(req, res)=>{
    try{
        const {movieId, showsInput, showPrice} = req.body;
        let movie = await Movie.findById(movieId);
        if(!movie) {
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
            headers:{
                accept: 'application/json',
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`
            }
        }),
    axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
        headers:{
            accept: 'application/json',
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`
        }
    })
    ])
    const movieApiData = movieDetailsResponse.data;
    const movieCreditsData = movieCreditsResponse.data;
    const movieDetails = {
        _id:movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime
    }
    movie = await Movie.create(movieDetails);
        

}

    const showsToCreate = []
    showsInput.forEach((show) => {
        const showDate = show.date;
        show.time.forEach((time)=>{
            const dateTimeString = `${showDate}T${time}`
            showsToCreate.push({
                movie: movieId,
                showDateTime: new Date(dateTimeString),
                showPrice,
                occupiedSeats:{}
            })
        })
    });
    if(showsToCreate.length>0){
        await Show.insertMany(showsToCreate);   
    }

    await inngest.send({
        name:"app/show.added",
        data:{movieTitle: movie.title}
    })

    res.json({success:true, message:"Show added successfully"}) 
              
}
    catch(error) {
        console.error("Error adding show:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

//API to get all shows from db

// export const getShows = async(req, res)=>{
//     try{
//         const shows = await Show.find({showDateTime: {$gte: new Date()}})
//         .populate('movie')
//         .sort({showDateTime: 1});

//         const uniqueShows = new Set(shows.map(show => show.movie))

//         res.json({success:true, shows:Array.from(uniqueShows)});       

//     }catch(error) {
//         console.error("Error fetching shows:", error);
//         res.json({success:false, message:error.message});
//     }
// }

export const getShows = async(req, res)=>{
    try {
        const shows = await Show.find({showDateTime: {$gte: new Date()}})
            .populate({
                path: 'movie',
                model: 'Movie'
            })
            .sort({showDateTime: 1})
            .lean(); // Convert to plain JavaScript objects

        // Get unique movies while preserving full object data
        const uniqueMovies = [];
        const seen = new Set();
        
        shows.forEach(show => {
            if (show.movie && !seen.has(show.movie._id)) {
                uniqueMovies.push(show.movie);
                seen.add(show.movie._id);
            }
        });

        res.json({
            success: true,
            shows: uniqueMovies
        });       

    } catch(error) {
        console.error("Error fetching shows:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//API to get single show from db

export const getShow = async(req, res)=>{
    try {
        const {movieId}= req.params;
        const shows = await Show.find({movie: movieId, showDateTime: {$gte: new Date()}})    
        
        const movie = await Movie.findById(movieId);
        const dateTime = {};

        shows.forEach((show)=>{
            const date = show.showDateTime.toISOString().split('T')[0];
            if(!dateTime[date]){
                dateTime[date]=[]
            }
            dateTime[date].push({time: show.showDateTime, showId: show._id})
        })

        res.json({success:true, movie, dateTime})

    } catch (error) {
        console.error("Error fetching show:", error);
        res.status(500).json({ error: "Internal server error" });
        
    }
}