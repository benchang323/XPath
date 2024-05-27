// src/components/ProfileForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
interface ProfileState {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  avatar: File | null;
  profilePhoto: File | null;
  languages: string;
  ethnicity: string;
  bio: string;
  currentAddress: string;
  workSchoolAddress: string;
  hometown: string;
  interestsHobbies: string;
  preferredCommuteTimes: string;
  emergencyContactInfo: string;
}
import { apiURL } from '../config';

const ProfileForm: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileState>({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    avatar: null,
    profilePhoto: null,
    languages: '',
    ethnicity: '',
    bio: '',
    currentAddress: '',
    workSchoolAddress: '',
    hometown: '',
    interestsHobbies: '',
    preferredCommuteTimes: '',
    emergencyContactInfo: '',
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    setProfile({ ...profile, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files) {
      setProfile({ ...profile, [name]: files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    console.log("Form submitted with: ", profile);
    try {
    let token = sessionStorage.getItem('bearerToken')
    const response = await fetch(`${apiURL}/matching/profile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          fullName: profile.fullName,
          gender: profile.gender,
          avatar: profile.avatar,
          profilePic: profile.profilePhoto,
          languages: profile.languages,
          ethnicity: profile.ethnicity,
          bio: profile.bio,
          currentAddress: profile.currentAddress,
          workAddress: profile.workSchoolAddress,
          hometown: profile.hometown,
          interests: profile.interestsHobbies,
          preferredCommuteTimes: profile.preferredCommuteTimes,
          emergencyContactInfo: '',
          

         }),
    });
    if (response) {
      console.log("success!")
      navigate('/profile-creation')
    }

    // Handle the response...
} catch (error) {
    // Handle errors...
}
  };

  const handleDeleteProfile = () => {
    console.log('Profile deletion requested');
    // Add deletion logic here...
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg">
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="fullName" className="mb-2 font-semibold">Full Name</label>
            <input type="text" name="fullName" placeholder="John Doe" value={profile.fullName} onChange={handleInputChange} className="input" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-2 font-semibold">Email Address</label>
            <input type="email" name="email" placeholder="john.doe@example.com" value={profile.email} onChange={handleInputChange} className="input" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="phoneNumber" className="mb-2 font-semibold">Phone Number</label>
            <input type="tel" name="phoneNumber" placeholder="+1234567890" value={profile.phoneNumber} onChange={handleInputChange} className="input" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="gender" className="mb-2 font-semibold">Gender</label>
            <select name="gender" value={profile.gender} onChange={handleInputChange} className="select">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold">Avatar</label>
            <input type="file" name="avatar" onChange={handleFileChange} className="file-input" />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold">Profile Photo</label>
            <input type="file" name="profilePhoto" onChange={handleFileChange} className="file-input" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="languages" className="mb-2 font-semibold">Languages</label>
            <input type="text" name="languages" placeholder="English, Spanish" value={profile.languages} onChange={handleInputChange} className="input" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="ethnicity" className="mb-2 font-semibold">Ethnicity</label>
            <input type="text" name="ethnicity" placeholder="Ethnicity" value={profile.ethnicity} onChange={handleInputChange} className="input" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="bio" className="mb-2 font-semibold">Bio</label>
            <textarea name="bio" placeholder="A bit about yourself..." value={profile.bio} onChange={handleInputChange} rows={4} className="textarea"></textarea>
          </div>
          <div className="flex flex-col">
            <label htmlFor="currentAddress" className="mb-2 font-semibold">Current Address</label>
            <input type="text" name="currentAddress" placeholder="123 Main St" value={profile.currentAddress} onChange={handleInputChange} className="input" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="workSchoolAddress" className="mb-2 font-semibold">Work/School Address</label>
            <input type="text" name="workSchoolAddress" placeholder="456 Secondary St" value={profile.workSchoolAddress} onChange={handleInputChange} className="input" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="hometown" className="mb-2 font-semibold">Hometown</label>
            <input type="text" name="hometown" placeholder="Hometown" value={profile.hometown} onChange={handleInputChange} className="input" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="interestsHobbies" className="mb-2 font-semibold">Interests/Hobbies</label>
            <input type="text" name="interestsHobbies" placeholder="Reading, Hiking" value={profile.interestsHobbies} onChange={handleInputChange} className="input" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="preferredCommuteTimes" className="mb-2 font-semibold">Preferred Commute Times</label>
            <input type="text" name="preferredCommuteTimes" placeholder="8am - 9am" value={profile.preferredCommuteTimes} onChange={handleInputChange} className="input" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="emergencyContactInfo" className="mb-2 font-semibold">Emergency Contact Information</label>
            <input type="text" name="emergencyContactInfo" placeholder="Jane Doe: +123456789" value={profile.emergencyContactInfo} onChange={handleInputChange} className="input" />
          </div>
          <div className="flex justify-between mt-8 space-x-4">
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white transition duration-150 ease-in-out bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
            >
              Update Profile
            </button>
            <button
              type="button"
              onClick={handleDeleteProfile}
              className="px-4 py-2 font-bold text-white transition duration-150 ease-in-out bg-red-500 rounded hover:bg-red-700 focus:outline-none focus:shadow-outline"
            >
              Delete Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
