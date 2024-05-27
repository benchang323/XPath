// UserProfile.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
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
import {  useDispatch } from 'react-redux';
import { setUserEmailRedux } from '../redux/userActions.ts';
import dummy_avatar from '../assets/pictures/dummy_avatar_pic_1.png';
import { FaCamera } from "react-icons/fa";


interface Profile {
    [key: string]: string;
}



interface KeyMap {
    [questionText: string]: string;
}

const UserProfile: React.FC = () => {
    const bearerToken = sessionStorage.getItem("bearerToken");
    const API_URL = import.meta.env.VITE_API_URL;
    const dispatch = useDispatch();

    const navigate = useNavigate();

    // experiment
    const [profile, setProfile] = useState<Profile>({});
    const [editedProfile, setEditedProfile] = useState<Profile>({ ...profile });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});



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
        "Any superpower you want? (required)"
    ];

    const validateFields = () => {
        const newErrors: Record<string, string> = {};
        requiredFields.forEach(field => {
            const key = reverseKeyMap[field]; // Get the internal key using the display name
            console.log(key)
            // console.log(field);
            if (!editedProfile[field] || editedProfile[field].trim() === "") {
                newErrors[field] = "This field is required";
            }
        });
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
        "favoriteColor": "Favorite Color?"
    };

    const reverseKeyMap: KeyMap = Object.fromEntries(
        Object.entries(keyMap).map(([key, value]) => [value, key])
    );

    const handleEdit = () => {
        setIsEditing(true);
        setEditedProfile({ ...editedProfile });
        // setEditedProfile({ ...profile });
    };

    const handleSave = async () => {

        if (!validateFields()) {
            alert("Please fill out all required fields.");
            return; // Prevent the form from being submitted
        }

        try {
            // Submit edited profile here
            setIsEditing(false);

            // Create a new FormData object
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
            Object.entries(submissionDictionary).forEach(([key]) => {
                // console.log(key, submissionDictionary[key]);
                formData.append(key, submissionDictionary[key]);
            });
            // Log the contents of formData using the spread operator
            // console.log(formData);



            const response = await fetch(`${API_URL}/matching/profile`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${bearerToken}`,
                },
                //FormData
                // body: formData
                body: formData,
            });
            if (response.ok) {
                setIsEditing(false);
                setProfile(editedProfile);
                alert('Profile updated successfully.');
            } else {
                console.error('Failed to update profile:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    // Function to fetch user profile data
    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch(`${API_URL}/matching/profile`, {

                method: 'GET',
                headers: {
                    Authorization: `Bearer ${bearerToken}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                // console.log("response profile", data.profile);
                setProfile(data.profile);
                const mappedProfileData = mapProfileFields(data.profile);
                // setMappedProfile(mappedProfileData);
                setEditedProfile(mappedProfileData);
                // console.log("response profile", data.profile);
                // console.log("initial mapped profile", mappedProfileData);
                // console.log("initial edited profile", editedProfile);
                return data.profile;
            } else {
                throw new Error('Failed to fetch user profile');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    };

    useEffect(() => {
        // Fetch user's profile picture when component mounts
        handleProfilePic();
    }, []);

    const handleProfilePic = async () => {
        try {
            const response = await fetch(`${API_URL}/matching/profile/profilePicUrl`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${bearerToken}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                const profilePicUrl = data.url; // Assuming the response contains the avatar URL
                // console.log(data.url);
                setProfilePicUrl(profilePicUrl);
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
        }
    };

    // Function to map profile fields to keyMap
    const mapProfileFields = (profile: Record<string, string>): Record<string, string> => {
        // console.log("profile", profile);
        // console.log("keyMap", keyMap);

        // profile = input profile

        const outputProfile: Record<string, string> = {};
        // const temp_mappedProfile: Record<string, string> = {};
        Object.entries(keyMap).forEach(([question, fieldKey]) => {
            // console.log("question:", question);
            // console.log("Field Key:", fieldKey);


            if (question in profile) {
                const value = profile[question] || ''; // Get the value from the profile using the fieldKey
                const mappedQuestion = fieldKey || question; // Use the fieldKey if available, otherwise use the original question

                // console.log("question:", question);
                // console.log("value:", value);
                // mappedProfile[mappedQuestion] = value;
                outputProfile[mappedQuestion] = value;
            } else {
                console.error(`Field key '${fieldKey}' not found in profile.`);
            }
        });

        // setMappedProfile(mappedProfile);
        // console.log("output profile", outputProfile);
        return outputProfile;
    };

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

            // Assuming profilePicFile is the selected profile picture file from an input field
            // Append the profile picture file to the FormData object
            // Convert files to an array if it's not already
            // const filesArray = Array.from(files);
            // console.log("input", filesArray);
            ProfilePicformData.append("profilePic", filesArray[0]);

            // filesArray.forEach((file) => {
            //     ProfilePicformData.append("profilePic", file);
            // });

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
            Object.entries(submissionDictionary).forEach(([key]) => {
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
                // console.log('Profile picture uploaded successfully');
            } else {
                console.error('Failed to upload profile picture');
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        }

        // Optionally, you can update the UI or trigger any other actions upon successful upload
        handleProfilePic();

    };

    // Function to handle file change
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const fileList = event.target.files;
            // console.log("Selected files:", fileList);

            handleUploadProfilePic(fileList);
        }
    };

    const handleBadgeClick = () => {
        const fileInput = document.getElementById('profilePicInput');
        if (fileInput) {
            fileInput.click();
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await fetch(`${API_URL}/matching/profile`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${bearerToken}`,
                },
            });
            
            if (response.ok) {
                alert('Account deleted successfully.');
                // console.log('Account deleted successfully.');
                navigate('/');
                // Redirect the user to the login page or any other appropriate page after successful deletion
                // window.location.href = '/login';
            } else {
                // Handle non-200 status codes
                console.error('Failed to delete profile:', response.statusText);
                alert('Failed to delete account. Please try again later.');
            }
        } catch (error) {
            // Handle network errors or unexpected exceptions
            console.error('Error deleting profile:', error);
            alert('An unexpected error occurred. Please try again later.');
        }
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
                <div>

                    <Button
                        color="success"
                        size={"small" as any}
                        variant="solid"
                        onClick={() => navigate('/navigationMenu')}
                    >
                        Navigation Menu
                    </Button>
                    <Button
                        color="danger"
                        size={"small" as any}
                        variant="solid"
                        onPress={handleDeleteAccount}
                        className="ml-3"
                    >
                        Delete Account
                    </Button>
                    <Button
                        onPress={handleSignOut}
                        color={"white" as any}
                        size={"small" as any}
                        variant="ghost"
                        className="ml-3"
                    >
                        Sign Out
                    </Button>
                </div>
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
                            <CardDescription>Update your profile information below. Please note that some fields are required.</CardDescription>
                        </CardHeader>
                        <CardContent>

                            <div className="flex flex-col items-center mt-10">
                                {/* Conditionally render avatar picture or dummy avatar */}
                                {profilePicUrl ? (
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
                                )}
                            </div>

                            {Object.entries(editedProfile).map(([key, value]) => (
                                <div key={key}>
                                    <Label htmlFor={key} className="font-bold">{key}</Label>
                                    {isEditing ? (
                                        <div>
                                            <Input
                                                id={key}
                                                name={key}
                                                value={value}
                                                onChange={(e) => handleInputChange(key, e)}
                                            />
                                            {errors[key] && <span className="text-red-500 text-sm">{errors[key]}</span>}
                                        </div>
                                    ) : (
                                        <div style={{ fontStyle: 'italic' }} className="text-xlg">{value}</div>
                                    )}
                                    <div className="my-2"></div>
                                </div>
                            ))}

                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">

                            {isEditing ? (
                                <div className="flex justify-end space-x-2">
                                    <Button color="success" onClick={handleSave}>Save</Button>
                                    <Button onClick={handleCancel}>Cancel</Button>
                                </div>
                            ) : (
                                <Button className="w-full" color="warning" onClick={handleEdit}>Update My Basic Info</Button>
                            )}
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

export default UserProfile;
