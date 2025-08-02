import { Inngest } from "inngest";
import User from "../models/User.js";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";

export const inngest = new Inngest({ id: "book-a-ticket" });

//Inngest function to save user data 

const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event})=>{
        const {id, first_name, last_name, email_addresses, profile_image_url} = event.data;
        const userData = {
            _id: id,
            name: `${first_name} ${last_name}`,
            email: email_addresses[0].email_address,
            image: profile_image_url
        }
        await User.create(userData)
    } 
)

//Inngest fn to delete user 

const syncUserDeletion = inngest.createFunction(
    {id: 'sync-user-deletion'},
    {event: 'clerk/user.deleted'},
    async ({event})=>{
        const {id} = event.data;
        await User.findByIdAndDelete(id);
     }
)

//Ingest function to update user data

const syncUserUpdation = inngest.createFunction(
    {id: 'sync-user-updation'},
    {event: 'clerk/user.updated'},
    async ({event})=>{
        const {id, first_name, last_name, email_addresses, profile_image_url} = event.data;
        const userData = {
            _id: id,
            name: `${first_name} ${last_name}`,
            email: email_addresses[0].email_address,
            image: profile_image_url
        }
        await User.findByIdAndUpdate(id);
     }
)

//Inngest fn to cancel booking and release show seats after 10 mins of booking created if payment not made

const releaseSeatsAndDeleteBooking = inngest.createFunction(
    {id:'release-seats-delete-booking'},
    {event: "app/checkpayment"},

    async ({event, step}) => {
        const tenMinutesLater= new Date(Date.now()+ 10*60*1000)
        await step.sleepUntil('wait-for-10-minutes', tenMinutesLater)
        await step.run('check-payment-status', async () => {
            const bookingId= event.data.bookingId;
            const booking = await Booking.findById(bookingId)

            if(!booking.isPaid){
                const show = await Show.findById(booking.show);
                booking.bookedSeats.forEach((seat)=>{
                    delete show.occupiedSeats[seat]
                })
                show.markModified('occupiedSeats')
                await show.save()
                await Booking.findByIdAndDelete(booking._id)
            }
        })
    }
)

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking ];

