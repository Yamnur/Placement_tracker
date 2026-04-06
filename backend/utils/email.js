const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password for Gmail
  },
});

const sendResetEmail = async (toEmail, userName, resetLink) => {
  const mailOptions = {
    from: `"PlaceTrack Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset Your PlaceTrack Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #4f7cff, #7b5ea7); padding: 32px 40px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px; }
          .body { padding: 36px 40px; }
          .body p { color: #4b5571; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
          .btn { display: block; width: fit-content; margin: 28px auto; padding: 14px 36px; background: linear-gradient(135deg, #4f7cff, #7b5ea7); color: #fff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; text-align: center; }
          .note { background: #f4f6fb; border-radius: 8px; padding: 14px 18px; font-size: 13px; color: #8892aa; margin-top: 24px; }
          .footer { padding: 20px 40px; text-align: center; font-size: 12px; color: #8892aa; border-top: 1px solid #e8ecf5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PlaceTrack</h1>
            <p>Placement Management System</p>
          </div>
          <div class="body">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>We received a request to reset the password for your PlaceTrack account. Click the button below to set a new password:</p>
            <a href="${resetLink}" class="btn">Reset My Password</a>
            <div class="note">
              ⏰ This link will expire in <strong>1 hour</strong>.<br/><br/>
              If you did not request a password reset, you can safely ignore this email. Your password will not be changed.
            </div>
            <p style="margin-top:20px; font-size:13px; color:#8892aa;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${resetLink}" style="color:#4f7cff; word-break:break-all;">${resetLink}</a>
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} PlaceTrack &bull; This is an automated email, please do not reply.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (toEmail, userName, verifyLink) => {
  const mailOptions = {
    from: `"PlaceTrack Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify Your PlaceTrack Email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #4f7cff, #7b5ea7); padding: 32px 40px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 800; }
          .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px; }
          .body { padding: 36px 40px; }
          .body p { color: #4b5571; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
          .btn { display: block; width: fit-content; margin: 28px auto; padding: 14px 36px; background: linear-gradient(135deg, #22c97a, #16a05e); color: #fff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; }
          .footer { padding: 20px 40px; text-align: center; font-size: 12px; color: #8892aa; border-top: 1px solid #e8ecf5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PlaceTrack</h1>
            <p>Placement Management System</p>
          </div>
          <div class="body">
            <p>Hi <strong>${userName}</strong>, welcome to PlaceTrack! 🎉</p>
            <p>Please verify your email address to activate your account:</p>
            <a href="${verifyLink}" class="btn">Verify My Email</a>
            <p style="font-size:13px; color:#8892aa;">If you didn't create this account, you can ignore this email.</p>
          </div>
          <div class="footer">&copy; ${new Date().getFullYear()} PlaceTrack</div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail, sendVerificationEmail };