// FeedPage.js
import React from "react";
import MatchesList from "../components/ui/MatchesList";
import MatchUserList from "../components/ui/MatchUserList";

const FeedPage: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row md:justify-around p-5 gap-5">
      <div className="feed-column md:w-1/2">
        <h2 className="text-xl font-semibold mb-4">Your Matches</h2>
        <MatchesList />
      </div>
      <div className="feed-column md:w-1/2">
        <h2 className="text-xl font-semibold mb-4">Match New Users</h2>
        <MatchUserList />
      </div>
    </div>
  );
};

export default FeedPage;
