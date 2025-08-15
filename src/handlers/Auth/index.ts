import { Request,Response,NextFunction } from "express";
import User from "../../models/user";
import connecToDatabase from "../../config/db";
import bcrypt from 'bcrypt'
import generateToken from "../../utils/functions";
import { User as UserType } from "../../Types/User";


export const SignUp=async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const {name,password,email,role} = await req.body;

        if(!name || !password || !email){
            return res.status(400).json({
                msg:"Invalid inputs"
            });
        }
        
        await connecToDatabase();
        
        const existingEmailAddress = await User.findOne({
            email: email
        });

        if(existingEmailAddress){
            return res.status(403).json({
                msg:"Email account already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        await User.create({
            name:name,
            password:hashedPassword,
            email:email,
            role:role
        });

        return res.status(201).json({
            msg:"User created successfully"
        });

    }
    catch(e){
        next(e);
    }
}



export const LogIn = async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                msg:"Invalid inputs"
            })
        }
        
        const userExists:UserType | null= await User.findOne({email}).select("+password");


        if(!userExists){
            return res.status(403).json({
                msg:"No account found. Please create a new account"
            })
        }

        const checkPassword = await bcrypt.compareSync(password,userExists.password)

        if(!checkPassword){
            return res.status(200).json({
                msg:"Invalid password"
            })
        }

        const token = generateToken(userExists._id );

        return res.status(200).json({
            msg:"Logged in successfully",
            token,
        })

    }
    catch(e){
        next(e);
    }
}