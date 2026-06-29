import { useEffect, useRef, useLayoutEffect, useState } from "react";
import MessageItem from "./MessageItem";
import { canModify } from "@/lib/time";

const getDropUpState = (containerRef) => {
  if (!containerRef.current) return {};
  const items = containerRef.current.querySelectorAll('.message');
  const containerBottom = containerRef.current.getBoundingClientRect().bottom;
  const state = {};
  items.forEach((el, i) => {
    if (el.classList.contains('own')) {
      const elTop = el.getBoundingClientRect().top;
      state[i] = (containerBottom - elTop) < 160;
    } else {
      const elBottom = el.getBoundingClientRect().bottom;
      state[i] = (containerBottom - elBottom) < 120;
    }
  });
  return state;
};

const MessageList = ({ chat, currentUser, actions, openMenuId, currentUserId }) => {
  const endRef = useRef(null);
  const centerRef = useRef(null);
  const [menuPositions, setMenuPositions] = useState({});

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    endRef.current?.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
  }, [chat?.messages?.length]);

  useLayoutEffect(() => {
    setMenuPositions(getDropUpState(centerRef));
  }, [chat?.messages?.length]);

  if (!chat) {
    return (
      <div className="center">
        <div className="loading-chat">
          <div className="loading-spinner" />
          <span>Loading messages...</span>
        </div>
      </div>
    );
  }

  const messages = chat?.messages || [];

  return (
    <div className="center" ref={centerRef} onClick={() => actions.onToggleMenu(null)}>
      {messages.length > 0 ? (
        messages
          .filter((m) => !(m.deletedFor || []).includes(currentUser?.id))
          .filter((m) => !(m.blocked && m.senderId !== currentUser?.id))
          .filter((m) => !(m.pending && m.senderId !== currentUser?.id))
          .map((message, index) => {
            const isOwn = message.senderId === currentUser?.id;
            return (
              <MessageItem
                key={message.id || message.createdAt}
                message={message}
                isOwn={isOwn}
                canEditMessage={canModify(message.createdAt)}
                actions={actions}
                isMenuOpen={openMenuId === message.id}
                menuUp={menuPositions[index]}
                currentUserId={currentUserId}
              />
            );
          })
      ) : (
        <div className="empty-center">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="empty-msg">No messages yet. Send your first message!</p>
        </div>
      )}
      <div ref={endRef}></div>
    </div>
  );
};

export default MessageList;
