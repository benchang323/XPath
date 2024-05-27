import React, { useState } from "react";
import axios, { AxiosError } from "axios";
interface CreateAccountResult {
  success: boolean;
  error?: string;
}

export const handleCreateAccount = async (
  email: string,
  password: string,
  username: string,
  phoneNumber: string
): Promise<CreateAccountResult> => {
  const API_URL: string = import.meta.env.VITE_API_URL as string;
  try {
    const accountResponse = await axios.post(`${API_URL}/user_account/register`, {
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

    if (!accountResponse.ok) {
      const accountErrorData = await accountResponse.json();
      throw new Error(
        accountErrorData.error ||
          "An error occured while creating your account. Please try again with a different username or"
      );
    }

    const otpResponse = await axios.post(`${API_URL}/user_account/generateOTP`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailAddress: email.toString() }), // Send email to generate OTP
    });

    if (!otpResponse.ok) {
      const otpErrorData = await otpResponse.json();
      throw new Error(
        otpErrorData.error || "An unknown error occurred while generating OTP"
      );
    }

    // Return success result
    return { success: true };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.data) {
        console.error(
          "API exception message:",
          axiosError.response.data.detail,
        );
      } else {
        console.error("API exception occurred:", axiosError.message);
      }
    } else {
      // Handle generic error
      console.error("Error:", error.message);
    }
    throw new Error(error)
    // Handle errors
    console.error("Error creating account:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred. Please try again.",
    };
  }
};
