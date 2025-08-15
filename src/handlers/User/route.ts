import { Router } from "express";
import { protect } from "../../middlewares/auth";


const userRouter = Router();

userRouter.use(protect);

