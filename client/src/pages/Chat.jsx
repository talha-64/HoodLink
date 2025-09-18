/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import ChatList from "@/components/chat/ChatList";
import ChatBox from "@/components/chat/ChatBox";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { jwtDecode } from "jwt-decode";
import { X } from "lucide-react";

function Chat() {
  const { token, logout } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [conversationsList, setConversationsList] = useState([]);
  const [activeConvId, setActiveConvId] = useState();
  const [activeChatDetails, setActiveChatDetails] = useState({
    id: "",
    userId: "",
    name: "",
    pic: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Decode userId from token
  const getUserIdFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.id || decoded.user_id;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  const userId = getUserIdFromToken(token);

  const getConversationsList = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/chat/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setConversationsList(res.data.conversations);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = "/";
      } else {
        if (err.response && err.response.data) {
          setError(err.response.data.error || err.response.data.message);
          toast({
            variant: "destructive",
            title: err.response.data.error || err.response.data.message,
            action: <ToastAction altText="Try again">Try again</ToastAction>,
            duration: 3000,
          });
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
    }
  };

  useEffect(() => {
    getConversationsList();
  }, [token]);

  // Filter conversations by search term
  const filteredConversations = conversationsList.filter((conversation) => {
    const otherUserName =
      conversation.user1_id === userId
        ? conversation.user2_name
        : conversation.user1_name;

    return otherUserName
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim());
  });

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Mobile: Full screen layout */}
      <div className="md:hidden w-full h-[93vh] bg-gray-800">
        {!activeConvId ? (
          // Show only conversation list
          <div className="w-full flex flex-col h-full">
            {/* Sidebar */}
            <div className="flex items-center p-4 border-b border-gray-700">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={() => setSearchTerm("")}>
                <X className="ml-2" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => {
                  const otherUserId =
                    conversation.user1_id === userId
                      ? conversation.user2_id
                      : conversation.user1_id;

                  const otherUserName =
                    conversation.user1_id === userId
                      ? conversation.user2_name
                      : conversation.user1_name;

                  const otherUserPic =
                    conversation.user1_id === userId
                      ? conversation.u2_pic
                      : conversation.u1_pic;

                  return (
                    <ChatList
                      key={conversation.id}
                      conversation={conversation}
                      onSelect={() => {
                        setActiveConvId(conversation.id);
                        setActiveChatDetails({
                          id: conversation.id,
                          userId: otherUserId,
                          name: otherUserName,
                          pic: otherUserPic
                            ? `${import.meta.env.VITE_API_URL}${otherUserPic}`
                            : "",
                        });
                      }}
                      isActive={conversation.id === activeConvId}
                    />
                  );
                })
              ) : (
                <p className="p-4 text-gray-400">
                  {searchTerm
                    ? "No conversations match your search"
                    : "No conversations available"}
                </p>
              )}
            </div>
          </div>
        ) : (
          // Show only ChatBox with back functionality
          <ChatBox
            details={activeChatDetails}
            onMessageSent={() => getConversationsList()}
            onBack={() => setActiveConvId(null)}
          />
        )}
      </div>

      {/* Desktop: Original layout with container */}
      <div className="hidden md:flex justify-center">
        <div className="w-full max-w-6xl flex h-[90vh] rounded-2xl border border-gray-700 bg-gray-800 overflow-hidden mt-6">
          {/* Mobile: show conversations OR chat */}
          <div className="flex w-full md:hidden">
            {!activeConvId ? (
              // Show only conversation list
              <div className="w-full flex flex-col">
                {/* Sidebar */}
                <div className="flex items-center p-4 border-b border-gray-700">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={() => setSearchTerm("")}>
                    <X className="ml-2" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => {
                      const otherUserId =
                        conversation.user1_id === userId
                          ? conversation.user2_id
                          : conversation.user1_id;

                      const otherUserName =
                        conversation.user1_id === userId
                          ? conversation.user2_name
                          : conversation.user1_name;

                      const otherUserPic =
                        conversation.user1_id === userId
                          ? conversation.u2_pic
                          : conversation.u1_pic;

                      return (
                        <ChatList
                          key={conversation.id}
                          conversation={conversation}
                          onSelect={() => {
                            setActiveConvId(conversation.id);
                            setActiveChatDetails({
                              id: conversation.id,
                              userId: otherUserId,
                              name: otherUserName,
                              pic: otherUserPic
                                ? `${
                                    import.meta.env.VITE_API_URL
                                  }${otherUserPic}`
                                : "",
                            });
                          }}
                          isActive={conversation.id === activeConvId}
                        />
                      );
                    })
                  ) : (
                    <p className="p-4 text-gray-400">
                      {searchTerm
                        ? "No conversations match your search"
                        : "No conversations available"}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              // Show only ChatBox with back functionality
              <ChatBox
                details={activeChatDetails}
                onMessageSent={() => getConversationsList()}
                onBack={() => setActiveConvId(null)}
              />
            )}
          </div>

          {/* Desktop: show both sidebar and chat */}
          <div className="hidden md:flex w-full">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-700 flex flex-col">
              <div className="flex items-center p-4 border-b border-gray-700">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={() => setSearchTerm("")}>
                  <X className="ml-2" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => {
                    const otherUserId =
                      conversation.user1_id === userId
                        ? conversation.user2_id
                        : conversation.user1_id;

                    const otherUserName =
                      conversation.user1_id === userId
                        ? conversation.user2_name
                        : conversation.user1_name;

                    const otherUserPic =
                      conversation.user1_id === userId
                        ? conversation.u2_pic
                        : conversation.u1_pic;

                    return (
                      <ChatList
                        key={conversation.id}
                        conversation={conversation}
                        onSelect={() => {
                          setActiveConvId(conversation.id);
                          setActiveChatDetails({
                            id: conversation.id,
                            userId: otherUserId,
                            name: otherUserName,
                            pic: otherUserPic
                              ? `${import.meta.env.VITE_API_URL}${otherUserPic}`
                              : "",
                          });
                        }}
                        isActive={conversation.id === activeConvId}
                      />
                    );
                  })
                ) : (
                  <p className="p-4 text-gray-400">
                    {searchTerm
                      ? "No conversations match your search"
                      : "No conversations available"}
                  </p>
                )}
              </div>
            </div>

            {/* Chat Section */}
            <div className="flex-1 flex flex-col">
              {activeConvId ? (
                <ChatBox
                  details={activeChatDetails}
                  onMessageSent={() => getConversationsList()}
                />
              ) : (
                <div className="flex flex-1 items-center justify-center text-gray-400">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useAuth } from "@/context/AuthContext";
// import ChatList from "@/components/chat/ChatList";
// import ChatBox from "@/components/chat/ChatBox";
// import { useToast } from "@/hooks/use-toast";
// import { ToastAction } from "@/components/ui/toast";
// import { jwtDecode } from "jwt-decode";
// import { X } from "lucide-react";

// function Chat() {
//   const { token, logout } = useAuth();
//   const { toast } = useToast();
//   const [error, setError] = useState("");
//   const [conversationsList, setConversationsList] = useState([]);
//   const [activeConvId, setActiveConvId] = useState();
//   const [activeChatDetails, setActiveChatDetails] = useState({
//     id: "",
//     userId: "",
//     name: "",
//     pic: "",
//   });
//   const [searchTerm, setSearchTerm] = useState("");

//   // Decode userId from token
//   const getUserIdFromToken = (token) => {
//     try {
//       const decoded = jwtDecode(token);
//       return decoded.id || decoded.user_id;
//     } catch (error) {
//       console.error("Failed to decode token:", error);
//       return null;
//     }
//   };

//   const userId = getUserIdFromToken(token);

//   const getConversationsList = async () => {
//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_API_URL}/api/chat/conversations`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setConversationsList(res.data.conversations);
//     } catch (err) {
//       if (err.response?.status === 401) {
//         logout();
//       } else {
//         if (err.response && err.response.data) {
//           setError(err.response.data.error || err.response.data.message);
//           toast({
//             variant: "destructive",
//             title: err.response.data.error || err.response.data.message,
//             action: <ToastAction altText="Try again">Try again</ToastAction>,
//             duration: 3000,
//           });
//         } else {
//           setError("Something went wrong. Please try again.");
//         }
//       }
//     }
//   };

//   useEffect(() => {
//     getConversationsList();
//   }, [token]);

//   // Filter conversations by search term
//   const filteredConversations = conversationsList.filter((conversation) => {
//     const otherUserName =
//       conversation.user1_id === userId
//         ? conversation.user2_name
//         : conversation.user1_name;

//     return otherUserName
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase().trim());
//   });

