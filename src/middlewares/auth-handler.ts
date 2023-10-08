import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken'

require("dotenv").config();

// middleware to store the userID in the response
export default async (req:Request, res: Response, next: NextFunction) => {
    try{
        const token = req.cookies.token;
        if(!token){
            console.log("Unauthenticated");
            return next();
        }

        const userID: any = jwt.verify(token, process.env.JWT_SECRET as string);

        if(userID){
            res.locals.user = userID;
        }
        return next();
    } catch(err) {
        console.log(err);
        return res.status(401).json({ error: "unauthenticated" })
    }
}