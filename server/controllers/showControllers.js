import axios from 'axios';
import Movie from '../models/Movie';

//API to fetch now playing movies from TMDB

export const getNowPlayingMovies = async (req, res) => {
    try{
        const {data}=  await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
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
            headers:{Authorization: `Bearer ${process.env.TMDB_API_KEY}`},
        }),
    axios.get()
    ])
        }
              
    }
    catch(error) {
        console.error("Error adding show:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}