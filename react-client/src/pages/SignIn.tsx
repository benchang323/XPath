// SignIn.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import googleIcon from '../assets/icons/google_icon.png';
import placeholderPicture from '../assets/pictures/dummy_cover_pic_4.webp';
import { apiURL } from '../config';

const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);


    const handleLogin = async () => {
        try {
            const response = await fetch(`${apiURL}/user_account/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, password: password }),
            });
    
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    console.log('Login successful', data);
                    sessionStorage.setItem('bearerToken', data.token);
                    
                    // Check if user is verified
                    const verificationResponse = await fetch('${apiURL}/user_account/isUserVerified', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${data.token}`,
                        },
                    });
                    

                    if (verificationResponse.ok) {
                        const verificationData = await verificationResponse.json();
                        
                        // if (verificationData.isVerified) {

                        //     // Navigate to profile creation if user is verified
                        //     navigate('/profile-creation');
                        // } else {
                        //     // Navigate to email verification if user is not verified
                        //     navigate('/email-verification', { state: { email: email } });

                        // }

                        if (verificationData.isVerified) {
                            // Attempt to fetch user profile to check existence
                            const profileCheckResponse = await fetch(`${apiURL}/user_account/checkProfile`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${data.token}`,
                                },
                            });
                        
                            // If the response status is 404, navigate to the match page (profile not found)
                            if (profileCheckResponse.status === 404) {
                                navigate('/profile-creation');
                            } else {
                                // For any other response (including profile found), navigate to profile creation
                                navigate('/match-page');
                            }
                        } else {
                            // Navigate to email verification if user is not verified
                            navigate('/email-verification', { state: { email: email } });
                        }
                    } else {
                        console.error('Verification check failed:', await verificationResponse.json());
                    }
                } else {
                    console.error('Login successful but no data returned');
                }
            } else {
                // Handle other HTTP responses, such as 400 or 500 errors.
                console.error('Login failed:', await response.json());
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };
    
    

    
    const handleForgotPassword = () => {
        // Implement forgot password functionality
    };

    return (
        <div className="sign-up-page" style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}>
            <div className="left-column" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontWeight: 'bold', fontSize: '24px' }}>Welcome back to XPath!</h1>
                    <p>Enter your credentials to login.</p>
                </div>
                {/* <div style={{ marginBottom: '10px', textAlign: 'center'  }}>
                    <Button onClick={handleGoogleSignIn}>
                        <img src={googleIcon} alt="Google Icon" style={{ height: '100%' }} /> Sign in with Google
                    </Button>
                </div>
                <p className="or" style={{ textAlign: 'center', margin: '20px 0' }}>or</p> */}
                <div style={{ marginBottom: '20px' }}>
                    <Input type="email" onChange = {handleEmailChange} placeholder="Email" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <Input type="password" onChange = {handlePasswordChange} placeholder="Password" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <Button onClick={handleLogin}>Login</Button>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <Label htmlFor="remember">Remember me for 30 days</Label>
                    </div>
                </div>
                <div>
                    <Dialog>
                            <DialogTrigger style={{ fontWeight: 'bold', textDecoration: 'underline', fontStyle: 'italic' }}>Forgot password?</DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reset Password</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleForgotPassword}>
                                <Input type="email" placeholder="Enter your email" />
                                <div style={{ marginTop: '20px' }}>
                                    <Button type="submit">Reset Password</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                {/* <div>
                    <p>Already have an account? <span style={{ fontWeight: 'bold' , textDecoration: 'underline' }} onClick={handleLoginRedirect}>Log in</span></p>
                </div> */}
            </div>
            <div className="right-column" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={placeholderPicture} alt="Placeholder Picture" style={{ maxWidth: '100%', maxHeight: '100vh', height: 'auto' }} />
            </div>
        </div>
    );
};

export default SignIn;
