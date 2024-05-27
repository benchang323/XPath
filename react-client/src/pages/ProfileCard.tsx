// ProfileCreation.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { apiURL } from '../config';

import * as SelectPrimitive from "@radix-ui/react-select";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AspectRatio } from '@/components/ui/aspect-ratio';
import dummyCoverPic3 from '../assets/pictures/dummy_cover_pic_3.jpg'; // Import image using ES6 module syntax
import dummyProfilePic1 from '../assets/pictures/dummy_profile_pic_1.jpg';
import dummyavatar1 from '../assets/pictures/dummy_avatar_pic_1.png';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Select,
    SelectGroup,
    SelectLabel,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"



interface Profile {
    fullName: string;
    // email: string;
    // phone: string;
    gender: string;
    languages: string;
    ethnicity: string;
    // password: string; // Placeholder for encrypted password
    bio: string;
    currentAddress: string;
    workAddress: string;
    hometown: string;
    interests: string;
    preferredCommuteTimes: string;
    // emerName: string;
    // emerPhone: string;
    avatar?: File;
    profilePic?: File;
}

interface MediaFile {
    id: number;
    url: string;
    type: string;
}

interface ControlledSelectProps {
    fieldName: string;
    value: string;
    onChange: (name: string, value: string) => void;
    children: React.ReactNode;
  }

