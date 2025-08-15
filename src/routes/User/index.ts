import { Router } from "express";
import { VerifyPhone } from "../../handlers/User/verify/phone";
import { VerifyPhoneCheck } from "../../handlers/User/verify/phone";
import emailVerificationRoutes from "./verify/email";
import { protect } from "../../middlewares/auth";

const userRouter = Router();

userRouter.use(protect)

userRouter.route("/verify-phone").post(VerifyPhone)
userRouter.route("/verify-phone-check").post(VerifyPhoneCheck)
userRouter.use("/verify-email", emailVerificationRoutes);



export default userRouter;