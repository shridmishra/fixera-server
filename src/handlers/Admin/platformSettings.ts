import { Request, Response, NextFunction } from "express";
import PlatformSettings from "../../models/platformSettings";
import connecToDatabase from "../../config/db";
import { IUser } from "../../models/user";

// Get current platform settings
export const getPlatformSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminUser = req.admin as IUser | undefined;
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, msg: "Admin access required" });
    }

    await connecToDatabase();
    const config = await PlatformSettings.getCurrentConfig();

    return res.status(200).json({
      success: true,
      data: {
        commissionPercent: config.commissionPercent,
        lastModified: config.lastModified,
        version: config.version,
      }
    });

  } catch (error: any) {
    console.error('Get platform settings error:', error);
    return res.status(500).json({
      success: false,
      msg: "Failed to retrieve platform settings"
    });
  }
};

// Update platform settings
export const updatePlatformSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminUser = req.admin as IUser | undefined;
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, msg: "Admin access required" });
    }

    const { commissionPercent } = req.body;

    if (typeof commissionPercent !== 'number' || !Number.isFinite(commissionPercent)) {
      return res.status(400).json({
        success: false,
        msg: "commissionPercent must be a valid number"
      });
    }

    if (commissionPercent < 0 || commissionPercent > 100) {
      return res.status(400).json({
        success: false,
        msg: "commissionPercent must be between 0 and 100"
      });
    }

    await connecToDatabase();
    const config = await PlatformSettings.getCurrentConfig();
    config.commissionPercent = commissionPercent;
    config.lastModifiedBy = adminUser._id as any;
    await config.save();

    console.log(`⚙️  Admin ${adminUser._id} updated platform commission to ${commissionPercent}%`);

    return res.status(200).json({
      success: true,
      data: {
        commissionPercent: config.commissionPercent,
        lastModified: config.lastModified,
        version: config.version,
      }
    });

  } catch (error: any) {
    console.error('Update platform settings error:', error);
    return res.status(500).json({
      success: false,
      msg: "Failed to update platform settings"
    });
  }
};
