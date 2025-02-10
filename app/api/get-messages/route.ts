import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import{User} from "next-auth"
import mongoose from "mongoose";


export async function GET(){
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user : User= session?.user as User;
    console.log(user);

    if(!session||!session.user){
        return Response.json({
            success:false,
            message:"User not authenticated"
        },{
            status:401
        })
    }
    const userId= new mongoose.Types.ObjectId(user._id);
    try {
        //aggreation pipleine in mongo db
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            {$unwind: "$messages"},
            {$sort:{'messages.createdAt':-1}},
            {$group:{_id:"$_id",messages:{$push:"$messages"}}}
        ])
        if(!user){
            return Response.json({
                success:false,
                message:"User not found"
            },{
                status:404
            })
        }
        if(user.length==0){
            return Response.json({
                success:true,
                message:"User messages found",
                messages:[]
            },
            {status:200})
        }
        return Response.json({
            success:true,
            message:"User messages found",
            messages:user[0].messages
        },
        {status:200})
    } catch (error) { 
        console.log("failed to get user messages",error)
        return Response.json({
            success:false,
            message:"failed to get user messages"
        },{
            status:500
        })
    }
}