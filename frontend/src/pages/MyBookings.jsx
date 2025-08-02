import React from 'react'
import { useState, useEffect } from 'react'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/dateFormat'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5V19a2 2 0 002 2h8a2 2 0 002-2V7.5M9.75 11.25v4.5m4.5-4.5v4.5M4.5 7.5h15m-10.125 0V5.25A1.5 1.5 0 0110.875 3.75h2.25a1.5 1.5 0 011.5 1.5V7.5" />
    </svg>
);

const ConfirmModal = ({ open, onClose, onConfirm }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] text-black">
                <h2 className="text-lg font-semibold mb-4">Delete Booking</h2>
                <p className="mb-6">Are you sure you want to delete this booking?</p>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-1 rounded bg-red-500 text-white hover:bg-red-600">Delete</button>
                </div>
            </div>
        </div>
    );
};

const MyBookings = () => {
    const currency = import.meta.env.VITE_CURRENCY || '$'
    const [bookings, setBookings] = useState([])  
    const [isLoading, setIsLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [bookingToDelete, setBookingToDelete] = useState(null)

    const { axios, getToken, user, image_base_url}= useAppContext()

    const getMyBookings = async () => {
        try {
            const {data}= await axios.get('/api/user/bookings', {
              headers: {Authorization: `Bearer ${await getToken()}`}  
            })
            if(data.success){
                setBookings(data.bookings)
            }
        } catch(error) {
            console.log(error)
            toast.error(error)
        }
        setIsLoading(false)
    }

    // Delete booking handler
    const handleDeleteBooking = async () => {
        if (!bookingToDelete) return;
        try {
            const { data } = await axios.delete(`/api/booking/${bookingToDelete}`, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });
            if (data.success) {
                setBookings(bookings.filter(b => b._id !== bookingToDelete));
                toast.success('Booking deleted');
            } else {
                toast.error(data.message || 'Failed to delete booking');
            }
        } catch {
            toast.error('Failed to delete booking');
        }
        setModalOpen(false);
        setBookingToDelete(null);
    }

    const openDeleteModal = (bookingId) => {
        setBookingToDelete(bookingId);
        setModalOpen(true);
    }

    const closeDeleteModal = () => {
        setModalOpen(false);
        setBookingToDelete(null);
    }

    useEffect(() => {
        if(user){
            getMyBookings()
        }
    }, [user]) 

    // Refresh bookings when page becomes visible (user returns from payment)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && user) {
                getMyBookings();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user]);

    // Refresh bookings every 30 seconds to check for payment updates
    useEffect(() => {
        if (!user) return;
        
        const interval = setInterval(() => {
            getMyBookings();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [user]);

  return !isLoading ? (
    <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
        <BlurCircle top='100px' left='100px'/>
        <div>
            <BlurCircle bottom='0px' left ="600px"/>

        </div>
        <h1 className='text-lg font-semibold mb-4'>My Bookings</h1>
        {bookings.map((item, index)=>(
            <div key={index} className='flex flex-col md:flex-row justify-between  bg-[#F84565]/8 border border-[#F84565]/20 rounded-lg mt-4 p-2 max-w-3xl'>
                <div className='flex flex-col md:flex-row'>
                    <img src={ image_base_url + item.show.movie.poster_path} alt="" className='md:max-w-45 aspect-video h-auto object-cover object-bottom rounded' />
                    <div className='flex flex-col p-4'> 
                        <p className='text-lg font-semibold'>{item.show.movie.title}</p>
                        <p className='text-gray-400 text-sm'>{timeFormat(item.show.movie.runtime)}</p>
                        <p className='text-gray-400 text-sm mt-auto'>{dateFormat(item.show.showDateTime)}</p>
                    </div>
                </div>
                <div className='flex flex-col md:items-end md:text-right justify-between p-4 ' >
                    <div className='flex items-center gap-4'>
                        <p className='text-2xl font-semibold mb-3'>{currency}{item.amount}</p>
                        {!item.isPaid && (
                            <>
                                <Link to={item.paymentLink} className='bg-[#F84565] px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer'>Pay now</Link>
                                <button
                                    className='ml-2 mb-4 text-gray-400 hover:text-red-600'
                                    title='Delete booking'
                                    onClick={() => openDeleteModal(item._id)}
                                >
                                    <TrashIcon />
                                </button>
                            </>
                        )}
                    </div>
                    <div className='text-sm'>
                        <p>
                            <span className='text-gray-400'>
                                Total tickets: 
                            </span>
                            {item.bookedSeats.length}   
                         </p>
                        <p>
                            <span className='text-gray-400'>
                                Seat Numbers:    
                            </span>
                            {item.bookedSeats.join(', ')}   
                         </p>
                    </div>

                </div>
            </div>
        ))}
        <ConfirmModal open={modalOpen} onClose={closeDeleteModal} onConfirm={handleDeleteBooking} />
      
    </div>
  ):(
    <Loading/>
  )
}

export default MyBookings
