import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from "@getbrevo/brevo";

// Initialize Brevo API with proper configuration
const createEmailAPI = () => {
  const api = new TransactionalEmailsApi();
  
  // Set API key using the correct method
  if (process.env.BREVO_API_KEY) {
    api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
  } else {
    console.error("BREVO_API_KEY environment variable is not set");
  }
  
  return api;
};

// Generate a 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Common email header template
const getEmailHeader = (title: string) => `
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Fixera</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">${title}</p>
  </div>
`;

// Common email footer template
const getEmailFooter = () => `
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #999; font-size: 12px; margin: 0;">
      © 2025 Fixera. All rights reserved.
    </p>
  </div>
`;

// Send OTP email using Brevo
export const sendOTPEmail = async (email: string, otp: string, userName: string): Promise<boolean> => {
  try {

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${getEmailHeader("Email Verification")}
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${userName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for joining Fixera! To complete your registration, please use the verification code below:
          </p>
          
          <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">Your Verification Code</h3>
            <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This code will expire in 10 minutes for security reasons.
          </p>
          
          <div style="background: #e8f4fd; border-left: 4px solid #667eea; padding: 15px; margin: 25px 0;">
            <p style="color: #333; margin: 0; font-size: 14px;">
              <strong>Security Tip:</strong> Never share this code with anyone. Fixera will never ask for this code via phone or email.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 30px;">
            If you didn't create an account with Fixera, please ignore this email.
          </p>
          
          ${getEmailFooter()}
        </div>
      </div>
    `;
    const emailAPI = createEmailAPI(); 
    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = "Verify Your Fixera Account";
    sendSmtpEmail.htmlContent = emailContent;
    sendSmtpEmail.sender = { 
      name: "Fixera Team", 
      email: process.env.FROM_EMAIL || "anafariya@gmail.com" 
    };

    const response = await emailAPI.sendTransacEmail(sendSmtpEmail);
    return true;
  } catch (error: any) {
    return false;
  }
};

// Send welcome email after signup
export const sendWelcomeEmail = async (email: string, userName: string): Promise<boolean> => {
  try {

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${getEmailHeader("Welcome to Fixera!")}
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Welcome ${userName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for joining Fixera! Your account has been successfully created. We're excited to have you as part of our community of homeowners and skilled professionals.
          </p>
          
          <div style="background: #e8f5e8; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #2E7D32; margin: 0 0 15px 0; font-size: 18px;">✨ Next Steps</h3>
            <p style="color: #333; margin: 0 0 15px 0; line-height: 1.6;">
              Complete your profile to get the most out of Fixera and start connecting with our verified professionals.
            </p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" 
                 style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Complete Your Profile
              </a>
            </div>
          </div>
          
          <div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">🏠 What you can do with Fixera:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Find verified professionals for home services</li>
              <li>Get instant quotes or custom project estimates</li>
              <li>Book services with secure payment protection</li>
              <li>Enjoy up to 10-year warranty on completed work</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 30px;">
            Questions? Our support team is here to help 24/7. Reply to this email or contact us anytime.
          </p>
          
          ${getEmailFooter()}
        </div>
      </div>
    `;

    const emailAPI = createEmailAPI();
    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = "Welcome to Fixera - Let's Complete Your Profile!";
    sendSmtpEmail.htmlContent = emailContent;
    sendSmtpEmail.sender = { 
      name: "Fixera Team", 
      email: process.env.FROM_EMAIL || "anafariya@gmail.com" 
    };

   await emailAPI.sendTransacEmail(sendSmtpEmail);

    return true;
  } catch (error: any) {
    return false;
  }
};

// Send professional approval email
export const sendProfessionalApprovalEmail = async (email: string, professionalName: string): Promise<boolean> => {
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${getEmailHeader("Profile Approved! 🎉")}
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Congratulations ${professionalName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Great news! Your professional profile has been approved by our team. You can now start accepting projects and connecting with customers on Fixera.
          </p>
          
          <div style="background: #e8f5e8; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <h3 style="color: #2E7D32; margin: 0 0 15px 0; font-size: 18px;">🚀 You're All Set!</h3>
            <p style="color: #333; margin: 0 0 20px 0; line-height: 1.6;">
              Your profile is now live and customers can find you. Start by creating your first project listing or update your availability.
            </p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
                Go to Dashboard
              </a>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects/create" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Create Project
              </a>
            </div>
          </div>
          
          <div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">💼 What's next:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Update your availability calendar</li>
              <li>Add portfolio images and certifications</li>
              <li>Set your hourly rates and service areas</li>
              <li>Start receiving project inquiries from customers</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 30px;">
            Welcome to the Fixera professional community! We're here to support your success.
          </p>
          
          ${getEmailFooter()}
        </div>
      </div>
    `;

    const emailAPI = createEmailAPI();
    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = "🎉 Your Fixera Professional Profile is Approved!";
    sendSmtpEmail.htmlContent = emailContent;
    sendSmtpEmail.sender = { 
      name: "Fixera Team", 
      email: process.env.FROM_EMAIL || "anafariya@gmail.com" 
    };

    const response = await emailAPI.sendTransacEmail(sendSmtpEmail);

    return true;
  } catch (error: any) {

    return false;
  }
};

// Send professional rejection email
export const sendProfessionalRejectionEmail = async (email: string, professionalName: string, reason: string): Promise<boolean> => {
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${getEmailHeader("Profile Update Required")}
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${professionalName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for your interest in becoming a verified professional on Fixera. After reviewing your profile, we need you to address some items before we can approve your account.
          </p>
          
          <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">⚠️ Items to Address</h3>
            <div style="background: #fff; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
              <p style="color: #333; margin: 0; line-height: 1.6;">
                <strong>Reason:</strong> ${reason}
              </p>
            </div>
          </div>
          
          <div style="background: #e8f4fd; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #1565C0; margin: 0 0 15px 0; font-size: 18px;">🔧 How to Fix This</h3>
            <p style="color: #333; margin: 0 0 15px 0; line-height: 1.6;">
              Please update your profile with the requested information, then click "Send for Verification" to resubmit for review.
            </p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Update Profile
              </a>
            </div>
          </div>
          
          <div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">📋 Common Requirements:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Valid government-issued ID (passport, driver's license)</li>
              <li>EU VAT number validation (for EU professionals)</li>
              <li>Complete business information and contact details</li>
              <li>Professional certifications or proof of expertise</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 30px;">
            Once you've made the necessary updates, we'll review your profile again within 48 hours. If you have questions, feel free to reply to this email.
          </p>
          
          ${getEmailFooter()}
        </div>
      </div>
    `;

    const emailAPI = createEmailAPI();
    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = "Fixera Profile Update Required - Please Review";
    sendSmtpEmail.htmlContent = emailContent;
    sendSmtpEmail.sender = { 
      name: "Fixera Team", 
      email: process.env.FROM_EMAIL || "anafariya@gmail.com" 
    };

    const response = await emailAPI.sendTransacEmail(sendSmtpEmail);

    return true;
  } catch (error: any) {
    return false;
  }
};

// Send team member invitation email
export const sendTeamMemberInvitationEmail = async (
  email: string, 
  teamMemberName: string, 
  companyName: string,
  loginEmail: string,
  temporaryPassword: string
): Promise<boolean> => {
  try {
    const emailAPI = createEmailAPI();

    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
        <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          ${getEmailHeader('Team Member Invitation')}
          
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to the Team, ${teamMemberName}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              You have been invited to join <strong>${companyName}</strong> as a team member on the Fixera platform.
            </p>
            
            <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Your Login Credentials</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${loginEmail}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Temporary Password:</strong> <code style="background: #e8e8e8; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code></p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Security Note:</strong> Please change your password after your first login for security purposes.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                Login to Your Account
              </a>
            </div>
            
            <div style="margin-top: 30px;">
              <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                <li>Log in using your provided credentials</li>
                <li>Change your password for security</li>
                <li>Set up your availability preferences</li>
                <li>Start collaborating with your team</li>
              </ul>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If you have any questions or need assistance, please contact your company administrator or reach out to our support team.
            </p>
          </div>
          
          ${getEmailFooter()}
        </div>
      </div>
    `;

    const sendSmtpEmail: SendSmtpEmail = {
      to: [{ email: email, name: teamMemberName }],
      subject: `Welcome to ${companyName} - Team Member Invitation`,
      htmlContent: htmlContent,
      sender: { 
        email: process.env.FROM_EMAIL || 'noreply@fixera.com', 
        name: 'Fixera Team' 
      },
    };

    const response = await emailAPI.sendTransacEmail(sendSmtpEmail);
    return true;
  } catch (error: any) {
    return false;
  }
};