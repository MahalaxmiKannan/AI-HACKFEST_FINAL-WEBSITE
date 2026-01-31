const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create Gmail transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter error:', error.message);
        console.log('📝 Please check your GMAIL_USER and GMAIL_APP_PASSWORD in .env file');
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
    try {
        const { formData } = req.body;

        if (!formData) {
            return res.status(400).json({
                success: false,
                error: 'Form data is required'
            });
        }

        const { name, email, teamName, teamSize, teamMembers, selectedProblem, upiTransactionId } = formData;

        // Format team members list for email
        const teamMembersList = teamMembers
            .map((member, index) => `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${member.name}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${member.email}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${member.phone}</td>
                </tr>
            `)
            .join('');

        // Email HTML content
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-bottom: 20px; }
                    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                    .info-label { color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
                    .info-value { color: #333; font-size: 16px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th { background: #667eea; color: white; padding: 10px; text-align: left; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Registration Confirmed!</h1>
                        <p>Welcome to the AI HACKFEST</p>
                    </div>
                    <div class="content">
                        <div style="text-align: center;">
                            <span class="success-badge">✓ ThankYou for registering </span>
                        </div>
                        
                        <p>Dear <strong>${name}</strong>,</p>
                        <p>Thank you for registering for our hackathon! Your registration has been successfully received.</p>
                        
                        <div class="info-box">
                            <div class="info-label">Team Name</div>
                            <div class="info-value">${teamName}</div>
                        </div>
                        
                        <div class="info-box">
                            <div class="info-label">Team Size</div>
                            <div class="info-value">${teamSize} Member(s)</div>
                        </div>
                        
                        <div class="info-box">
                            <div class="info-label">Selected Problem Statement</div>
                            <div class="info-value">${selectedProblem}</div>
                        </div>
                        
                        <div class="info-box">
                            <div class="info-label">UPI Transaction ID</div>
                            <div class="info-value">${upiTransactionId}</div>
                        </div>
                        
                        <h3>👥 Team Members</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${teamMembersList}
                            </tbody>
                        </table>
                        
                        <div class="info-box" style="background: #fef3c7; border-left: 4px solid #f59e0b;">
                            <p style="margin: 0;"><strong>📌 Important:</strong> Please save this email for your records. Further details about the hackathon will be sent to this email address.</p>
                        </div>
                        
                        <div class="footer">
                            <p>If you have any questions, please contact the organizing team.</p>
                            <p>Best of luck! 🚀</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Admin email to receive notifications
        const ADMIN_EMAIL = 'imprajwalraj2105@gmail.com';

        // Send email to team leader
        const teamLeaderMailOptions = {
            from: `"Hackathon Team" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `🎉 Registration Confirmed - Team ${teamName}`,
            html: htmlContent
        };

        // Send email notification to admin
        const adminMailOptions = {
            from: `"Hackathon Team" <${process.env.GMAIL_USER}>`,
            to: ADMIN_EMAIL,
            subject: `📋 New Registration - Team ${teamName}`,
            html: htmlContent
        };

        // Send both emails
        const info = await transporter.sendMail(teamLeaderMailOptions);
        await transporter.sendMail(adminMailOptions);
        console.log('✅ Admin notification email sent to:', ADMIN_EMAIL);
        console.log('✅ Email sent successfully:', info.messageId);

        res.json({
            success: true,
            message: 'Confirmation email sent successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ Error sending email:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Email server is running' });
});

// Query submission endpoint
app.post('/api/send-query', async (req, res) => {
    try {
        console.log('📨 Query endpoint called');
        const { name, email, query } = req.body;
        console.log('📝 Query data received:', { name, email, query });
        const recipientEmail = process.env.QUERY_RECIPIENT_EMAIL || 'imprajwalraj2105@gmail.com';
        console.log('📧 Sending query to:', recipientEmail);

        if (!name || !email || !query) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Email HTML content for query
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #bc13fe 0%, #667eea 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                    .info-label { color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; }
                    .info-value { color: #333; font-size: 16px; font-weight: bold; }
                    .query-text { background: #f0f4ff; padding: 15px; border-left: 4px solid #bc13fe; border-radius: 4px; margin: 15px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📬 New Query Received</h1>
                        <p>From AI HACKFEST Participant</p>
                    </div>
                    <div class="content">
                        <h2>Query Details:</h2>
                        
                        <div class="info-box">
                            <div class="info-label">Name</div>
                            <div class="info-value">${name}</div>
                        </div>
                        
                        <div class="info-box">
                            <div class="info-label">Email</div>
                            <div class="info-value">${email}</div>
                        </div>
                        
                        <div class="query-text">
                            <div class="info-label">Query Message:</div>
                            <p style="margin-top: 10px; white-space: pre-wrap;">${query}</p>
                        </div>
                        
                        <div class="footer">
                            <p>Please respond to the participant at their provided email address.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send email to the designated recipient (imprajwalraj2105@gmail.com)
        const mailOptions = {
            from: `"AI HACKFEST" <${process.env.GMAIL_USER}>`,
            to: recipientEmail,
            subject: `📬 New Query from ${name} - AI HACKFEST`,
            html: htmlContent,
            replyTo: email
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Query email sent to:', recipientEmail);
        console.log('✅ Query email ID:', info.messageId);

        res.json({
            success: true,
            message: 'Query sent successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ Error sending query email:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Email server running on http://localhost:${PORT}`);
    console.log(`📧 Sending emails from: ${process.env.GMAIL_USER || 'NOT CONFIGURED'}`);
});
