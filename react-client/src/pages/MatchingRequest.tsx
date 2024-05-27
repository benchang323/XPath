// incomingMatching.tsx 
import React, { useState, useEffect } from 'react';
import Sidebar from '@/handlers/sidebar';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, CardBody, CardFooter, Divider, Image } from '@nextui-org/react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserEmailRedux } from '../redux/userActions.ts';
import { CircularProgress } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { Link, Badge } from "@nextui-org/react";
import dummy_avatar from '../assets/pictures/dummy_avatar_pic_1.png';

interface RootState {
    user: UserState; // Assuming UserState is the type of your 'user' slice
}

interface UserState {
    // Define the properties of the 'user' slice
    userEmail: string;
}

const placeholderCards = [
    {
        id: 1,
        name: 'Jane Doe',
        location: 'Baltimore, Maryland',
        bio: 'Bio or other details can go here.',
        imageUrl: 'https://source.unsplash.com/random/300x300?face'
    },
    {
        id: 2,
        name: 'John Smith',
        location: 'New York, NY',
        bio: 'Another bio or details here.',
        imageUrl: 'https://source.unsplash.com/random/301x300?face'
    },
    {
        id: 3,
        name: 'Jack B',
        location: 'Baltimore, Maryland',
        bio: 'Bio or other details can go here.',
        imageUrl: 'https://source.unsplash.com/random/302x300?face'
    },
    {
        id: 4,
        name: 'Adam Stree',
        location: 'Baltimore, Maryland',
        bio: 'Bio or other details can go here.',
        imageUrl: 'https://source.unsplash.com/random/303x300?face'
    },
    {
        id: 5,
        name: 'Jose Doe',
        location: 'Baltimore, Maryland',
        bio: 'Bio or other details can go here.',
        imageUrl: 'https://source.unsplash.com/random/304x300?face'
    },
    {
        id: 6,
        name: 'Ashley Doe',
        location: 'Baltimore, Maryland',
        bio: 'Bio or other details can go here.',
        imageUrl: 'https://source.unsplash.com/random/305x300?face'
    },
    {
        id: 7,
        name: 'Cary Doe',
        location: 'Baltimore, Maryland',
        bio: 'Bio or other details can go here.',
        imageUrl: 'https://source.unsplash.com/random/306x300?face'
    },
    {
        id: 8,
        name: 'David Doe',
        location: 'Baltimore, Maryland',
        bio: 'Bio or other details can go here.',
        imageUrl: 'https://source.unsplash.com/random/307x300?face'
    },
    {
        id: 9,
        name: 'Zack X',
        location: 'Baltimore, Maryland',
        bio: 'Bio or other details can go here.',
        imageUrl: 'https://source.unsplash.com/random/307x300?face'
    },
];

