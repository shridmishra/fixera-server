import { Router } from "express";
import { LogIn, SignUp } from "../../handlers/Auth";

const authRouter = Router();



authRouter.route('/signup').post(SignUp);
authRouter.route('/login').post(LogIn)


export default authRouter