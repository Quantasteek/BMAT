import { useEffect, useState } from 'react'
import { dummyShowsData } from '../../assets/assets'
import Loading from '../../components/Loading'
import Title from './Title'
import { CheckIcon, DeleteIcon, StarIcon, TimerReset } from 'lucide-react'
import { kConverter } from '../../lib/kConverter'

const AddShows = () => {

    const currency =import.meta.env.VITE_CURRENCY || '$'
    const [nowPlayingMovies, setNowPlayingMovies] = useState([])
    const [selectedMovie, setSelectedMovie]= useState(null)
    const [dateTimeSelection, setDateTimeSelection] = useState({})
    const [dateTimeInput, setDateTimeInput]=useState("")
    const [showPrice, setShowPrice]= useState("");

    const fetchNowPlayingMovies = async()=>{
        setNowPlayingMovies(dummyShowsData)
    }

    const handleDateTimeAdd = () => {
        if(!dateTimeInput) return;
        const [date, time] = dateTimeInput.split('T');
        if(!date || !time) return;

        setDateTimeSelection((prev)=>{
            const times = prev[date]|| [];
            if(!times.includes(time)){
                return {
                    ...prev,
                    [date]: [...times, time]
                }
            }   
                
        })

    }

const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev)=>{
        const filteredTimes = prev[date].filter(t => t !== time);
        if(filteredTimes.length === 0) {
            const {[date]: _, ...rest} = prev;
            return rest;
        }
        return {
            ...prev,
            [date]: filteredTimes
        }
    })
}


    useEffect(()=>{
        fetchNowPlayingMovies();
    }, [])


  return nowPlayingMovies.length > 0 ? (
    <>
    <Title text1="Add" text2="Shows"/>
    <p className='mt-10 text-lg font-medium'>Now Playing Movies</p>
    <div className='overflow-x-auto pb-4'>
        <div className='group flex flex-wrap gap-4 mt-4 w-max'>
            {nowPlayingMovies.map((movie)=>(
                <div key={movie.id} className={`relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300`
                
                }
                onClick={()=>setSelectedMovie(movie._id)}>  
                    <div className='relative rounded-lg overflow-hidden'>
                        <img src={movie.poster_path}alt="" className= 'w-full object-cover brightness-90' />
                        <div className='text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0'>
                            <p className='flex items-center gap-1 text-gray-400'>
                                <StarIcon className='w-4 h-4 text-[#F84565] fill-[#F84565]' />
                                {movie.vote_average.toFixed(1)} 

                            </p>
                            <p className='text-gray-300'>
                                {kConverter(movie.vote_count)} votes
                            </p>
                        </div>
                        { selectedMovie === movie._id && (
                            <div className='absolute top-2 right-2 bg-[#F84565] h-6 w-6 rounded flex items-center justify-center'>
                                <CheckIcon className='w-4 h-4 text-white' strokeWidth={2.5}/>
                            </div>
                        )
                         }

                    </div>
                         <p className='font-medium truncate'> {movie.title} </p>
                        <p className='text-gray-400 text-sm'>{movie.release_date}</p>

                </div>
            ))}
        </div>
    </div>

    {/* Show price input */}    
    <div className='mt-8'>
        <label className='block text-sm font-medium mb-2'>Show Price</label>
        <div className='inline-flex items-center border gap-2 border-gray-600 px-3 py-2 rounded-md'>
            <p className='text-gray-400 text-sm'> {currency} </p>
            <input min={0} type="number" value={showPrice} onChange={(e)=> setShowPrice(e.target.value)} placeholder='Enter show price'
            className='outline-none' />

        </div>

    </div>
    {/* Date and time selection */} 
    <div className='mt-8'>
        <label className='block text-sm font-medium mb-2'>Select Show Date and Time</label>
        <div className='inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg'> 

        <input type="datetime-local" value={dateTimeInput} onChange={(e)=> {
            setDateTimeInput(e.target.value)
            
        }} className='rounded-md outline-none' />
        <button onClick={handleDateTimeAdd} className='bg-[#F84565]/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-[#F84565] cursor-pointer' >Add Time</button>
        </div>
    </div>

    {/* Selected date and time display */}  
        {Object.keys(dateTimeSelection).length > 0 && (
            <div className='mt-6'>
                <h2 className='mb-2'> Selected Date-time</h2>
                <ul className='space-y-3'>
                    {Object.entries(dateTimeSelection).map(([date, times]) => (
                        <li key={date} className='flex items-center gap-3 bg-[#F84565]/10 p-3 rounded-md'>
                            <div className='font-medium'>{date}</div>
                            <div className='flex items-center gap-2 mt-1 text-sm flex-wrap'>
                                {times.map((time) => (
                                    <div key={time} className='border border-[#F84565] px-2 py-1 rounded flex items-center'>
                                        <span>{time}</span>
                                        <DeleteIcon className='ml-2 text-red-500 hover:text-red-700 cursor-pointer' onClick={() => handleRemoveTime(date, time)} />
                                    </div>
                                ))}
                            </div>
                        </li>
                    
                    ))}
                </ul>
                </div>
        )}
        <button className='bg-[#F84565] text-white px-8 py-2 mt-6 rounded hover:bg-[#F84565]/90 transition-all cursor-pointer'>
        Add Show
        </button>
    
    </>
  ): <Loading/>
}

export default AddShows
