import { Inngest } from "inngest";
import User from "../models/User.js";

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

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation ];

