// EmailVerification.tsx
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiURL } from '../config';


const EmailVerification: React.FC = () => {
    const [code, setCode] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Extract the email from the navigation state if present
        const stateEmail = location.state?.email;
        if (stateEmail) {
            setEmail(stateEmail);
        } else {
            // Handle the case where email is not passed; redirect or show an error
            console.error("Email not provided");
            navigate('/signup'); // Redirect back to signup or an appropriate page
        }
    }, [location, navigate]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const re = /^[0-9\b]+$/; // Regex to allow numbers only

        if (value === '' || (re.test(value) && value.length <= 6)) {
            setCode(value);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();


        try {
            const response = await fetch(`${apiURL}/user_account/validateOTP`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailAddress: email.toString(),
                    otp: code.toString()
                }),
            });

            if (response.ok) {
                // Handle success, e.g., navigate to the dashboard or show a success message
                console.log("OTP verified successfully");
                navigate('/signin'); // Adjust the navigation as needed
            } else {
                // Handle server response errors
                const error = await response.json();
                console.error("Error validating OTP:", error.error);
                // Optionally, update UI to show error message to the user
            }
        } catch (error) {
            console.error('Network error:', error);
            // Optionally, update UI to show network error message to the user
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
                <h3 className="text-2xl font-bold text-center">Verify Your Email</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <label className="block" htmlFor="code">Verification Code</label>
                        <input
                            type="password"
                            placeholder="Enter code"
                            id="code"
                            name="code"
                            value={code}
                            onChange={handleInputChange}
                            maxLength={6}
                            pattern="\d{6}"
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1"
                            required
                        />
                        <div className="flex items-baseline justify-between">
                            <button type="submit" className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Verify</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmailVerification;
