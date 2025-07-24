import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
    try{
        const {userId} = req.auth()
        const user = await clerkClient.users.getUser(userId);
        if(user.privateMetadata.role !=='admin') {
            return res.status(403).json({message: "Access denied"});
        }
        next();

    }catch(error) {
        console.error("Error in protectAdmin middleware:", error);
        return res.status(500).json({message: "Internal server error"});
    }

}