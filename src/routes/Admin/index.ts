import { Router } from "express";
import { protect } from "../../middlewares/auth";
import {
  getPendingProfessionals,
  getProfessionalDetails,
  approveProfessional,
  rejectProfessional,
  suspendProfessional,
  verifyIdProof,
  getApprovalStats
} from "../../handlers/Admin/professionalApprovals";
import {
  getLoyaltyConfig,
  updateLoyaltyConfig,
  recalculateCustomerTiers,
  getLoyaltyAnalytics,
  testLoyaltySystem
} from "../../handlers/Admin/loyaltyManagement";

const adminRouter = Router();

// All admin routes require authentication
adminRouter.use(protect);

// Professional approval routes
adminRouter.route('/professionals').get(getPendingProfessionals);
adminRouter.route('/professionals/:professionalId').get(getProfessionalDetails);
adminRouter.route('/professionals/:professionalId/approve').put(approveProfessional);
adminRouter.route('/professionals/:professionalId/reject').put(rejectProfessional);
adminRouter.route('/professionals/:professionalId/suspend').put(suspendProfessional);
adminRouter.route('/professionals/:professionalId/verify-id').put(verifyIdProof);
adminRouter.route('/stats/approvals').get(getApprovalStats);

// Loyalty system management routes
adminRouter.route('/loyalty/config').get(getLoyaltyConfig);
adminRouter.route('/loyalty/config').put(updateLoyaltyConfig);
adminRouter.route('/loyalty/recalculate').post(recalculateCustomerTiers);
adminRouter.route('/loyalty/analytics').get(getLoyaltyAnalytics);
adminRouter.route('/loyalty/test').post(testLoyaltySystem);

export default adminRouter;