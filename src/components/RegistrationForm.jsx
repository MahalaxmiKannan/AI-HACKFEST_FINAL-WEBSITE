import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { sendConfirmationEmail } from '../services/emailService'
import './RegistrationForm.css'


const problemStatements = [
    "HealthCare",
    "Disaster Management",
    "Edu Tech",
    "Smart Cities",
    "Sustainable Energy"
]

function RegistrationForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        collegeName: '',
        department: '',
        teamName: '',
        teamSize: 1,
        teamMembers: [{ name: '', email: '', phone: '', gender: '' }],
        selectedProblem: '',
        upiTransactionId: '',
        pptLink: ''
    })

    const [submitted, setSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleTeamSizeChange = (e) => {
        const size = parseInt(e.target.value)
        const currentMembers = [...formData.teamMembers]

        if (size > currentMembers.length) {
            while (currentMembers.length < size) {
                currentMembers.push({ name: '', email: '', phone: '', gender: '' })
            }
        } else {
            currentMembers.splice(size)
        }

        setFormData(prev => ({
            ...prev,
            teamSize: size,
            teamMembers: currentMembers
        }))
    }

    const handleMemberChange = (index, field, value) => {
        const updatedMembers = [...formData.teamMembers]
        updatedMembers[index][field] = value
        setFormData(prev => ({
            ...prev,
            teamMembers: updatedMembers
        }))
    }

    const handleProblemChange = (problem) => {
        setFormData(prev => ({
            ...prev,
            selectedProblem: problem
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            console.log('Submitting to Firebase:', formData)

            const docRef = await addDoc(collection(db, "registrations"), {
                ...formData,
                submittedAt: serverTimestamp()
            });

            console.log("Document written with ID: ", docRef.id);

            // Try to send confirmation email
            try {
                await sendConfirmationEmail(formData);
                console.log("Confirmation email sent!");
            } catch (emailError) {
                console.warn("Email sending failed (check EmailJS config):", emailError);
                // Don't fail registration if email fails
            }

            setSubmitted(true)
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Error submitting registration. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="success-container">
                <div className="success-card">
                    <div className="success-icon">✓</div>
                    <h2>Registration Successful!</h2>
                    <p>Thank you for registering for the hackathon.</p>
                    <p>We have received your team details.</p>
                    <p className="email-note">📧 A confirmation email has been sent to your registered email.</p>
                    <button onClick={() => {
                        setSubmitted(true)
                        setFormData({
                            name: '',
                            email: '',
                            phone: '',
                            gender: '',
                            collegeName: '',
                            department: '',
                            teamName: '',
                            teamSize: 1,
                            teamMembers: [{ name: '', email: '', phone: '', gender: '' }],
                            selectedProblem: '',
                            upiTransactionId: '',
                            pptLink: ''
                        })
                         window.location.href = "/"
                    }} className="btn-primary">
                        THANK YOU
                     
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="app-container registration-page">
            <div className="form-wrapper">
                <div className="form-header">
                    <h1>AI HACKFEST</h1>
                    <p>Join us for an amazing coding experience!</p>
                    <a href="/admin" className="admin-link">🔐 Admin Login</a>
                </div>

                <form onSubmit={handleSubmit} className="registration-form">
                    {/* Leader Details Section */}
                    <section className="form-section">
                        <h2 className="section-title">
                            <span className="section-icon">👤</span>
                            Team Leader Details
                        </h2>

                        <div className="input-group">
                            <label htmlFor="name">Full Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">Email ID *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="phone">Phone Number *</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                                pattern="[0-9]{10}"
                                title="Please enter a valid 10-digit phone number"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="gender">Gender *</label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        


                        <div className="input-group">
                            <label htmlFor="collegeName">College Name *</label>
                            <input
                                type="text"
                                id="collegeName"
                                name="collegeName"
                                value={formData.collegeName}
                                onChange={handleInputChange}
                                placeholder="Enter your college name"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="department">Department *</label>
                            <input
                                type="text"
                                id="department"
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                placeholder="Enter your department"
                                required
                            />
                        </div>


                        <div className="input-group">
                            <label htmlFor="teamName">Team Name *</label>
                            <input
                                type="text"
                                id="teamName"
                                name="teamName"
                                value={formData.teamName}
                                onChange={handleInputChange}
                                placeholder="Enter your team name"
                                required
                            />
                        </div>
                    </section>

                    {/* Team Members Section */}
                    <section className="form-section">
                        <h2 className="section-title">
                            <span className="section-icon">👥</span>
                            Team Members
                        </h2>

                        <div className="input-group">
                            <label htmlFor="teamSize">Number of Team Members (1-3) *</label>
                            <select
                                id="teamSize"
                                name="teamSize"
                                value={formData.teamSize}
                                onChange={handleTeamSizeChange}
                                required
                            >
                                {[1, 2, 3].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>

                        <div className="team-members-container">
                            {formData.teamMembers.map((member, index) => (
                                <div key={index} className="team-member-card">
                                    <h3 className="member-title">Team Member {index + 1}</h3>

                                    <div className="input-group">
                                        <label>Name *</label>
                                        <input
                                            type="text"
                                            value={member.name}
                                            onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                                            placeholder={`Enter member ${index + 1}'s name`}
                                            required
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            value={member.email}
                                            onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                                            placeholder={`Enter member ${index + 1}'s email`}
                                            required
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label>Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={member.phone}
                                            onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                                            placeholder={`Enter member ${index + 1}'s phone`}
                                            pattern="[0-9]{10}"
                                            title="Please enter a valid 10-digit phone number"
                                            required
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label>Gender *</label>
                                        <select
                                            value={member.gender}
                                            onChange={(e) => handleMemberChange(index, 'gender', e.target.value)}
                                            required
                                            className="gender-select"
                                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', marginTop: '5px' }}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Problem Statement Section */}
                    <section className="form-section">
                        <h2 className="section-title">
                            <span className="section-icon">💡</span>
                            Select Problem Statement
                        </h2>
                        <p className="section-description">Choose one problem statement that your team will work on:</p>

                        <div className="problem-statements">
                            {problemStatements.map((problem, index) => (
                                <label key={index} className="problem-option">
                                    <input
                                        type="radio"
                                        name="problemStatement"
                                        value={problem}
                                        checked={formData.selectedProblem === problem}
                                        onChange={() => handleProblemChange(problem)}
                                        required
                                    />
                                    <span className="problem-checkbox"></span>
                                    <span className="problem-text">{index + 1}. {problem}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* PPT Google Drive Link Section */}
                    <section className="form-section">
                        <h2 className="section-title">
                            <span className="section-icon">📊</span>
                            PPT Submission
                        </h2>
                        <p className="section-description">Share your presentation via Google Drive link:</p>

                        <div className="input-group">
                            <label htmlFor="pptLink">PPT Google Drive Link *</label>
                            <input
                                type="url"
                                id="pptLink"
                                name="pptLink"
                                value={formData.pptLink}
                                onChange={handleInputChange}
                                placeholder="https://drive.google.com/..."
                                required
                            />
                            <small className="input-hint">Make sure your Google Drive link is set to "Anyone with the link can view"</small>
                        </div>
                    </section>

                    {/* Payment Section */}


                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                        <span>{isSubmitting ? '⌛' : ''}</span>
                        {isSubmitting ? 'Registering...' : 'Submit Registration'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default RegistrationForm


