import { Request, Response, NextFunction } from "express";
import User from "../../models/user";
import connecToDatabase from "../../config/db";
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const updateTeamMemberAvailabilityPreference = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.['auth-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Authentication required"
      });
    }

    let decoded: { id: string } | null = null;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    } catch (err) {
      return res.status(401).json({
        success: false,
        msg: "Invalid authentication token"
      });
    }

    await connecToDatabase();
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'team_member') {
      return res.status(403).json({
        success: false,
        msg: "Team member access required"
      });
    }

    // TODO: Implement availability preference update logic
    return res.status(200).json({
      success: true,
      msg: "Availability preference updated successfully"
    });

  } catch (error: any) {
    console.error(`❌ Error updating availability preference:`, error);
    return res.status(500).json({
      success: false,
      msg: "Server error while updating availability preference"
    });
  }
};

export const updateTeamMemberAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.['auth-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Authentication required"
      });
    }

    let decoded: { id: string } | null = null;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    } catch (err) {
      return res.status(401).json({
        success: false,
        msg: "Invalid authentication token"
      });
    }

    await connecToDatabase();
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'team_member') {
      return res.status(403).json({
        success: false,
        msg: "Team member access required"
      });
    }

    // TODO: Implement availability update logic
    return res.status(200).json({
      success: true,
      msg: "Availability updated successfully"
    });

  } catch (error: any) {
    console.error(`❌ Error updating availability:`, error);
    return res.status(500).json({
      success: false,
      msg: "Server error while updating availability"
    });
  }
};

export const getTeamMemberEffectiveAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.['auth-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Authentication required"
      });
    }

    let decoded: { id: string } | null = null;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    } catch (err) {
      return res.status(401).json({
        success: false,
        msg: "Invalid authentication token"
      });
    }

    await connecToDatabase();
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'team_member') {
      return res.status(403).json({
        success: false,
        msg: "Team member access required"
      });
    }

    // TODO: Implement get effective availability logic
    return res.status(200).json({
      success: true,
      data: {
        availability: []
      }
    });

  } catch (error: any) {
    console.error(`❌ Error getting effective availability:`, error);
    return res.status(500).json({
      success: false,
      msg: "Server error while getting effective availability"
    });
  }
};

export const updateManagedTeamMemberAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamMemberId } = req.params;
    const token = req.cookies?.['auth-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Authentication required"
      });
    }

    let decoded: { id: string } | null = null;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    } catch (err) {
      return res.status(401).json({
        success: false,
        msg: "Invalid authentication token"
      });
    }

    await connecToDatabase();
    const professional = await User.findById(decoded.id);

    if (!professional || professional.role !== 'professional') {
      return res.status(403).json({
        success: false,
        msg: "Professional access required"
      });
    }

    // Find the team member
    const teamMember = await User.findOne({
      _id: teamMemberId,
      role: 'team_member',
      'teamMember.companyId': (professional._id as mongoose.Types.ObjectId).toString()
    });

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        msg: "Team member not found or not managed by you"
      });
    }

    // TODO: Implement managed team member availability update logic
    return res.status(200).json({
      success: true,
      msg: "Team member availability updated successfully"
    });

  } catch (error: any) {
    console.error(`❌ Error updating managed team member availability:`, error);
    return res.status(500).json({
      success: false,
      msg: "Server error while updating managed team member availability"
    });
  }
};