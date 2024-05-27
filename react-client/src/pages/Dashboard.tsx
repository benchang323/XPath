// src/pages/Dashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "../components/navigation-menu";

import { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  ChannelList,
  useChatContext,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';

const NavMenu: React.FC = () => {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

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
          const userToken = config.streamChatToken;
          const userId = config.profileId.toString();
          console.log(userToken)
          apiKey = "rxuvyjpj3ypg"


          const client = StreamChat.getInstance(apiKey);
          await client.connectUser(
              {
                  id: userId,
                  name: config.name, // Adjust according to your user object
                  image: "ABCD", // Adjust according to your user object
              },
              userToken
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
  const navigate = useNavigate();

  const menuContainerStyles = {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    backgroundColor: "black",
    padding: "20px 0",
  };

  const menuItemStyles = {
    color: "white",
    padding: "10px 15px",
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <div style={menuContainerStyles}>
      <NavigationMenu>
        <NavigationMenuList style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <NavigationMenuItem>
            <NavigationMenuLink style={menuItemStyles} onClick={() => navigate("/profile-form")}>
              Profile
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink style={menuItemStyles} onClick={() => navigate("/matching-page")}>
              Match
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink style={menuItemStyles} onClick={() => navigate("/trips")}>
              Trips
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              style={menuItemStyles}
              onClick={() => navigate("/trips-bucket")}
            >
              Bucket List
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink style={menuItemStyles} onClick={() => navigate("/mappage")}>
              Map
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              style={menuItemStyles}
              onClick={() => navigate("/chat")}
            >
              Chat
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink style={menuItemStyles} onClick={() => navigate("/sign-in")}>
              Sign Out
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default NavMenu;