//   return (
//     // <div className="flex justify-center bg-gray-900 text-white min-h-screen">
//     //   <div className="w-full max-w-6xl flex h-[90vh] rounded-2xl border border-gray-700 bg-gray-800 overflow-hidden mt-6">
//     //     {/* Sidebar - Conversations */}
//     //     <div className="w-80 border-r border-gray-700 flex flex-col">
//     //       <div className="flex items-center p-4 border-b border-gray-700">
//     //         <input
//     //           type="text"
//     //           placeholder="Search conversations..."
//     //           value={searchTerm}
//     //           onChange={(e) => setSearchTerm(e.target.value)}
//     //           className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//     //         />
//     //         <button
//     //           onClick={() => {
//     //             setSearchTerm("");
//     //           }}
//     //         >
//     //           <X className="ml-2" />
//     //         </button>
//     //       </div>
//     //       <div className="flex-1 overflow-y-auto">
//     //         {filteredConversations.length > 0 ? (
//     //           filteredConversations.map((conversation) => {
//     //             // Find the other participant
//     //             const otherUserId =
//     //               conversation.user1_id === userId
//     //                 ? conversation.user2_id
//     //                 : conversation.user1_id;

//     //             const otherUserName =
//     //               conversation.user1_id === userId
//     //                 ? conversation.user2_name
//     //                 : conversation.user1_name;

