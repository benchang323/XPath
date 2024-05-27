// NewChatPage.tsx
import React, { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  ChannelList,
  useChatContext,
} from "stream-chat-react";
import { Button } from "@nextui-org/react";
import "stream-chat-react/dist/css/index.css";
import Sidebar from "@/handlers/sidebar";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserEmailRedux } from "../redux/userActions.ts";
import IconFriends from "@/components/FriendIcon.tsx";
import IconFriendsOff from "@/components/NotFriendIcon.tsx";
import ShareIcon from "@/components/ShareIcon.tsx";

let userToken = "";
let userId = "";
type StreamChatType = InstanceType<typeof StreamChat>;
interface SelectedChannelProps {
  chatClient: StreamChatType | null;  // Adjust the type as necessary based on your application
}
const ChatPage: React.FC = () => {
  const bearerToken = sessionStorage.getItem("bearerToken");
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  type StreamChatType = InstanceType<typeof StreamChat>;
  const [chatClient, setChatClient] = useState<StreamChatType | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [friendProfileId, setFriendProfileId] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(null);
  const avatarPicUrl = sessionStorage.getItem("avatarPicUrl");
  const handleSignOut = async () => {
    try {
      const response = await fetch(`${API_URL}/user_account/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include the bearer token if available
          Authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.ok) {
        // Clear session storage
        sessionStorage.removeItem("bearerToken");
        dispatch(setUserEmailRedux("")); // Set user's email to empty string

        // Redirect to home page
        navigate("/");
      } else {
        console.error("Failed to log out:", response.statusText);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getOtherUser = async () => {
    if (!currentChannel) {
      console.error("No channel selected");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/chat/otherUser/${(currentChannel as any).id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
      );

      if (response.ok) {
        const friend = await response.json();
        const friendID = friend.ret;

        setFriendProfileId(friendID); // Set state safely after async call
      } else {
        console.error("Error getting other user:", await response.json());
      }
    } catch (error) {
      console.error("Exception when getting other user:", error);
    }
  };

  const toggleFriendStatus = async () => {
    if (!currentChannel || ((currentChannel as any).cid.includes("chatbot"))) {
      console.error("No channel selected");
      return;
    }
    await getOtherUser();

    const method = isFriend ? "DELETE" : "POST";
    try {
      const response = await fetch(`${API_URL}/share/shareprofile/`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({ friend_profile_id: friendProfileId }),
      });
      if (response.ok) {
        // Toggle the friend status on successful API response
        setIsFriend(!isFriend);
      } else {
        console.error(
          "Failed to toggle friend status: ",
          await response.json(),
        );
      }
    } catch (error) {
      console.error("Error toggling friend status:", error);
    }
  };

  useEffect(() => {
    const initChat = async () => {
      const API_URL = import.meta.env.VITE_API_URL;
      let apiKey = import.meta.env.STREAM_API_KEY;
      const bearerToken = sessionStorage.getItem("bearerToken");
      const response = await fetch(`${API_URL}/chat/user`, {
        method: "GET",
        headers: {
          // Include bearer token in the request headers
          Authorization: `Bearer ${bearerToken}`,
        },
      });
      const config = await response.json();
      apiKey = config.apiKey;
      userToken = config.streamChatToken;
      userId = config.profileId.toString();
      console.log(userToken);
      apiKey = "rxuvyjpj3ypg";

      const client = StreamChat.getInstance(apiKey);
      await client.connectUser(
        {
          id: userId,
          name: config.name, // Adjust according to your user object
          image: avatarPicUrl, // Adjust according to your user object
        },
        userToken,
      );

      setChatClient(client);
    };

    if (!chatClient) {
      initChat();
    }

    return () => {
      if (chatClient) {
        chatClient.disconnectUser().then(() => setChatClient(null));
      }
    };
  }, [chatClient]);
  
  // Print function to interact with OpenAI API
  const print = async (new_message: any, channel: any) => {
    console.log("User message:", new_message);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer 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`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-16k-0613",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant for the application XPATH that helps users plan trips. XPath aims to match users going on the same commute or the same long distance trips, to provide them with companions on their journey. A user starts by choosing his commute and gets options to match with others that are going on the same journey. Users interact with other verified users, have an option to communicate with them on the app or share contacts and always have an option to revoke contact. You have access to the following information about the user you are currently assisting: {data}Use this information to provide personalized trip and travel suggestions tailored to the user's preferences and interests. Ask followup questions as needed to gather more details to inform your recommendations.When the user asks for trip recommendations, carefully analyze their travel history, predicted destinations they may enjoy, and potential travel matches to generate thoughtful, customized suggestions. Consider factors like the user's budget, preferred activities, dietary preferences and restrictions, desired trip length, favored modes of transit, and more.If the user expresses interest in a particular recommendation, offer to help them book and schedule the trip. Collect all the necessary details like dates, transportation, lodging, activities, dining options etc. Confirm each aspect of the itinerary with the user. Once the user approves the final plan, let them know it has been added to their trips page and provide any additional relevant info they may need.When recommending food options, carefully consider the user's preferred cuisines, dietary restrictions, price range, and other factors apparent to your knowledge. Suggest specific restaurants, dishes, food tours, cooking classes, and other culinary experiences that align with their tastes.Throughout the conversation, communicate in a warm, friendly, and helpful manner. Aim to cultivate a sense of excitement for the trip and address any concerns the user raises. By the end of the interaction, the user should feel confident and enthused about their upcoming travel plans."
            },
            {
              role: "user",
              content: new_message
            }
          ],
          max_tokens: 100
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Chatbot response data:", data);
        const chatbotResponse = data.choices[0].message.content.trim();
        // Send the chatbot response back to the user
        await channel.sendMessage({ text: chatbotResponse });
        console.log("Chatbot response is:", chatbotResponse);
      } else {
        throw new Error(`Failed to fetch response: ${data.error.message}`);
      }
    } catch (error) {
      console.error("Exception when sending chatbot response:", error);
    }
  };
  
  const SelectedChannel: React.FC<SelectedChannelProps> = ({ }) => {
    const { channel } = useChatContext();
    useEffect(() => {
      if (channel) {
        setCurrentChannel(channel);
  
        if ((channel as any).cid.includes("chatbot")) {
          const handleNewMessage = async (event: any) => {
            const new_message = event.message.text;
            await print(new_message, channel);
          };
  
          (channel as any).on("message.new", handleNewMessage);
  
          // Clean up the event listener when the component unmounts or the channel changes
          return () => {
            (channel as any).off("message.new", handleNewMessage);
          };
        } else {
          getOtherUser();
        }
      } else {
        console.log("Channel is not available yet.");
      }
    }, [channel]);

    // Fallback content if no channel is selected
    if (!channel)
      return (
        <div className="flex items-center justify-center h-full">
          Select a match to start chatting
        </div>
      );
    // Render the chat window for the selected channel
    return (
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    );
  };

  if (!chatClient) {
    return (
      <div className="flex flex-col min-h-screen text-white bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between py-4 bg-black px-7">
          <a href="/" className="text-xl font-bold">
            xPath
          </a>
          <div>
            <Button
              onPress={handleSignOut}
              color= {"white" as any}
              size={"small" as any}
              variant="ghost"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex flex-grow">
          <Sidebar />
          <div>Loading chat...</div>
        </div>

        {/* Footer */}
        <div className="py-4 text-center bg-gray-800">
          © 2024 xPath. All rights reserved.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-white bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between py-4 bg-black px-7">
        <a href="/" className="text-xl font-bold">
          xPath
        </a>
        <div className="flex gap-4">
          <Button onPress={toggleFriendStatus} color="primary" variant="ghost" >
            {isFriend ? <IconFriends /> : <IconFriendsOff />}
            {isFriend ? "Can Share Profile" : "Can Not Share Profile"}
          </Button>
          <Button onPress={toggleFriendStatus} color="primary" variant="ghost">
            {<ShareIcon />}
          </Button>
          <Button
            onPress={handleSignOut}
            color={"white" as any}
            size={"small" as any}
            variant="ghost"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-grow">
        <div className="flex flex-grow w-60">
          {/* Sidebar Here */}
          <Sidebar />
        </div>
        <div className="flex flex-grow">
          <Chat client={chatClient} theme="messaging dark">
            {/* Channel List Here */}
            <ChannelList
              filters={{ members: { $in: [userId] } }}
              List={(listProps: any) => (
                <div className="flex flex-col h-full gap-4 m-3">
                  <hr className="border-gray-500" />
                  {listProps.children}
                  <hr className="mt-auto border-gray-500" />
                </div>
              )}
            />
            {/* Chat Window Here */}
            <div className="flex-1 flex-grow overflow-hidden">
              <SelectedChannel chatClient={chatClient} />
            </div>
          </Chat>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center bg-gray-800">
        © 2024 xPath. All rights reserved.
      </div>
    </div>
  );
};
export default ChatPage;