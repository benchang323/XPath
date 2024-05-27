// HomePage.tsx
import React, { useState, useEffect, useRef } from "react";
import homepage2 from "../assets/pictures/homepage2.jpeg";
import { CircularProgress } from "@nextui-org/react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import MailIcon from "../components/MailIcon.tsx";
import LockIcon from "../components/LockIcon.tsx";
import UserIcon from "@/components/UserIcon.tsx";
import PhoneNumberIcon from "@/components/PhoneIcon.tsx";
import SignIn from "@/handlers/SignIn.tsx";
// import { handleCreateAccount } from "@/lib/signup-function.ts";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
 

const Home: React.FC = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birth_date, setBirthDate] = useState("");
  const [OTPcode, setOTPcode] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    isOpen: isCreateAccountOpen,
    onOpen: onCreateAccountOpen,
    onClose: onCreateAccountClose,
  } = useDisclosure();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccess, setSuccessAlert] = useState(false);
  // const { toast } = useToast();
  const [isOTPModalOpen, setOTPModalOpen] = useState(false);
  const emailRef = useRef("");
  const validateEmail = (email: any) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhoneNumber = (phoneNumber: any) => /^\d{10}$/.test(phoneNumber);
  const validateBirthDate = (birthDate: any) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(birthDate)) return false;

    const date = new Date(birthDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    return date instanceof Date && !isNaN(date as any) && date < today;
  };


  const handleCreateAccount = async () => {
    try {
      console.log("email: " + email + "\n");
      console.log("username: " + username + "\n");
      console.log("password: " + password + "\n");
      console.log("phone: " + phoneNumber + "\n");
      console.log("birthDate: " + birth_date + "\n");
      console.log("window.location.origin: " + window.location.origin + "\n");

      emailRef.current = email; // Update email ref value

      const accountResponse = await fetch(`${API_URL}/user_account/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toString(),
          password: password,
          username: username,
          phoneNumber: phoneNumber.toString(), // Ensure phoneNumber is sent as a string
        }),
      });
      if (accountResponse.status != 200) {
        console.log("bad request");
      }
      if (accountResponse.ok) {
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
          // await handleCreateAccount(email);
          // await handleOTPSubmit(email); 

          // Navigate to email verification page with email state
          navigate("/", { state: { email: email } });
          // Close create account modal
          onCreateAccountClose();
          // Show OTP modal
          setOTPModalOpen(true);
          // showSuccessToast();
        } else {
          const otpErrorData = await otpResponse.json();
          setError(
            otpErrorData.error ||
            "An unknown error occurred while generating OTP",
          );
        }
      } else {
        // Handle server errors or validation errors from account creation
        const accountErrorData = await accountResponse.json();
        setError(
          accountErrorData.error ||
          "An unknown error occurred during account creation",
        );
      }
    } catch (error) {
      // Handle network errors
      console.error("Network error:", error);
      setError("A network error occurred. Please try again.");
    }
  };

  // Handler for submitting OTP
  const handleOTPSubmit = async () => {
    try {
      setLoading(true);
      console.log("submit Email:", emailRef.current);
      await handleOTPVerification();
      // toast.success("Success message");
    } catch (error) {
      setError(
        "An error occurred while verifying OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    try {
      console.log("handle Email:", emailRef.current);
      console.log("OTP:", OTPcode);
      const otpResponse = await fetch(`${API_URL}/user_account/validateOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailAddress: emailRef.current.toString(), // Assuming email is already stored in a state variable
          otp: OTPcode, // Assuming OTPcode is already stored in a state variable
        }),
      });

      if (otpResponse.ok) {
        // OTP verification successful, you can navigate user to another page or perform any other action here
        console.log("OTP verification successful");
        setSuccess("Verification successful! Please login to continue.")
        // setSuccessAlert(true)
        // setOTPModalOpen(false);
        // ADD TOAST HERE****
        // navigate("/createProfile");
      } else if (otpResponse.status === 401) {
        // Incorrect OTP
        setError("Incorrect OTP. Please try again.");
      } else {
        // Handle other error cases
        setError("Error verifying OTP. Please try again.");
      }
    } catch (error) {
      // Handle network errors
      console.error("Network error:", error);
      setError("A network error occurred. Please try again.");
    }
  };

  const handler = async () => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setShowAlert(true);
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      setError("Phone number must be 10 digits.");
      setShowAlert(true);
      return;
    }
    if (!validateBirthDate(birth_date)) {
      setError("Birth date must be a valid date in the format YYYY-MM-DD and before today.");
      setShowAlert(true);
      return;
    }
    
    try {
      setLoading(true);
      await handleCreateAccount();
      onCreateAccountClose();
    } catch (error) {
      setError("An error occurred while creating your account. Please try again.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      setShowAlert(true);
      const timeout = setTimeout(() => {
        setShowAlert(false);
        setError("");
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [error]);

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
    useEffect(() => {
      // Show the alert for 5 seconds when error occurs
      if (success) {
        setSuccessAlert(true);
        const timeout = setTimeout(() => {
          setSuccessAlert(false);
          setSuccess("");
        }, 1500);
        return () => {handleCloseSuccessModal(timeout);};
      }
    }, [success]);
  const handleCloseSuccessModal = async (timeout: NodeJS.Timeout) => {
    clearTimeout(timeout);
    setOTPModalOpen(false)
  }


  
  return (
    <div className="min-h-screen text-white bg-zinc-900">
      <div className="flex items-center justify-between w-full py-4 bg-black px-7">
        <a href="/" className="text-xl font-bold">
          xPath
        </a>
        <div>
          <SignIn />

          {/* Create account */}
          <Button
            onPress={onCreateAccountOpen}
            color={"white" as any}
            size={"small" as any}
            variant = "ghost"
          >
            Create Account
          </Button>
          <Modal
            isOpen={isCreateAccountOpen}
            onOpenChange={onCreateAccountClose}
            placement="top-center"
          >
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">
                Create Account
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  endContent={
                    <UserIcon className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                  }
                  label="Username"
                  placeholder="Enter your username"
                  variant="bordered"
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                  endContent={
                    <MailIcon className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                  }
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  variant="bordered"
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
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  endContent={
                    <PhoneNumberIcon className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                  }
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  variant="bordered"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <Input
                  endContent={
                    <UserIcon className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                  }
                  label="Birth Date"
                  placeholder="Enter your birth date (yyyy-mm-dd)"
                  variant="bordered"
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                {showAlert && (
                  <Alert severity="error" onClose={() => setShowAlert(false)}>
                    {error}
                  </Alert>
                )}
                {/* {!showAlert && (
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={onCreateAccountClose}
                  >
                    Close
                  </Button>
                )} */}
                {!showAlert && (
                  <Button color="primary" onPress={handler}>
                    {" "}
                    {loading ? (
                      <CircularProgress
                        color="default"
                        aria-label="Loading..."
                      />
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                )}
              </ModalFooter>
            </ModalContent>
          </Modal>
          {/* Send OTP modal content */}
          <Modal
            isOpen={isOTPModalOpen}
            onOpenChange={setOTPModalOpen}
            placement="top-center"
          >
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">
                OTP Verification
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  endContent={
                    <UserIcon className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                  }
                  label="OTP"
                  placeholder="Enter your OTP Code"
                  variant="bordered"
                  onChange={(e) => setOTPcode(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                {showAlert && (
                  <Alert severity="error" onClose={() => setShowAlert(false)}>
                    {error}
                  </Alert>
                )}
                {showSuccess && (
                  <Alert onClose={() => setSuccessAlert(false)}>
                    {success}
                  </Alert>
                )}
                {!showAlert && (
                  <Button color="primary" onPress={handleOTPSubmit}>
                    {" "}
                    {loading ? (
                      <CircularProgress
                        color="default"
                        aria-label="Loading..."
                      />
                    ) : (
                      "Submit"
                    )}
                  </Button>
                )}
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
      </div>
      <div className="flex justify-center h-full px-8">
        <div className="flex items-center w-full max-w-6xl mt-20">
          <div className="mr-4 text-5xl font-bold font-sans-serif flex-0 ">
            <div className="mb-4 text-5xl font-bold font-sans-serif">
              cross paths with like-minded commute and travel buddies.
            </div>
            <Button
              radius="md"
              variant="ghost"
              color={"white" as any}
              onPress={onCreateAccountOpen}
            >
              let's travel together
            </Button>
          </div>

          <div className="flex-shrink-1">
            <img
              src={homepage2}
              alt="Your Image"
              className="border border-gray-500 h-70 w-70"
            />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full py-4 text-center text-white bg-gray-800">
        {/* Footer content */}© 2024 xPath. All rights reserved.
      </div>
    </div>
  );
};

export default Home;