//     //             const otherUserPic =
//     //               conversation.user1_id === userId
//     //                 ? conversation.u2_pic
//     //                 : conversation.u1_pic;

//     //             return (
//     //               <ChatList
//     //                 key={conversation.id}
//     //                 conversation={conversation}
//     //                 onSelect={() => {
//     //                   setActiveConvId(conversation.id);
//     //                   setActiveChatDetails({
//     //                     id: conversation.id,
//     //                     userId: otherUserId,
//     //                     name: otherUserName,
//     //                     pic: otherUserPic
//     //                       ? `${import.meta.env.VITE_API_URL}${otherUserPic}`
//     //                       : "",
//     //                   });
//     //                 }}
//     //                 isActive={conversation.id === activeConvId}
//     //               />
//     //             );
//     //           })
//     //         ) : (
//     //           <p className="p-4 text-gray-400">
//     //             {searchTerm
//     //               ? "No conversations match your search"
//     //               : "No conversations available"}
//     //           </p>
//     //         )}
//     //       </div>
//     //     </div>

//     //     {/* Chat Section */}
//     //     <div className="flex-1 flex flex-col">
//     //       {activeConvId ? (
//     //         <ChatBox
//     //           details={activeChatDetails}
//     //           onMessageSent={() => getConversationsList()}
//     //         />
//     //       ) : (
//     //         <div className="flex flex-1 items-center justify-center text-gray-400">
//     //           Select a conversation to start chatting
//     //         </div>
//     //       )}
//     //     </div>
//     //   </div>
//     // </div>
//     <div className="flex justify-center bg-gray-900 text-white min-h-screen">
//       <div className="w-full max-w-6xl md:flex h-[90vh] rounded-2xl border border-gray-700 bg-gray-800 overflow-hidden mt-6">
//         {/* Mobile: show conversations OR chat */}
//         <div className="flex w-full md:hidden">
//           {!activeConvId ? (
//             // Show only conversation list
//             <div className="w-full flex flex-col">
//               {/* Sidebar */}
//               <div className="flex items-center p-4 border-b border-gray-700">
//                 <input
//                   type="text"
//                   placeholder="Search conversations..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <button onClick={() => setSearchTerm("")}>
//                   <X className="ml-2" />
//                 </button>
//               </div>
//               <div className="flex-1 overflow-y-auto">
//                 {filteredConversations.length > 0 ? (
//                   filteredConversations.map((conversation) => {
//                     const otherUserId =
//                       conversation.user1_id === userId
//                         ? conversation.user2_id
//                         : conversation.user1_id;

