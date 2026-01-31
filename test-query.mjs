import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, './.env') });

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
        process.exit(1);
    } else {
        console.log('✅ Email server is ready to send messages');
        console.log('📧 GMAIL_USER:', process.env.GMAIL_USER);
        console.log('📧 QUERY_RECIPIENT_EMAIL:', process.env.QUERY_RECIPIENT_EMAIL);
        testQueryEmail();
    }
});

async function testQueryEmail() {
    try {
        const name = 'Test User';
        const email = 'testuser@example.com';
        const query = 'This is a test query to verify the email functionality is working correctly.';
        const recipientEmail = process.env.QUERY_RECIPIENT_EMAIL || 'imprajwalraj2105@gmail.com';

        console.log('\n📬 Sending test query email...');
        console.log(`From: ${process.env.GMAIL_USER}`);
        console.log(`To: ${recipientEmail}`);

        const mailOptions = {
            from: `"AI HACKFEST" <${process.env.GMAIL_USER}>`,
            to: recipientEmail,
            subject: `📬 Test Query from ${name} - AI HACKFEST`,
            html: `
                <h1>Test Query Email</h1>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Query:</strong></p>
                <p>${query}</p>
            `,
            replyTo: email
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test query email sent successfully!');
        console.log('✅ Message ID:', info.messageId);
        console.log('\n✅ The query functionality is working correctly.');
        console.log('✅ Emails will be sent to:', recipientEmail);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error sending test query email:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}
