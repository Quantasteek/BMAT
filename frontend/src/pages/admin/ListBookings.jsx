import React, { useEffect, useState } from 'react'
import { dummyBookingData } from '../../assets/assets';
import Loading from '../../components/Loading';
import Title from './Title';
import { dateFormat } from '../../lib/dateFormat';
import { useAppContext } from '../../context/AppContext';

const ListBookings = () => {

    const {axios, getToken, user }= useAppContext()

    const currency = import.meta.env.VITE_CURRENCY

    const [bookings, setBookings]=useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getAllBookings = async()=>{
        try {
            
            const {data} = await axios.get("/api/admin/all-bookings",{
                   headers: {Authorization: `Bearer ${await getToken()}`}
               } )
               setBookings(data.bookings)
           
           setIsLoading(false)
        } catch (error) {
            console.error(error)
        }
    }
    useEffect(()=>{
        if(user){

            getAllBookings()
        }
    }, [user])

  return !isLoading?  (
    <>
    <Title text1="List" text2="Bookings"/>
    <div className='max-w-4xl mt-6 overflow-x-auto'>
        <table className='w-full border-collapse rounded-md overflow-hidden text-nowrap'>
            <thead>
                <tr className='bg-[#F84565]/20 text-left text-white'>
                    <th className='font-medium p-2 pl-5'>User Name</th>
                    <th className='font-medium p-2'>Movie Name</th>
                    <th className='font-medium p-2'>Show Time</th>
                    <th className='font-medium p-2'>Seats</th>
                    <th className='font-medium p-2'>Amount</th>
                </tr>
            </thead>
            <tbody>
                {bookings.map((item, index)=>(
                    <tr key={index} className='border-b border-[#F84565]/20 bg-[#F84565]/5 even:bg-[#F84565]/10'>
                        <td className='p-2 min-w-45 pl-5'> {item.user.name} </td>
                        <td className='p-2'>
                            {item.show.movie.title}
                        </td>
                        <td className='p-2'>
                            {dateFormat(item.show.showDateTime)}
                        </td>
                        <td className='p-2'>
                            {Object.keys(item.bookedSeats).map(seat=> item.bookedSeats[seat]).join(", ")}
                        </td>
                        <td className='p-2'>
                            {currency} {item.amount}
                        </td>

                    </tr>
                ))}
            </tbody>

        </table>
    </div>

    </>
  ) : <Loading/>
}

export default ListBookings
