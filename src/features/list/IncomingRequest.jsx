import { getAvatar } from "@/lib/avatar";

const IncomingRequest = ({ chat, isLoading, onAccept, onDecline }) => {
  const { letter, color } = getAvatar(chat.user.username);

  return (
    <div className="item request-item" key={chat.chatId}>
      <div className="avatar-letter" style={{ background: color }}>
        {letter}
      </div>
      <div className="texts">
        <div className="row">
          <span>{chat.user.username}</span>
        </div>
        <p className="empty-msg">Waiting for your response</p>
      </div>
      <div className="request-actions">
        <button
          className="accept-btn"
          onClick={() => onAccept(chat)}
          disabled={isLoading}
          aria-label={`Accept chat request from ${chat.user.username}`}
        >
          {isLoading ? "..." : "Accept"}
        </button>
        <button
          className="decline-btn"
          onClick={() => onDecline(chat)}
          disabled={isLoading}
          aria-label={`Decline chat request from ${chat.user.username}`}
        >
          {isLoading ? "..." : "Decline"}
        </button>
      </div>
    </div>
  );
};

export default IncomingRequest;
