import stripe from 'stripe'
import Booking from '../models/Booking.js';

export const stripeWebHooks = async (req, res) => {
    console.log('Webhook received:', req.method, req.url);
    console.log('Headers:', req.headers);
    
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"]

    console.log('Stripe signature:', sig);
    console.log('Webhook secret:', process.env.STRIPE_WEBHOOK_SECRET ? 'Present' : 'Missing');

    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
        console.log('Event constructed successfully:', event.type);
    } catch (error) {
        console.error('Webhook signature verification failed:', error.message);
        return res.status(400).send(`Webhook error: ${error.message}`)
    }
    
    try {
        console.log('Processing event type:', event.type);
        
        switch(event.type){
            case "checkout.session.completed":{
                const session = event.data.object;
                const {bookingId} = session.metadata
                
                console.log('Webhook triggered for booking:', bookingId);
                console.log('Session data:', session);

                if (!bookingId) {
                    console.error('No bookingId found in session metadata');
                    break;
                }

                const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    paymentLink: ""
                }, { new: true })
                
                console.log('Booking updated successfully:', updatedBooking);
                break;
            }
            case "payment_intent.succeeded": {
                console.log('Payment intent succeeded event received');
                break;
            }
            default:
                console.log('Unhandled event type:', event.type)
        }
        res.json({received:true})
    } catch (error){
        console.error("Webhook processing error:" , error )
        res.status(500).send("Internal server error")
    }
}
