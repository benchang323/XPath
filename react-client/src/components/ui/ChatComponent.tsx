import React, { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat, Channel, Window, ChannelHeader, MessageList, MessageInput } from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';

const apiKey: string = 'rxuvyjpj3ypg';
const userToken: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdF91c2VyIn0.O9eYRWNnChFbF8A6r4ZRiswt-ZMp7G4Mwn3wXiPwakI';
const userId: string = 'test_user';

const SimpleChatComponent: React.FC = () => {
    const [chatClient, setChatClient] = useState<StreamChat | null>(null);

    useEffect(() => {
        const initChat = async () => {
            const client = StreamChat.getInstance(apiKey);

            await client.connectUser(
                {
                    id: userId,
                    name: 'Dummy User',
                    image: 'https://placeimg.com/150/150/people'
                },
                userToken
            );

            const channel = client.channel('messaging', 'dummy_channel', {
                name: 'Dummy Channel',
            });

            await channel.watch();

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

    if (!chatClient) return <div>Loading chat...</div>;

    return (
        <Chat client={chatClient} theme="messaging dark">
            <Channel channel={chatClient.channel('messaging', 'dummy_channel')}>
                <Window>
                    <ChannelHeader />
                    <MessageList />
                    <MessageInput />
                </Window>
            </Channel>
        </Chat>
    );
};

export default SimpleChatComponent;