//                     const otherUserName =
//                       conversation.user1_id === userId
//                         ? conversation.user2_name
//                         : conversation.user1_name;

//                     const otherUserPic =
//                       conversation.user1_id === userId
//                         ? conversation.u2_pic
//                         : conversation.u1_pic;

//                     return (
//                       <ChatList
//                         key={conversation.id}
//                         conversation={conversation}
//                         onSelect={() => {
//                           setActiveConvId(conversation.id);
//                           setActiveChatDetails({
//                             id: conversation.id,
//                             userId: otherUserId,
//                             name: otherUserName,
//                             pic: otherUserPic
//                               ? `${import.meta.env.VITE_API_URL}${otherUserPic}`
//                               : "",
//                           });
//                         }}
//                         isActive={conversation.id === activeConvId}
//                       />
//                     );
//                   })
//                 ) : (
//                   <p className="p-4 text-gray-400">
//                     {searchTerm
//                       ? "No conversations match your search"
//                       : "No conversations available"}
//                   </p>
//                 )}
//               </div>
//             </div>
//           ) : (
//             // Show only ChatBox with back functionality
//             <ChatBox
//               details={activeChatDetails}
//               onMessageSent={() => getConversationsList()}
//               onBack={() => setActiveConvId(null)}
//             />
//           )}
//         </div>

//         {/* Desktop: show both sidebar and chat */}
//         <div className="hidden md:flex w-full">
//           {/* Sidebar */}
//           <div className="w-80 border-r border-gray-700 flex flex-col">
//             <div className="flex items-center p-4 border-b border-gray-700">
//               <input
//                 type="text"
//                 placeholder="Search conversations..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <button onClick={() => setSearchTerm("")}>
//                 <X className="ml-2" />
//               </button>
//             </div>
//             <div className="flex-1 overflow-y-auto">
//               {filteredConversations.length > 0 ? (
//                 filteredConversations.map((conversation) => {
//                   const otherUserId =
//                     conversation.user1_id === userId
//                       ? conversation.user2_id
//                       : conversation.user1_id;

//                   const otherUserName =
//                     conversation.user1_id === userId
//                       ? conversation.user2_name
//                       : conversation.user1_name;

//                   const otherUserPic =
//                     conversation.user1_id === userId
//                       ? conversation.u2_pic
//                       : conversation.u1_pic;

//                   return (
//                     <ChatList
//                       key={conversation.id}
//                       conversation={conversation}
//                       onSelect={() => {
//                         setActiveConvId(conversation.id);
//                         setActiveChatDetails({
//                           id: conversation.id,
//                           userId: otherUserId,
//                           name: otherUserName,
//                           pic: otherUserPic
//                             ? `${import.meta.env.VITE_API_URL}${otherUserPic}`
//                             : "",
//                         });
//                       }}
//                       isActive={conversation.id === activeConvId}
//                     />
//                   );
//                 })
//               ) : (
//                 <p className="p-4 text-gray-400">
//                   {searchTerm
//                     ? "No conversations match your search"
//                     : "No conversations available"}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Chat Section */}
//           <div className="flex-1 flex flex-col">
//             {activeConvId ? (
//               <ChatBox
//                 details={activeChatDetails}
//                 onMessageSent={() => getConversationsList()}
//               />
//             ) : (
//               <div className="flex flex-1 items-center justify-center text-gray-400">
//                 Select a conversation to start chatting
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Chat;
