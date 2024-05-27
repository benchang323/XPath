import React, { useEffect, useState } from "react";

const MatchesList: React.FC = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const bearerToken = sessionStorage.getItem('bearerToken');
  const fetchMatches = async () => {
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
        setMatches(data.matches);
      } else {
        console.error("Failed to fetch matches");
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // return (
  //   <div>
  //     {/* <h2>Your Matches</h2> */}
  //     <ul>
  //       {matches.map((match) => (
  //         <li key={match.profile_id}>
  //           {match.full_name},{match.interests},
  //           {/* <Profile
  //             firstName={match.first_name}
  //             lastName={match.last_name}
  //             //   profilePic={match.profile_pic}
  //             interests={match.interests}
  //           /> */}
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );
// };

  return (
    <div>
      <ul className="space-y-4">
        {matches.map((match) => (
          <li key={match.profile_id} className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">{match.full_name}</h3>
            <p>Interests: {match.interests.join(", ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MatchesList;
