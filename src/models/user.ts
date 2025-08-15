import { Schema,model,Document } from "mongoose";


export type UserRole = "admin" | "visitor" | "customer" | "professional"



export interface IUser extends Document{
    name:string;
    password:string;
    email:string;
    createdAt:Date;
    updatedAt:Date;
    role:UserRole
}



const UserSchema = new Schema<IUser>({
    name:{
        type:String,
        required:[true,'Name is required'],
        trim:true
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:[true,'Email already exists'],
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        minLength:[6,'Password must be atleast 6 characters long'],
        select:false
    },
    role:{
        type:String,
        enum:['admin' , 'visitor' , 'customer' , 'professional'],
        default:'customer'
    }
    
},{
    timestamps:true
})



const User = model<IUser>('User',UserSchema);


export default User;