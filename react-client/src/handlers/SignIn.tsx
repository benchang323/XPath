//SignIn.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Checkbox,
  Input,
  Link,
} from "@nextui-org/react";
import MailIcon from "../components/MailIcon.tsx";
import LockIcon from "../components/LockIcon.tsx";
import { CircularProgress } from "@nextui-org/react";
import Alert from "@mui/material/Alert";
import {  useDispatch } from 'react-redux';
import { setUserEmailRedux } from '../redux/userActions.ts';


const SignIn: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState(""); // State variable for verification code
  const navigate = useNavigate();
  // const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSignInOpen,
    onOpen: onSignInOpen,
    onClose: onSignInClose,
  } = useDisclosure();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // State to control the visibility of the alert
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [resetStage, setResetStage] = useState("email");
  const [rememberMe, setRememberMe] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  
  // handle state management
  const dispatch = useDispatch();
   // Subscribe to changes in the Redux store to access the updated state

  const clearInputValues = () => {
    setEmail("");
    setPassword("");
  };

  useEffect(() => {
    // Show the alert for 5 seconds when error occurs
    if (error) {
      setShowAlert(true);
      const timeout = setTimeout(() => {
        setShowAlert(false);
        setError("");
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [error]);

  // useEffect(() => {
  //   // Check for successful login based on the updated state
  //   if (userEmail) {
  //     // Perform actions after successful login
  //     console.log("User email:", userEmail);
  //     // Navigate to the desired page after successful login
  //     navigate("/navigationMenu");
  //   }
  // }, [userEmail, navigate]);
  useEffect(() => {
    const token = localStorage.getItem("bearerToken") || sessionStorage.getItem("bearerToken");
    if (token) {
      navigate("/navigationMenu");
    }
  }, [navigate]);
  

  // const handleClose = async () => {
  //   clearInputValues();
  //   onClose();
  //   // Navigate to homepage if verification modal is closed
  //   if (showVerificationModal) {
  //     setShowVerificationModal(false);
  //     navigate("/");
  //   }
  // };

  const handleLogin = async () => {
    setLoading(true);
    console.log("hit");
    console.log("API URL:", API_URL);
    try {
      console.log(email, password);
      const response = await fetch(`${API_URL}/user_account/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      });
      clearInputValues();
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Login failed");
        return; // Exit the function if there's an error
      }

      const data = await response.json();
      console.log("Login successful", data);
      if (rememberMe) {
        localStorage.setItem("bearerToken", data.token); // Persistent storage
      } else {
        sessionStorage.setItem("bearerToken", data.token); // Temporary storage
      }
      

      // Check if user is verified
      const verificationResponse = await fetch(
        `${API_URL}/user_account/isUserVerified`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        },
      );

      if (!verificationResponse.ok) {
        const errorData = await verificationResponse.json();
        setError(errorData.detail || "Verification failed");
        return; // Exit the function if there's an error
      }

      const verificationData = await verificationResponse.json();

      if (verificationData.isVerified) {
        clearInputValues();
        // Attempt to fetch user profile to check existence
        const profileCheckResponse = await fetch(
          `${API_URL}/matching/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          },
        );

        if (profileCheckResponse.status === 404) {
          navigate("/createProfile");
        } else if (!profileCheckResponse.ok) {
          const errorData = await profileCheckResponse.json();
          setError(errorData.detail || "Profile check failed");
        } else {
          navigate("/navigationMenu");
        }
      } else {
        onSignInClose();
        // Open email verification modal
        setShowVerificationModal(true);
      }

      // Dispatch an action to update the Redux store with the user's email
      dispatch(setUserEmailRedux(email));

    } catch (error: any) {
      clearInputValues();
      setError(error.detail);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleLogin();
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
  };

  const handleResendCode = () => {
    // Add your logic to resend the verification code
    console.log("Resend verification code");
  };

  const handleSendResetCode = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
  
    try {
      // Call generate OTP endpoint
      const otpResponse = await fetch(`${API_URL}/user_account/generateOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailAddress: email.toString() }), // Send email to generate OTP
      });
      console.log("otp generated and sent to email...\n");
  
      if (otpResponse.ok) {
        setResetStage("otp");
      } else {
        const otpErrorData = await otpResponse.json();
        setError(
          otpErrorData.error ||
          "An unknown error occurred while generating OTP"
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      setError("A network error occurred. Please try again.");
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (resetStage === "otp") {
      try {
        const response = await fetch(`${API_URL}/user_account/validateOTP`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emailAddress: email, otp: resetCode }),
        });
  
        if (response.ok) {
          setResetStage("newPassword");
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to validate reset code");
        }
      } catch (error) {
        console.error("Network error:", error);
        setError("A network error occurred. Please try again.");
      }
    } else if (resetStage === "newPassword") {
      try {
        const passwordResetResponse = await fetch(`${API_URL}/user_account/changeRPassword`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emailAddress: email, password }),
        });
  
        if (passwordResetResponse.ok) {
          console.log("Password reset successful");
          setShowForgotPasswordModal(false); // Close the modal
        } else {
          const errorData = await passwordResetResponse.json();
          setError(errorData.error || "Failed to reset password");
        }
      } catch (error) {
        console.error("Network error:", error);
        setError("A network error occurred. Please try again.");
      }
    }
  };

  const handleVerificationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add your verification submission logic here
    console.log("Verification code submitted:", verificationCode);

    // Clear the input field after submission
    setVerificationCode("");
    setShowVerificationModal(false); // Close verification modal
    navigate("/createProfile"); // Navigate to homepage
  };

  return (
    <>
        <Button onPress={onSignInOpen} color={"white" as any} size={"small" as any} variant="solid">
        Sign In
      </Button>

      <Modal isOpen={isSignInOpen} onOpenChange={onSignInClose} placement="top-center">
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">Log in</ModalHeader>
            <ModalBody>
              <Input
                autoFocus
                endContent={
                  <MailIcon className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                }
                label="Email"
                placeholder="Enter your email"
                variant="bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                endContent={
                  <LockIcon className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                }
                label="Password"
                placeholder="Enter your password"
                type="password"
                variant="bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex justify-between px-1 py-2">
              <Checkbox
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                classNames={{
                  label: "text-small",
                }}
              >
                Remember me
              </Checkbox>

                <Link color="primary" href="#" size="sm" onClick={handleForgotPassword}>
                  Forgot password?
                </Link>
              </div>
            </ModalBody>
            <ModalFooter>
              {showAlert && (
                <Alert severity="error" onClose={() => setShowAlert(false)}>
                  {error}
                </Alert>
              )}
              {/* {!showAlert && (
                <Button color="danger" variant="flat" onClick={handleClose}>
                  Close
                </Button>
              )} */}
              {!showAlert && (
                <Button type="submit" color="primary">
                  {loading ? (
                    <CircularProgress color="default" aria-label="Loading..." />
                  ) : (
                    "Sign in"
                  )}
                </Button>
              )}
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal
        backdrop="blur"
        isOpen={showForgotPasswordModal}
        onOpenChange={setShowForgotPasswordModal}
        placement="top-center"
      >
        <form onSubmit={handleForgotPasswordSubmit}>
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              Forgot Password
            </ModalHeader>
            <ModalBody>
              {resetStage === "email" ? (
                <>
                  <h1>Enter your email to reset your password.</h1>
                  <Input
                    autoFocus
                    label="Email"
                    placeholder="Enter your email"
                    variant="bordered"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {showAlert && (
                    <Alert severity="error" onClose={() => setShowAlert(false)}>
                      {error}
                    </Alert>
                  )}
                  <Button
                    color="primary"
                    variant="light"
                    onClick={() => {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(email)) {
                        setError("Please enter a valid email address");
                        setShowAlert(true);
                      } else {
                        handleSendResetCode();
                      }
                    }}
                  >
                    Send Reset Code
                  </Button>
                </>
              ) : resetStage === "otp" ? (
                <>
                  <h1>Enter the verification code sent to your email.</h1>
                  <Input
                    autoFocus
                    label="Verification Code"
                    placeholder="Enter verification code"
                    variant="bordered"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <h1>Enter your new password.</h1>
                  <Input
                    autoFocus
                    label="New Password"
                    placeholder="Enter your new password"
                    variant="bordered"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </>
              )}
            </ModalBody>
            <ModalFooter>
              {resetStage === "otp" && (
                <Button type="submit" color="primary">
                  Verify OTP
                </Button>
              )}
              {resetStage === "newPassword" && (
                <Button type="submit" color="primary">
                  Set New Password
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>

      {/* Email Verification Modal */}
      <Modal
        backdrop="blur"
        isOpen={showVerificationModal}
        placement="top-center"
      >
        <form onSubmit={handleVerificationSubmit}>
          <ModalContent>
            <ModalHeader
              className="flex flex-col gap-1"
            >
              Email Verification
            </ModalHeader>
            <ModalBody>
              <h1>Enter your unique verification code to proceed.</h1>
              <Input
                autoFocus
                label="Verification Code"
                placeholder="Enter verification code"
                variant="bordered"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <Button
                color="primary"
                variant="light"
                onClick={handleResendCode}
              >
                Didn't receive your code? Send again
              </Button>
            </ModalBody>
            <ModalFooter>
              {/* <Button color="primary" variant="flat" onClick={handleClose}>
                Close
              </Button> */}
              <Button type="submit" color="primary">
                Submit
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  );
};

export default SignIn;
