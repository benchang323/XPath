// CreateProfile.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "../components/input";
import { Label } from "@/components/ui/label";
import { Button } from '@nextui-org/react';
import profile_header_1 from "../assets/pictures/Profile_header_1.jpg";
import { useSelector, useDispatch } from 'react-redux';
import { setUserEmailRedux } from '../redux/userActions.ts';
import { Switch } from "@nextui-org/react";
import dummy_avatar from '../assets/pictures/dummy_avatar_pic_1.png';
import { Badge } from "@nextui-org/react";
import { FaCamera } from "react-icons/fa";


interface Profile {
    [key: string]: string | File | null;
}

interface RootState {
    user: UserState; // Assuming UserState is the type of your 'user' slice
}

interface UserState {
    userEmail: string;
}

interface KeyMap {
    [questionText: string]: string | null;
}

const ProfileCreation: React.FC = () => {
    const bearerToken = sessionStorage.getItem("bearerToken");
    const API_URL = import.meta.env.VITE_API_URL;
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);

    const navigate = useNavigate();

    // experiment
    const [profile, setProfile] = useState<Profile>({});
    const [editedProfile, setEditedProfile] = useState<Profile>({ ...profile });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

    const [files, setFiles] = useState([]);
    const [mappedProfile, setMappedProfile] = useState<Record<string, string>>({});


    const requiredFields = [
        "Fullname (required)",
        "Gender (required)",
        "Occupation (required)",
        "Date of Birth (required)",
        "Your location: country (required)",
        "Your location: state (required)",
        "Your location: city (required)",
        "Your location: zipcode (required)",
        "Spirit Animal or Favorite Animal (required)",
        "Any superpower you want? (required)",
    ];

    const validateFields = () => {
        const newErrors: Record<string, string> = {};
        requiredFields.forEach(field => {
            const value = editedProfile[field];
            if (!value || (typeof value === "string" && value.trim() === "")) {
                newErrors[field] = "This field is required";
            }
        });
    
        // Check for profile picture file
        if (!profilePicFile) {
            newErrors["Profile Picture (required)"] = "A profile picture is required";
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Returns true if no errors
    };

    const keyMap: KeyMap = {
        "full_name": "Fullname (required)",
        "preferred_name": "Preferred Name",
        "gender": "Gender (required)",
        "languages": "Languages",
        "ethnicity": "Ethnicity",
        "occupation": "Occupation (required)",
        "birthdate": "Date of Birth (required)",
        "hobbies": "Hobbies",
        "interests": "Interests",
        "country": "Your location: country (required)",
        "state": "Your location: state (required)",
        "city": "Your location: city (required)",
        "zipcode": "Your location: zipcode (required)",
        "favoriteAnimal": "Spirit Animal or Favorite Animal (required)",
        "mostSpontaneous": "Most spontaneous thing that you have ever done?",
        "favoriteMoviesTvShows": "Favorite Movies and TV shows",
        "favoriteMusic": "Favorite Music",
        "favoriteFood": "Favorite Food",
        "zodiacSign": "Zodiac Sign",
        "favoriteCartoonCharacter": "Favorite Cartoon Character",
        "superpowerChoice": "Any superpower you want? (required)",
        "favoriteColor": "Favorite Color?",
        "profilePic": "Profile Picture (required)",
    };

    const blankProfile: KeyMap = {
        "Fullname (required)": "",
        "Preferred Name": "",
        "Gender (required)": "",
        "Languages": "",
        "Ethnicity": "",
        "Occupation (required)": "",
        "Date of Birth (required)": "",
        "Hobbies": "",
        "Interests": "",
        "Your location: country (required)": "",
        "Your location: state (required)": "",
        "Your location: city (required)": "",
        "Your location: zipcode (required)": "",
        "Spirit Animal or Favorite Animal (required)": "",
        "Most spontaneous thing that you have ever done?": "",
        "Favorite Movies and TV shows": "",
        "Favorite Music": "",
        "Favorite Food": "",
        "Zodiac Sign": "",
        "Favorite Cartoon Character": "",
        "Any superpower you want? (required)": "",
        "Favorite Color?": "",
        "Profile Picture (required)": null
    };

    const reverseKeyMap: KeyMap = Object.fromEntries(
        Object.entries(keyMap).map(([key, value]) => [value, key])
    );

    const handleSave = async () => {
        if (!validateFields()) {
            alert("Please fill out all required fields.");
            return; // Prevent the form from being submitted
        }

        const formData = new FormData();

        // Create a copy of editedProfile called submissionProfile
        const submissionProfile: Profile = {};
        Object.entries(editedProfile).forEach(([key, value]) => {
            const mappedKey = reverseKeyMap[key] || key; // Use the key mapping if available, otherwise use the original key
            submissionProfile[mappedKey] = value;
        });

        // console.log("submission profile", submissionProfile);

        // Convert submissionProfile into a dictionary
        const submissionDictionary: Record<string, string> = {};
        Object.entries(submissionProfile).forEach(([key, value]) => {
            submissionDictionary[key] = value;
        });

        // console.log("submission profile dictionary", submissionDictionary);

        // Iterate over the entries of submissionDictionary and append each entry to formData
        Object.entries(submissionDictionary).forEach(([key, value]) => {
            // console.log(key, submissionDictionary[key]);
            if (key !== 'profilePic') {
                formData.append(key, submissionDictionary[key]);
            }
        });
        // Log the contents of formData using the spread operator


        // Append profile picture if it exists
        if (profilePicFile) {
            formData.append('profilePic', profilePicFile);
            // console.log("pic", profilePicFile);
        }
        // console.log([...formData]);

        try {
            const response = await fetch(`${API_URL}/matching/profile`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${bearerToken}`,
                },
                body: formData,
            });
            if (response.ok) {
                handleShareProfile(canShareProfile);
                navigate("/navigationMenu");
                // setProfile(editedProfile);
                alert('Profile created successfully.');
            } else {
                 // Handle server errors or validation errors from account creation
        const accountErrorData = await response.json();
        setErrors(
          accountErrorData.error ||
            "An unknown error occurred during account creation",
        );
                console.error('Failed to update profile:', response.statusText);
            }
        } catch (error) {
            // Handle network errors
      console.error("Network error:", error);
      setErrors("A network error occurred. Please try again.");
        }
    };

    useEffect(() => {
        setProfile(blankProfile);
        setEditedProfile(blankProfile);
        // console.log(editedProfile);
    }, []);

    const handleInputChange = (key: string, event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setEditedProfile(prevProfile => ({
            ...prevProfile,
            [key]: value,
        }));
    };

    // Function to handle profile picture upload and submission
    const handleUploadProfilePic = async (filesArray: FileList) => {
        try {
            const ProfilePicformData = new FormData();
            // console.log("input", filesArray);
            ProfilePicformData.append("profilePic", filesArray[0]);


            // console.log("profile pic form", ProfilePicformData);
            // console.log("profile pic edited profile", editedProfile);

            // to preserve formData for editedProfile
            // Create a copy of editedProfile called submissionProfile
            const submissionProfile: Profile = {};
            Object.entries(editedProfile).forEach(([key, value]) => {
                const mappedKey = reverseKeyMap[key] || key; // Use the key mapping if available, otherwise use the original key
                submissionProfile[mappedKey] = value;
            });
            const submissionDictionary: Record<string, string> = {};
            Object.entries(submissionProfile).forEach(([key, value]) => {
                submissionDictionary[key] = value;
            });

            // console.log("submission profile pic dictionary", submissionDictionary);

            // Iterate over the entries of submissionDictionary and append each entry to formData
            Object.entries(submissionDictionary).forEach(([key, value]) => {
                // console.log(key, submissionDictionary[key]);
                ProfilePicformData.append(key, submissionDictionary[key]);
            });


            // handle response 
            const response = await fetch(`${API_URL}/matching/profile`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${bearerToken}`,
                },
                // Pass the FormData object as the request body
                body: ProfilePicformData,
            });

            if (response.ok) {
                console.log('Profile picture uploaded successfully');
            } else {
                console.error('Failed to upload profile picture');
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        }

    };

    // Function to handle file change
    // This function is triggered by the file input field
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setProfilePicFile(event.target.files[0]);
        } else {
            setProfilePicFile(null); // Clear the file if none is selected
        }
    };
    

    // Pending Alex's review and direct edit
    const [canShareProfile, setCanShareProfile] = useState(true);

    const handleShareProfile = async () => {
        try {
            const response = await fetch(`${API_URL}/share/sharingstatus/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${bearerToken}`,
                },
                body: JSON.stringify({
                    can_share_profile: canShareProfile,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();

            console.log('Success:', data.message); // Log success message
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const toggleSharingStatus = async () => {
        setCanShareProfile(currentStatus => {
            const newStatus = !currentStatus;
            return newStatus; // Update local state
        });
    };


    const handleSignOut = async () => {
        try {
            const response = await fetch(`${API_URL}/user_account/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include the bearer token if available
                    Authorization: `Bearer ${bearerToken}`,
                },
            });
            if (response.ok) {
                // Clear session storage
                sessionStorage.removeItem('bearerToken');
                console.log('User signed out');
                dispatch(setUserEmailRedux('')); // Set user's email to empty string

                // Redirect to home page
                navigate('/');
            } else {
                console.error('Failed to log out:', response.statusText);
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="bg-zinc-900 text-white min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-black py-4 px-7 flex justify-between items-center">
                <a href="/" className="text-xl font-bold">
                    xPath
                </a>
                <Button
                    onPress={handleSignOut}
                    color="white"
                    size="small"
                    variant="ghost"
                    className="ml-3"
                >
                    Sign Out
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex justify-center items-stretch">
                <div className="w-full max-w-screen-lg p-10">

                    {/* My Profile Card */}
                    <Card className="bg-zinc-800 border border-gray-700 text-white w-full">
                        {/* Header Image */}
                        <img src={profile_header_1} alt="Header Image" className="mb-4" />
                        <CardHeader>
                            <CardTitle className="text-xlg">My Profile</CardTitle>
                            <CardDescription>Please provide your profile information below. Please note that some fields are required.</CardDescription>
                        </CardHeader>
                        <CardContent>

                            <div className="flex flex-col items-center mt-10">
                                {/* Conditionally render avatar picture or dummy avatar */}
                                {/* {profilePicUrl ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <input type="file" id="profilePicInput" style={{ display: 'none' }} onChange={handleFileChange} />
                                        <label htmlFor="profilePicInput">
                                            <img
                                                src={profilePicUrl}
                                                alt="ProfilePic"
                                                className="w-40 h-40 border-4 border-gray-500 cursor-pointer"
                                            />
                                        </label>
                                        <Button isIconOnly className="w-10" color="danger" style={{ marginTop: '20px' }} onClick={handleBadgeClick}><FaCamera /></Button>
                                        <div className="my-4"></div>
                                    </div>
                                ) : (
                                    <img
                                        src={dummy_avatar}
                                        alt="ProfilePic"
                                        className="w-32 h-32 rounded-full border-4 border-gray-500"
                                    />
                                )} */}
                            </div>
                            {Object.entries(editedProfile).map(([key, value]) => (
    <div key={key}>
        <Label htmlFor={key} className="font-bold">{key}</Label>
        <div>
            {key === "Profile Picture (required)" ? (
                <input
                    type="file"
                    id={key}
                    name={key}
                    onChange={handleFileChange}
                    accept="image/*"
                />
            ) : (
                <Input
                    id={key}
                    name={key}
                    value={typeof value === 'string' ? value : ''}
                    onChange={(e) => handleInputChange(key, e)}
                />
            )}
            {errors[key] && <span className="text-red-500 text-sm">{errors[key]}</span>}
        </div>
        <div className="my-2"></div>
    </div>
))}



                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">

                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Switch checked={canShareProfile}
                                    onChange={toggleSharingStatus}
                                    defaultSelected color="warning" />
                                <span className="white-text">Share Profile</span>
                            </div>
                            <Button className="w-full" color="warning" onClick={handleSave}>Submit</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>


            {/* Footer */}
            <div className="py-4 bg-gray-800 text-center">
                © 2024 xPath. All rights reserved.
            </div>
        </div>
    );

}

export default ProfileCreation;
