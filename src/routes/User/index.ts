import { Router } from "express";
import { VerifyPhone } from "../../handlers/User/verify/phone";
import { VerifyPhoneCheck } from "../../handlers/User/verify/phone";
import emailVerificationRoutes from "./verify/email";
import { protect } from "../../middlewares/auth";
import { GetCurrentUser } from "../../handlers";
import { validateVAT, updateUserVAT, validateAndPopulateVAT } from "../../handlers/User/validateVat";
import { uploadIdProof, updateProfessionalProfile, submitForVerification } from "../../handlers/User/profileManagement";
import { upload } from "../../utils/s3Upload";
import { getLoyaltyStatus, addSpending, getLeaderboard } from "../../handlers/User/loyaltyManagement";
import { inviteTeamMember, getTeamMembers, updateTeamMemberStatus, acceptInvitation } from "../../handlers/User/teamManagement";
import { changePassword, resetTeamMemberPassword } from "../../handlers/User/passwordManagement";
import { 
    updateTeamMemberAvailabilityPreference, 
    updateTeamMemberAvailability, 
    getTeamMemberEffectiveAvailability,
    updateManagedTeamMemberAvailability 
} from "../../handlers/User/teamMemberAvailability";

const userRouter = Router();

userRouter.use(protect)

userRouter.route('/me').get(GetCurrentUser)
userRouter.route("/verify-phone").post(VerifyPhone)
userRouter.route("/verify-phone-check").post(VerifyPhoneCheck)
userRouter.use("/verify-email", emailVerificationRoutes);
userRouter.route("/vat/validate").post(validateVAT)
userRouter.route("/vat").put(updateUserVAT)
userRouter.route("/vat/validate-and-populate").post(validateAndPopulateVAT) 
userRouter.route("/id-proof").post(upload.single('idProof'), uploadIdProof)
userRouter.route("/professional-profile").put(updateProfessionalProfile)
userRouter.route("/submit-for-verification").post(submitForVerification) 
userRouter.route("/loyalty/status").get(getLoyaltyStatus)
userRouter.route("/loyalty/add-spending").post(addSpending)
userRouter.route("/loyalty/leaderboard").get(getLeaderboard)

// Team Management Routes
userRouter.route("/team/invite").post(inviteTeamMember)
userRouter.route("/team/members").get(getTeamMembers)
userRouter.route("/team/members/:teamMemberId/status").put(updateTeamMemberStatus) 
userRouter.route("/team/accept-invitation").post(acceptInvitation) 

// Password Management Routes
userRouter.route("/change-password").put(changePassword) 
userRouter.route("/team/reset-password").put(resetTeamMemberPassword)

// Team Member Availability Routes
userRouter.route("/team/availability/preference").put(updateTeamMemberAvailabilityPreference)
userRouter.route("/team/availability").put(updateTeamMemberAvailability)
userRouter.route("/team/availability/effective").get(getTeamMemberEffectiveAvailability)
userRouter.route("/team/members/:teamMemberId/availability").put(updateManagedTeamMemberAvailability)

export default userRouter;