const ProfileCard: React.FC = () => {
    const [profile, setProfile] = useState<Profile>({
        // Initialize with empty values or placeholders
        fullName: '',
        // email: '',
        // phone: '',
        gender: '',
        languages: '',
        ethnicity: '',
        // password: '', // You wouldn't actually store the password like this; this is just for placeholder purposes
        bio: '',
        currentAddress: '',
        workAddress: '',
        hometown: '',
        interests: '',
        preferredCommuteTimes: '',
        // emerName: '',
        // emerPhone: '',
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isEditingMedia, setIsEditingMedia] = useState<boolean>(false);
    const [avatar, setAvatar] = useState<File | null>(null);
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [editedProfile, setEditedProfile] = useState<Profile>({ ...profile });
    const [avatarPreview, setavatarPreview] = useState<string | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);


    const handleEdit = () => {
        setIsEditing(true);
        setEditedProfile({ ...profile });
    };

    const navigate = useNavigate();

    const [unsavedData, setUnsavedData] = useState({});
    const [unsavedFiles, setUnsavedFiles] = useState({ avatar: null, profilePic: null });
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileExists, setProfileExists] = useState(false);
    
    // Adjust this effect to also set whether a profile exists
    useEffect(() => {
        const fetchProfile = async () => {
            const authToken = sessionStorage.getItem('bearerToken');
            if (!authToken) {
                console.error('Authentication token not found');
                setLoadingProfile(false); // Ensure loading is set to false even if there's no token
                return;
            }
            try {
                const response = await fetch(`${apiURL}/matching/profile`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json(); // Define 'data' by awaiting the JSON response
                    if (data.profile) {
                        setProfileExists(true);
                        setProfile(data.profile);
                    } else {
                        // Handle case where 'profile' key might not exist in response data
                        setProfileExists(false);
                    }
                } else {
                    console.error('Failed to fetch profile');
                    setProfileExists(false); // Consider setting profileExists to false on fetch failure
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setProfileExists(false); // Consider setting profileExists to false on error
            }
            setLoadingProfile(false); // Ensure loading is set to false after fetching
        };
        fetchProfile();
    }, []);
    

    const fetchProfile = async () => {
        const authToken = sessionStorage.getItem('bearerToken');
        if (!authToken) {
            console.error('Authentication token not found');
            return;
        }
        try {
            const response = await fetch(`${apiURL}/matching/profile`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);
            } else {
                console.error('Failed to fetch profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }

    const handleProfilePicUpload = async (event: FormEvent) => {
        event.preventDefault();
        if (profilePic) {
            await uploadFile(profilePic, 'profilePic');
        }
    };

    const handleavatarUpload = async (event: FormEvent) => {
        event.preventDefault();
        if (avatar) {
            await uploadFile(avatar, 'avatar');
        }
    };

    const handleMediaFileUpload = async (event: FormEvent) => {
        event.preventDefault();
        //  logic to upload a new media file
    };

    const uploadFile = async (file: File, type: 'avatar' | 'profilePic') => {
        const formData = new FormData();
        formData.append(type, file);

        const authToken = sessionStorage.getItem('bearerToken');
        if (!authToken) {
            alert("You're not logged in or the session has expired.");
            navigate('/login'); // Adjust the path as needed
            return;
        }
        try {
            const response = await fetch(`${apiURL}/matching/profile/${type}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: formData,
            });
            console.log(response.body)
            if (!response.ok) throw new Error('Upload failed');
            alert(`${type} uploaded successfully.`);
            fetchProfile(); // Refresh profile data to reflect the newly uploaded image
        } catch (error) {
            console.error(`Error uploading ${type}:`, error);
            alert(`Failed to upload ${type}.`);
        }
    };


    const handleSave = async () => {
        // Combine profile data and unsaved changes
        const formData = new FormData();
        Object.entries(editedProfile).forEach(([key, value]) => {
            if (value instanceof File) {
                formData.append(key, value);
            } else if (value !== null) {
                formData.append(key, String(value));
            }
        });
    
        try {
            // First, check if the profile exists
            const authToken = sessionStorage.getItem('bearerToken');
            const checkResponse = await fetch(`${apiURL}/matching/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
    
            // Determine if you should create a new profile or update an existing one
            let method = 'POST';
            if (checkResponse.ok) {
                const checkData = await checkResponse.json();
                if (checkData.profile) {
                    method = 'PUT'; // Set to PUT if profile exists
                }
            } else if (checkResponse.status !== 404) {
                // Handle errors other than 'Not Found'
                const errorData = await checkResponse.json();
                alert(`Failed to check profile: ${errorData.error}`);
                return;
            }
    
            // Then, create or update the profile
            const response = await fetch(`${apiURL}/matching/profile`, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    // Content-Type should not be set manually for FormData
                },
                body: formData,
            });
    
            if (response.ok) {
                const data = await response.json();
                alert(`Profile ${method === 'PUT' ? 'updated' : 'created'} successfully.`);
                setProfileExists(true); // Assume profile now exists after successful creation or update
                setProfile(data.profile || {}); // Update profile state with returned data
            } else {
                // Handle failure
                const errorData = await response.json();
                alert(`Failed to save profile: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    };


    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setEditedProfile(prevProfile => ({
            ...prevProfile,
            [name]: value
        }));
    };

    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const name = event.target.name;
        const value = event.target.value;
        setEditedProfile(prevProfile => ({
            ...prevProfile,
            [name]: value
        }));
    };
    

    const handleDeleteAccount = () => {
        // Implement the delete account logic
        console.log('Account deletion requested');
    };

    const handleUpdateProfile = async () => {
        const formData = new FormData();
    // Append all profile fields to formData
        formData.append('fullName', editedProfile.fullName);
        // formData.append('email', editedProfile.email);
        // formData.append('phone', editedProfile.phone);
        formData.append('gender', editedProfile.gender);
        formData.append('languages', editedProfile.languages);
        formData.append('ethnicity', editedProfile.ethnicity);
        
        // formData.append('password', editedProfile.password);
        formData.append('bio', editedProfile.bio);
        formData.append('currentAddress', editedProfile.currentAddress);
        formData.append('workAddress', editedProfile.workAddress);
        formData.append('hometown', editedProfile.hometown);
        formData.append('interests', editedProfile.interests);
        formData.append('preferredCommuteTimes', editedProfile.preferredCommuteTimes);
        // formData.append('emerName', editedProfile.emerName);
        // formData.append('emerPhone', editedProfile.emerPhone);        

        if (profilePic) formData.append('profilePic', profilePic);
        if (avatar) formData.append('avatar', avatar);
    
        const authToken = sessionStorage.getItem('bearerToken');
        if (!authToken) {
            alert("You're not logged in or the session has expired.");
            navigate('/login'); // Adjust the path as needed
            return;
        }
        try {
            const response = await fetch(`${apiURL}/matching/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    // Note: Don't set 'Content-Type' header when using FormData
                },
                body: formData,
            });
            console.log(response.body)
            if (response.ok) {
                const data = await response.json(); 
                console.log(data)
                alert('Profile updated successfully.');
                fetchProfile(); // Re-fetch profile to reflect changes
            } else {
                alert('Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    // Create Profile
    const handleCreateProfile = async () => {

        const formData = new FormData();
    // Append all profile fields to formData
        formData.append('fullName', editedProfile.fullName);
        // formData.append('email', editedProfile.email);
        // formData.append('phone', editedProfile.phone);
        formData.append('gender', editedProfile.gender);
        formData.append('languages', editedProfile.languages);
        formData.append('ethnicity', editedProfile.ethnicity);
        
        // formData.append('password', editedProfile.password);
        formData.append('bio', editedProfile.bio);
        formData.append('currentAddress', editedProfile.currentAddress);
        formData.append('workAddress', editedProfile.workAddress);
        formData.append('hometown', editedProfile.hometown);
        formData.append('interests', editedProfile.interests);
        formData.append('preferredCommuteTimes', editedProfile.preferredCommuteTimes);
        // formData.append('emerName', editedProfile.emerName);
        // formData.append('emerPhone', editedProfile.emerPhone);        

        if (profilePic) formData.append('profilePic', profilePic);
        if (avatar) formData.append('avatar', avatar);

        const authToken = sessionStorage.getItem('bearerToken');
        if (!authToken) {
            alert("You're not logged in or the session has expired.");
            navigate('/login'); // Adjust the path as needed
            return;
        }

        try {
            const authToken = sessionStorage.getItem('bearerToken');
            const response = await fetch(`${apiURL}/matching/profile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                  
                },
                body: formData,
            });
            console.log(response.body)
            if (response.ok) {
                const data = await response.json(); 
                console.log(data)
                alert('Profile created successfully.');
                navigate('/match-page'); // Navigate to the match page or dashboard
            } else {
                alert('Failed to create profile.');
            }
        } catch (error) {
            console.error('Error creating profile:', error);
        }
    };

    // Delete Profile
    const handleDeleteProfile = async () => {
        try {
            const authToken = sessionStorage.getItem('bearerToken');
            if (!authToken) {
                alert("You're not logged in or the session has expired.");
                navigate('/login'); // Adjust the path as needed
                return;
            }
            const response = await fetch(`${apiURL}/matching/profile`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                // Include necessary identifiers if required by your API
            });
            if (response.ok) {
                const data = await response.json(); // Use .json() if response is JSON
                console.log(data); // Now data contains the body content
                alert('Profile deleted successfully.');
                navigate('/signin'); // Navigate to signup or a suitable page
            } else {
                alert('Failed to delete profile.');
            }
        } catch (error) {
            console.error('Error deleting profile:', error);
        }
    };


    const handleFileChange = (event: ChangeEvent<HTMLInputElement>, type: 'avatar' | 'profilePic') => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setEditedProfile(prevProfile => ({
                ...prevProfile,
                [type]: file,
            }));
        }
    };

    

    // Upload Avatar or Profile Picture
    const handleUpload = async (type: 'avatarPic' | 'profilePic') => {
        const file = type === 'avatarPic' ? avatarPic : profilePic;
        const formData = new FormData();
        if (file) {
            formData.append(type, file);
            try {
                const authToken = sessionStorage.getItem('bearerToken');
                if (!authToken) {
                    alert("You're not logged in or the session has expired.");
                    navigate('/login'); // Adjust the path as needed
                    return;
                }
                const response = await fetch(`${apiURL}/matching/profile/${type}`, {
                    method: 'POST', // or 'PUT'
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        // Don't set 'Content-Type': 'application/json' for FormData
                    },
                    body: formData,
                });
                if (response.ok) {
                    alert(`${type} uploaded successfully.`);
                    // Optionally re-fetch profile or URLs to reflect the uploaded image
                } else {
                    alert(`Failed to upload ${type}.`);
                }
            } catch (error) {
                console.error(`Error uploading ${type}:`, error);
            }
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Image Banner */}
            <div className="w-full">
                <AspectRatio ratio={16 / 6}>
                    <img src={dummyCoverPic3} alt="Banner Image" className="object-cover w-full rounded-md" />
                </AspectRatio>
            </div>

            {/* Main Content */}
            <div className="flex w-full gap-14"> {/* Increased gap between columns */}
                {/* Left Column - Tabs and Cards */}
                <div className="flex flex-col w-full max-w-md"> {/* Adjusted width to match right column */}
                    {/* My Navigation */}
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Profile</NavigationMenuTrigger>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Match</NavigationMenuTrigger>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Trips</NavigationMenuTrigger>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    Logout
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuItem onClick={handleDeleteProfile} style={{ color: 'red' }}>Delete Account</NavigationMenuItem>

                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>



                    {/* My Profile Card */}
                    <Tabs defaultValue="basic info" className="w-[400px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="basic info">Basic Info</TabsTrigger>
                            <TabsTrigger value="address and preference">Address and Preference</TabsTrigger>
                        </TabsList>
                        <TabsContent value="basic info">
                            <Card className="flex-1 max-w-md">
                                <CardHeader>
                                    <CardTitle>My Profile</CardTitle>
                                    <CardDescription>Update your profile information below.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4">
                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="fullName">Full Name</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="fullName"
                                                    name="fullName"
                                                    placeholder="Enter your fullName"
                                                    value={editedProfile.fullName}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>{profile.fullName}</span>
                                            )}
                                        </div>
                                        {/* <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="email">Email</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    value={editedProfile.email}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>{profile.email}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="phone number">Phone Number</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    type="phone"
                                                    placeholder="Enter your phone number"
                                                    value={editedProfile.phone}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>{profile.phone}</span>
                                            )}
                                        </div> */}

                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="gender">Gender</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="gender"
                                                    name="gender"
                                                    type="text"
                                                    placeholder="Enter your gender"
                                                    value={editedProfile.gender}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>{profile.gender}</span>
                                            )}
                                        </div>

                                        {/* <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="gender">Gender</Label>
                                            {isEditing ? (
                                                <Select>
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select your gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Gender</SelectLabel>
                                                            <SelectItem value="female">Female</SelectItem>
                                                            <SelectItem value="male">Male</SelectItem>
                                                            <SelectItem value="non-binary">Non-binary</SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <span>{profile.gender}</span>
                                            )}
                                        </div> */}


                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="languages">languages</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="languages"
                                                    name="languages"
                                                    type="text"
                                                    placeholder="Enter your languages"
                                                    value={editedProfile.languages}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>{profile.languages}</span>
                                            )}
                                        </div>



                                        {/* <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="languages">languages</Label>
                                            {isEditing ? (
                                                <Select>
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select your languages" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>languages</SelectLabel>
                                                            <SelectItem value="English">English</SelectItem>
                                                            <SelectItem value="Spanish">Spanish</SelectItem>
                                                            <SelectItem value="Hindi">Hindi</SelectItem>
                                                            <SelectItem value="Mandarin">Mandarin</SelectItem>
                                                            <SelectItem value="Korean">Korean</SelectItem>
                                                            <SelectItem value="Japanese">Japanese</SelectItem>
                                                            <SelectItem value="French">French</SelectItem>
                                                            <SelectItem value="Others">Others</SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <span>{profile.languages}</span>
                                            )}
                                        </div> */}

                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="ethnicity">Ethnicity</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="ethnicity"
                                                    name="ethnicity"
                                                    type="text"
                                                    placeholder="Enter your ethnicity"
                                                    value={editedProfile.ethnicity}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>{profile.ethnicity}</span>
                                            )}
                                        </div>

                                        {/* <div className="flex flex-col space-y-1.5">

                                            <Label htmlFor="ethnicity">Ethnicity</Label>
                                            {isEditing ? (
                                                <Select>
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select your ethnicity" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Ethnicity</SelectLabel>
                                                            <SelectItem value="American Indian or Alaska Native">American Indian or Alaska Native</SelectItem>
                                                            <SelectItem value="Asian">Asian</SelectItem>
                                                            <SelectItem value="Black or African American">Black or African American</SelectItem>
                                                            <SelectItem value="Native Hawaiian or Other Pacific Islander">Native Hawaiian or Other Pacific Islander</SelectItem>
                                                            <SelectItem value="Hispanic or Latino">Hispanic or Latino</SelectItem>
                                                            <SelectItem value="White">White</SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <span>{profile.ethnicity}</span>
                                            )}
                                        </div> */}


                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="bio">Bio (optional)</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="bio"
                                                    name="bio"
                                                    type="text"
                                                    placeholder="Enter your bio"
                                                    value={editedProfile.bio}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>{profile.bio || "Enter your bio"}</span>
                                            )}
                                        </div>

                                        {/* <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="password">Password</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    placeholder="Enter your password"
                                                    value={editedProfile.password}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>******</span>
                                            )}
                                        </div> */}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-4">
                                    {isEditing ? (
                                        <div className="flex justify-end space-x-2">
                                            <Button onClick={handleSave}>Save</Button>
                                            <Button onClick={handleCancel}>Cancel</Button>
                                        </div>
                                    ) : (
                                        <Button className="w-full" onClick={handleEdit}>Update My Basic Info</Button>
                                    )}
                                    {/* <Button className="text-white bg-red-500 border-2 hover:bg-red-600" onClick={handleDeleteAccount}>
                                    Delete Account
                                </Button> */}

                                </CardFooter>
                            </Card>
                        </TabsContent>
                        <TabsContent value="address and preference">
                            <Card className="flex-1 max-w-md">
                                <CardHeader>
                                    <CardTitle>My Address and Preference</CardTitle>
                                    <CardDescription>Update your address and preference below.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4">
                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="current address">Current Address</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="currentAddress"
                                                    name="currentAddress"
                                                    type="text"
                                                    placeholder="Enter your current address"
                                                    value={editedProfile.currentAddress}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>{profile.currentAddress}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="work address">Work/School Address</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="workAddress"
                                                    name="workAddress"
                                                    type="text"
                                                    placeholder="Enter your work address"
                                                    value={editedProfile.workAddress}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>{profile.workAddress}</span>
                                            )}
                                        </div>

                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="hometown">Hometown</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="hometown"
                                                    name="hometown"
                                                    type="text"
                                                    placeholder="Enter your hometown"
                                                    value={editedProfile.hometown}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>{profile.hometown}</span>
                                            )}
                                        </div>

                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="interests">interests/Hobbies</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="interests"
                                                    name="interests"
                                                    type="text"
                                                    placeholder="Enter your interests"
                                                    value={editedProfile.interests}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>{profile.interests}</span>
                                            )}
                                        </div>

                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="preferredCommuteTimes">Preferred Commute Times</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="preferredCommuteTimes"
                                                    name="preferredCommuteTimes"
                                                    type="time"
                                                    placeholder="HH:MM"
                                                    value={editedProfile.preferredCommuteTimes}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>{profile.preferredCommuteTimes}</span>
                                            )}
                                        </div>
                                        {/* <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="emerName">Emergency Contact Name</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="emerName"
                                                    name="emerName"
                                                    type="text"
                                                    placeholder="Enter your emergency contact name"
                                                    value={editedProfile.emerName}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>{profile.emerName}</span>
                                            )}
                                        </div> */}
                                        {/* <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="emerPhone">Emergency Contact Phone Number</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="emerPhone"
                                                    name="emerPhone"
                                                    type="emerPhone"
                                                    placeholder="Enter your emergency contact phone"
                                                    value={editedProfile.emerPhone}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <span>{profile.emerPhone}</span>
                                            )}
                                        </div> */}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-4">
                                    {isEditing ? (
                                        <div className="flex justify-end space-x-2">
                                            <Button onClick={handleSave}>Save</Button>
                                            <Button onClick={handleCancel}>Cancel</Button>
                                        </div>
                                    ) : (
                                        <Button className="w-full" onClick={handleEdit}>Update My Address and Preference</Button>
                                    )}

                                </CardFooter>
                            </Card>

                        </TabsContent>
                    </Tabs>
                </div>


                {/* Right Column - Profile Picture, Avatar, and Carousel */}
                <div className="flex flex-col items-center gap-6">
                    {/* Profile Picture and Avatar with Update Buttons */}
                    <div className="flex justify-center gap-8"> {/* Outer container for alignment and spacing */}
                        {/* Profile Picture */}
                        <div className="flex flex-col items-center justify-center gap-2"> {/* Container for profile picture and button */}
                        <AspectRatio ratio={1 / 1} style={{ width: '140px' }}>
                            <img src={profilePicPreview || dummyProfilePic1} alt="Profile Picture" className="object-cover w-full rounded-md" />
                        </AspectRatio>
                            {/* <Button>Update Profile Picture</Button> */}
                            <Dialog>
                                <Button><DialogTrigger>Update Profile Picture</DialogTrigger></Button>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Upload New Profile Picture</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleProfilePicUpload}>
                                        {/* <Input type="file" onChange={handleFileChange} accept="image/*" /> */}
                                        <Input type="file" onChange={e => handleFileChange(e, 'profilePic')} accept="image/*" />
                                        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                                            <Button type="submit">Upload</Button>
                                        </div>

                                    </form>
                                </DialogContent>
                            </Dialog>

                        </div>
                        <div className="flex flex-col items-center justify-center gap-2"> {/* Container for profile picture and button */}
                        <AspectRatio ratio={1 / 1} style={{ width: '140px' }}>
                            <img src={avatarPreview || dummyavatar1} alt="Avatar Picture" className="object-cover w-full rounded-md" />
                        </AspectRatio>
                            {/* <Button>Update Avatar Picture</Button> */}
                            <Dialog>
                                <Button><DialogTrigger>Update Avatar Picture</DialogTrigger></Button>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Upload New Avatar Picture</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleavatarUpload}>
                                        {/* <Input type="file" onChange={handleFileChange} accept="image/*" /> */}
                                        <Input type="file" onChange={e => handleFileChange(e, 'avatar')} accept="image/*" />
                                        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                                            <Button type="submit">Upload</Button>
                                        </div>

                                    </form>
                                </DialogContent>
                            </Dialog>

                        </div>
                    </div>


                    {/* Carousel */}
                    <div className="w-full">
                        <Carousel className="flex-1 max-w-md">
                            <CarouselContent>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <CarouselItem key={index}>
                                        <div className="p-1">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>My Media Files</CardTitle>
                                                    {/* <CardDescription>View and manage your media files here.</CardDescription> */}
                                                </CardHeader>
                                                <CardContent className="flex items-center justify-center p-6 aspect-square">
                                                    <span className="text-4xl font-semibold">{index + 1}</span>
                                                </CardContent>
                                                <CardFooter className="flex flex-col gap-4">
                                                    {isEditingMedia ? (
                                                        <div className="flex justify-end space-x-2">
                                                            <Button onClick={handleSave}>Save</Button>
                                                            <Button onClick={handleCancel}>Cancel</Button>
                                                        </div>
                                                    ) : (
                                                        // <Button className="w-full" onClick={handleEdit}>Update My Media File</Button>
                                                        <Dialog>
                                                            <Button><DialogTrigger>Update My Media File</DialogTrigger></Button>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Update New Media File</DialogTitle>
                                                                </DialogHeader>
                                                                <form onSubmit={handleMediaFileUpload}>
                                                                    {/* <Input type="file" onChange={handleFileChange} accept="image/*" /> */}
                                                                    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                                                                        <Button type="submit">Upload</Button>
                                                                    </div>

                                                                </form>
                                                            </DialogContent>
                                                        </Dialog>

                                                    )}

                                                </CardFooter>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                </div>
            </div>
        </div>
    );
}
}
export default ProfileCard;