// SignUp.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Assuming these are correctly imported from your project structure
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// import { Checkbox } from "@/components/ui/checkbox"; // Uncomment if used
// import { Label } from "@/components/ui/label"; // Uncomment if used
import { apiURL } from '../config';

// Placeholder imports
import googleIcon from '../assets/icons/google_icon.png';
import placeholderPicture from '../assets/pictures/dummy_cover_pic_1.webp';

const SignUp: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Handlers are defined correctly; make sure to bind these to the respective input fields
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);
    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value);

    const handleCreateAccount = async () => {
        try {
            console.log("email: "  + email + "\n")
            console.log("username: "  + username + "\n")
            console.log("password: "  + password + "\n")
            console.log("phone: "  + phoneNumber + "\n")
            const accountResponse = await fetch(`${apiURL}/user_account/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.toString(),
                    password: password,
                    username: username,
                    phoneNumber: phoneNumber.toString(), // Ensure phoneNumber is sent as a string
                }),
            });
            console.log("account created...\n")
            if (accountResponse.ok) {
                // Call generate OTP endpoint
                const otpResponse = await fetch(`${apiURL}/user_account/generateOTP`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ emailAddress: email.toString() }), // Send email to generate OTP
                });
                console.log("otp generated and sent to email...\n")
    
                if (otpResponse.ok) {
                    // Navigate to email verification page with email state
                    navigate('/email-verification', { state: { email: email } });
                } else {
                    const otpErrorData = await otpResponse.json();
                    setError(otpErrorData.error || 'An unknown error occurred while generating OTP');
                }
            } else {
                // Handle server errors or validation errors from account creation
                const accountErrorData = await accountResponse.json();
                setError(accountErrorData.error || 'An unknown error occurred during account creation');
            }
        } catch (error) {
            // Handle network errors
            console.error('Network error:', error);
            setError('A network error occurred. Please try again.');
        }
    };
    

    return (
        <div className="sign-up-page" style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}>
            <div className="left-column" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* Error display logic */}
                {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
                
                <div style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontWeight: 'bold', fontSize: '24px' }}>Welcome to XPath!</h1>
                    <p>Create an account to cross paths with like-minded commute and travel buddies.</p>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <Input type="text" value={username} onChange={handleUsernameChange} placeholder="Username" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <Input type="email" value={email} onChange={handleEmailChange} placeholder="Email" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <Input type="password" value={password} onChange={handlePasswordChange} placeholder="Password" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <Input type="text" value={phoneNumber} onChange={handlePhoneNumberChange} placeholder="Phone Number" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <Button onClick={handleCreateAccount}>Create Account</Button>
                </div>
                
                <div>
                    <p>Already have an account? <button onClick={() => navigate('/signin')} style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Log in</button></p>
                </div>
            </div>
            <div className="right-column" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={placeholderPicture} alt="Placeholder Picture" style={{ maxWidth: '100%', maxHeight: '100vh', height: 'auto' }} />
            </div>
        </div>
    );
};

export default SignUp;
