import { Inngest } from "inngest";
import User from "../models/User.js";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import sendEmail from "../config/nodeMailer.js";

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

const sendBookingConfirmationEmail = inngest.createFunction(
    {id: "send-booking-confirmation-email"},
    {event: "app/show.booked"},
    async({event,step}) =>{
        const {bookingId} = event.data;
        const booking = await Booking.findById(bookingId).populate({
            path:'show',
            populate: {path:"movie", model: "Movie"}

        }).populate('user');
        await sendEmail({
            to: booking.user.email,
            subject: `Payment confirmation: ${booking.show.movie.title} booked!  `,
            body: `
            <!DOCTYPE html>
        <html>
<head>
  <meta charset="UTF-8">
  <title>Booking Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      background-color: #ffffff;
      max-width: 600px;
      margin: 20px auto;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #4CAF50;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 20px;
      line-height: 1.6;
      color: #333333;
    }
    .details {
      background-color: #f9f9f9;
      border: 1px solid #dddddd;
      padding: 15px;
      border-radius: 6px;
      margin-top: 10px;
    }
    .details p {
      margin: 8px 0;
    }
    .footer {
      background-color: #eeeeee;
      color: #666666;
      text-align: center;
      font-size: 12px;
      padding: 15px;
    }
    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: #ffffff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Booking Confirmation</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${booking.user.name}</strong>,</p>
      <p>Thank you for your booking! 🎉 Your ticket has been successfully confirmed. Here are your booking details:</p>
      
      <div class="details">
        <
        <p><strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString('en-US', {timeZone: 'Asia/Kolkata'})}</p>
        <p><strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString('en-US', {timeZone: 'Asia/Kolkata'})} </p>
      </div>
      
      <p><strong>Important Notes:</strong></p>
      <ul>
        <li>Please arrive at least 10 minutes before the event.</li>
        <li>Bring a valid ID and this confirmation email (digital or printed).</li>
        <li>For queries, contact us at <a href="mailto:[Support Email]">[Support Email]</a> or call [Phone Number].</li>
      </ul>
      
      
    </div>
    <div class="footer">
      &copy; [2025] [BMAT]. All rights reserved.
    </div>
  </div>
</body>
</html>

            
            `
        })
    },
)

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking, sendBookingConfirmationEmail ];

