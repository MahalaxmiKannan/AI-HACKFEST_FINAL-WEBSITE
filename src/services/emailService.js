// Email Service - Sends confirmation emails via backend API

export const API_BASE_URL = 'http://localhost:5000';
// For production, use: export const API_BASE_URL = 'http://13.61.21.65:5000';


/**
 * Send registration confirmation email via backend Gmail service
 * @param {Object} formData - The registration form data
 * @returns {Promise} - API response
 */
export const sendConfirmationEmail = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ formData }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to send email');
        }

        console.log('Email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

/**
 * Check if email server is running
 * @returns {Promise<boolean>}
 */
export const checkEmailServer = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        return data.status === 'ok';
    } catch (error) {
        console.error('Email server not available:', error);
        return false;
    }
};
