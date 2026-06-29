import { useState } from "react";
import "./Chat.css";
import { useChatStore } from "@/lib/chatStore";
import { useUserStore } from "@/lib/userStore";
import { useChatMessages } from "./useChatMessages";
import { useMessageActions } from "./useMessageActions";
import { useUserOnlineStatus } from "./useUserOnlineStatus";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const Chat = ({ onToggleDetail }) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, chatStatus, requestedBy, setShowList } =
    useChatStore();
  const { currentUser } = useUserStore();

  const { chat } = useChatMessages(chatId, currentUser?.id);
  const { isOnline, lastSeen } = useUserOnlineStatus(user?.id);
  const { handleSend, handleEdit, handleDeleteForEveryone, handleDeleteForMe } = useMessageActions(
    chatId, user, currentUser, isCurrentUserBlocked, isReceiverBlocked, chatStatus, requestedBy
  );

  const isPending = chatStatus === "pending";
  const isPendingForMe = isPending && requestedBy !== currentUser?.id;

  const handleStartEdit = (msg) => {
    setEditingMessage({ id: msg.id, text: msg.text });
    setOpenMenuId(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const handleToggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const messageActions = {
    onDeleteForEveryone: handleDeleteForEveryone,
    onDeleteForMe: handleDeleteForMe,
    onStartEdit: handleStartEdit,
    onToggleMenu: handleToggleMenu,
  };

  if (!chat) {
    return (
      <div className="chat">
        <div className="top">
          <div className="top-left">
            <div className="skeleton-btn" />
          </div>
          <div className="top-center">
            <div className="skeleton-avatar" />
            <div className="texts">
              <div className="skeleton-text skeleton-name" />
              <div className="skeleton-text skeleton-status" />
            </div>
          </div>
          <div className="top-right">
            <div className="skeleton-icon" />
          </div>
        </div>
        <div className="center">
          <div className="loading-chat">
            <div className="loading-spinner" />
            <span>Loading messages...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat">
      <ChatHeader
        user={user}
        status={{ isOnline, lastSeen, isCurrentUserBlocked, chatStatus, requestedBy }}
        currentUserId={currentUser?.id}
        onToggleDetail={onToggleDetail}
        onBack={() => setShowList(true)}
      />

      {isPendingForMe ? (
        <div className="pending-banner">
          <p>This user wants to chat with you. Accept the request to start messaging.</p>
        </div>
      ) : (
        <>
          <MessageList
            chat={chat}
            currentUser={currentUser}
            actions={messageActions}
            openMenuId={openMenuId}
            currentUserId={currentUser?.id}
          />
          <MessageInput
            onSend={handleSend}
            onEdit={handleEdit}
            editingMessage={editingMessage}
            onCancelEdit={handleCancelEdit}
            isReceiverBlocked={isReceiverBlocked}
            onToggleDetail={onToggleDetail}
          />
        </>
      )}
    </div>
  );
};

export default Chat;
