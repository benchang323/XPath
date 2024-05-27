import React, { useEffect, useState } from "react";

const MatchesUserList: React.FC = () => {
  const [notMatches, setNotMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const bearerToken = sessionStorage.getItem('bearerToken');
  const fetchNotMatches = async () => {
    try {
      const authHeader =
        `Bearer ${bearerToken}`;
      const response = await fetch(
        "${apiURL}/matching/profile/matches",
        {
          method: "GET",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotMatches(data.not_matches);
      } else {
        console.error("Failed to fetch not matches");
      }
    } catch (error) {
      console.error("Error fetching not matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (fromUserId, toUserId) => {
    try {
      const authHeader =
        `Bearer ${bearerToken}`;
      const response = await fetch(
        "${apiURL}/matching/profile/matches",
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from_user_id: fromUserId,
            to_user_id: toUserId,
          }),
        }
      );

      if (response.ok) {
        console.log("Match successful!");
        fetchNotMatches(); // Fetch updated data after match
        window.location.reload();
      } else {
        console.error("Failed to match users");
      }
    } catch (error) {
      console.error("Error matching users:", error);
    }
  };

  const handleReject = async (fromUserId, toUserId) => {
    try {
      const authHeader =
        `Bearer ${bearerToken}`;
      const response = await fetch(
        "${apiURL}/matching/profile/matches",
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from_user_id: fromUserId,
            to_user_id: toUserId,
          }),
        }
      );

      if (response.ok) {
        console.log("Reject successful!");
        fetchNotMatches(); // Fetch updated data after reject
        window.location.reload();
      } else {
        console.error("Failed to reject user");
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
    }
  };

  useEffect(() => {
    fetchNotMatches();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* <h2>Not Your Matches</h2> */}
      <ul>
        {notMatches.map((notMatch) => (
          <li key={notMatch.profile_id}>
            {notMatch.full_name}, {notMatch.interests}
            <button 
              className="inline-block mt-2 mr-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={() => handleMatch(2, notMatch.user_id)}>
              Match
            </button>
            <button 
              className="inline-block mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => handleReject(2, notMatch.user_id)}>
              Reject
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MatchesUserList;