const IncomingMatch: React.FC = () => {
    const bearerToken = sessionStorage.getItem("bearerToken");
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const { userEmail } = user; // Access the userEmail from the Redux state
    const [username, setUsername] = useState<string>("");
    const [profile, setProfile] = useState<any[]>([]);
    const [userId, setUserId] = useState<string>("");
    const [incomingMatch, setIncomingMatch] = useState<any[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [successMessage, setSuccessMessage] = useState("");
    const successMessageDuration = 3000; // 3 seconds

    const [currentProfile, setCurrentProfile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [currentPage, setCurrentPage] = useState(0);

    const profilesPerPage = 4;
    // const totalPages = Math.ceil(incomingMatch.length / profilesPerPage);
    // const totalPages = incomingMatch ? Math.ceil(incomingMatch.length / profilesPerPage) : 0;
    const totalPages = incomingMatch && incomingMatch.length > 0 ? Math.ceil(incomingMatch.length / profilesPerPage) : 1;


    const startIndex = currentPage * profilesPerPage;
    const endIndex = startIndex + profilesPerPage;
    // const visibleProfiles = incomingMatch.slice(startIndex, endIndex);
    const visibleProfiles = incomingMatch ? incomingMatch.slice(startIndex, endIndex) : [];

    const handleCardClick = (card) => {
        setCurrentProfile(card);
        setIsModalOpen(true);
    };

    // Fetch profiles for existing matches
    useEffect(() => {
        fetchIncomingMatchingProfiles();
    }, []);

    const fetchIncomingMatchingProfiles = async () => {
        try {
            const response = await fetch(`${API_URL}/matching/profile/requests`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${bearerToken}`, // Add the bearer token for authentication
                },
            });
            if (response.ok) {
                const data = await response.json();
                // setRecommendations(data);
                // setIncomingMatch(data.matches);
                setIncomingMatch(data);

                // console.log("incoming matches", incomingMatch);
            } else {
                console.error('Failed to fetch profiles for matching');
            }
        } catch (error) {
            console.error('Error fetching profiles for matching:', error);
        }
    };

    // Logic to populate user's info and sign out
    useEffect(() => {
        // Fetch user's username when component mounts
        fetchUsername();
    }, []);

    const fetchUsername = async () => {
        try {
            const userResponse = await fetch(`${API_URL}/matching/profile`, {
                method: 'GET',
                headers: {
                    // Include bearer token in the request headers
                    Authorization: `Bearer ${bearerToken}`,
                },
            });
            if (userResponse.ok) {
                const data = await userResponse.json();
                setUsername(data.profile.full_name); // Assuming the full name is the username
                setProfile(data.profile);
                setUserId(data.profile.user);

                // console.log(data.profile.full_name);
                // console.log(data.profile.user);
            } else {
                console.error('Failed to fetch username:', userResponse.statusText);
            }
        } catch (error) {
            console.error('Error fetching username:', error);
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

    const handleAddMatch = async () => {
        try {
            // const fromUserId = userId;
            // const currentCard = incomingMatch[currentCardIndex]?.profile;
            const toUserId = currentProfile.profile.user;

            // console.log("from_id", fromUserId);
            // console.log("to_profile", currentProfile);
            // console.log("to_id", toUserId);

            // Send a POST request to add the match
            const response = await fetch(`${API_URL}/matching/profile/matches`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to_user_id: toUserId,
                }),
            });

            if (response.ok) {
                // console.log('Profile added successfully');
                setSuccessMessage("Match added successfully");
                // setIsModalOpen(false);
                // Trigger a re-render of the page (if necessary)
                // You might need to update the state to reflect changes in the incoming matches
                fetchIncomingMatchingProfiles();

                // Clear the success message after a certain duration
                setTimeout(() => {
                    setSuccessMessage("");
                    setIsModalOpen(false);
                }, successMessageDuration);
            } else {
                console.error('Failed to add match');
            }
        } catch (error) {
            console.error('Error adding match:', error);
        }
    };

    const handleIgnoreMatch = async () => {
        try {
            const toUserId = currentProfile.profile.user;

            // console.log("from_id", fromUserId);
            // console.log("to_profile", currentProfile);
            // console.log("to_id", toUserId);

            // Send a POST request to add the match
            const response = await fetch(`${API_URL}/matching/profile/requests`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to_user_id: toUserId,
                }),
            });

            if (response.ok) {
                // console.log('Profile ignored successfully');
                setSuccessMessage("Match ignored successfully");

                // Trigger a re-render of the page (if necessary)
                // You might need to update the state to reflect changes in the incoming matches
                fetchIncomingMatchingProfiles();

                // Clear the success message after a certain duration
                setTimeout(() => {
                    setSuccessMessage("");
                    setIsModalOpen(false);
                }, successMessageDuration);
            } else {
                console.error('Failed to ignore match');
            }
        } catch (error) {
            console.error('Error ignoring match:', error);
        }
    };

    const handleRejectMatch = async () => {
        try {
            const toUserId = currentProfile.profile.user;

            // console.log("from_id", fromUserId);
            // console.log("to_profile", currentProfile);
            // console.log("to_id", toUserId);

            // Send a DELETE request to add the match
            const response = await fetch(`${API_URL}/matching/profile/matches`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${bearerToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to_user_id: toUserId,
                }),
            });

            if (response.ok) {
                // console.log('Profile rejected successfully');
                setSuccessMessage("Match rejected successfully");
                // setIsModalOpen(false);
                // Trigger a re-render of the page (if necessary)
                // You might need to update the state to reflect changes in the incoming matches
                fetchIncomingMatchingProfiles();

                // Clear the success message after a certain duration
                setTimeout(() => {
                    setSuccessMessage("");
                    setIsModalOpen(false);
                }, successMessageDuration);
            } else {
                console.error('Failed to add match');
            }
        } catch (error) {
            console.error('Error adding match:', error);
        }
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
    };

    return (
        <div className="flex flex-col min-h-screen text-white bg-zinc-900">
            {/* Header */}
            <div className="flex items-center justify-between py-4 bg-black px-7">
                <a href="/" className="text-xl font-bold">xPath</a>
                <div>
                    <Button onPress={handleSignOut} color="white" size="small" variant="ghost">Sign Out</Button>
                </div>
            </div>

            {/* Main content area */}
            <div className="flex flex-grow">
                {/* Sidebar */}
                <Sidebar />

                {/* Content area */}
                <div className="flex flex-col flex-1">
                    {/* Cards container */}

                    <div className="grid grid-cols-2 gap-4 p-4 overflow-auto md:grid-cols-4" style={{ maxHeight: 'calc(100vh - 64px)' }}>
                        {/* Check if there are incoming match profiles */}
                        {incomingMatch && incomingMatch.length > 0 ? (
                            visibleProfiles.map(card => (
                                <Card key={card.profile.id} className="m-4" style={{ width: '100%', maxWidth: '300px', height: '400px' }}>
                                    <CardHeader className="flex-col items-start px-4 pt-2 pb-0">
                                        <Link onClick={() => handleCardClick(card)} className="font-bold text-large">{card.profile.full_name}</Link>
                                        <small className="text-default-500">{card.profile.city}</small>
                                    </CardHeader>
                                    <CardBody className="relative py-2 overflow-visible">
                                        <Image
                                            alt="Card background"
                                            className="object-cover rounded-xl"
                                            src={card.avatar}
                                            width={270}
                                            onClick={() => handleCardClick(card)}
                                        />
                                        {/* Buttons would be here if needed */}
                                    </CardBody>

                                    {/* Modal */}
                                    <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
                                        <ModalContent>
                                            {(onClose) => (
                                                <>
                                                    <ModalHeader className="flex flex-col gap-1">{currentProfile?.profile.full_name}</ModalHeader>
                                                    <ModalBody>
                                                        <Image
                                                            alt="Card background"
                                                            className="object-cover rounded-xl"
                                                            src={currentProfile?.avatar || dummy_avatar}
                                                            width={270}
                                                        />
                                                        <p>Country: {currentProfile?.profile.country}</p>
                                                        <p>City: {currentProfile?.profile.city}</p>
                                                        <p>Occupation: {currentProfile?.profile.occupation}</p>
                                                        <p>Gender: {currentProfile?.profile.gender}</p>
                                                    </ModalBody>
                                                    <ModalFooter>
                                                        <div className="flex flex-col items-center">
                                                            <div className="flex space-x-2">
                                                                <Button onClick={() => handleAddMatch(currentProfile)} className="text-white shadow-lg bg-gradient-to-tr from-pink-500 to-yellow-500">Accept</Button>
                                                                <Button onClick={() => handleIgnoreMatch(currentProfile)} color="primary">Ignore</Button>
                                                                <Button onClick={() => handleRejectMatch(currentProfile)} color="secondary">Reject</Button>
                                                            </div>
                                                            {successMessage && <p className="mt-2 text-green-500">{successMessage}</p>}
                                                        </div>
                                                    </ModalFooter>


                                                </>
                                            )}
                                        </ModalContent>
                                    </Modal>
                                </Card>
                            ))
                        ) : (
                            // This message is displayed when there are no profiles
                            <div className="my-20 text-center">
                                <p>No matching requests.</p>
                            </div>
                        )}
                    </div>

                    {/* Previous and Next buttons */}
                    <div className="flex items-center justify-center mt-4">
                        <Button onClick={handlePrevPage} color="warning" disabled={currentPage === 0}>Previous</Button>
                        <span className="mx-2">{currentPage + 1} / {totalPages}</span>
                        <Button onClick={handleNextPage} color="warning" disabled={currentPage === totalPages - 1}>Next</Button>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="py-4 text-center bg-gray-800">
                © 2024 xPath. All rights reserved.
            </div>
        </div>
    );


}
export default IncomingMatch;
