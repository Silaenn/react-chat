import { useState, useRef, lazy, Suspense, useEffect } from "react";
import EmojiEmotions from "@mui/icons-material/EmojiEmotions";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

const MessageInput = ({ onSend, onEdit, editingMessage, onCancelEdit, isReceiverBlocked, onToggleDetail }) => {
  const [text, setText] = useState("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const inputRef = useRef(null);
  const emojiRef = useRef(null);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpenEmoji(false);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        onEdit(editingMessage.id, text);
        setText("");
        onCancelEdit();
      } else {
        onSend(text, () => setText(""));
      }
    }
    if (e.key === "Escape" && editingMessage) {
      setText("");
      onCancelEdit();
    }
  };

  const handleSendClick = () => {
    if (editingMessage) {
      onEdit(editingMessage.id, text);
      setText("");
      onCancelEdit();
    } else {
      onSend(text, () => setText(""));
    }
  };

  const handleCancelEdit = () => {
    setText("");
    onCancelEdit();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setOpenEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
    }
  }, [editingMessage]);

  const handleEmojiClick = (e) => {
    handleEmoji(e);
  };

  return (
    <>
      {isReceiverBlocked && (
        <div className="blocked-banner" onClick={onToggleDetail}>
          <p>You blocked this contact. Tap to unblock.</p>
        </div>
      )}
      <div className={`bottom ${editingMessage ? "editing" : ""}`}>
        <div className="emoji" ref={emojiRef}>
          <EmojiEmotions
            className="emoji-icon"
            onClick={() => setOpenEmoji((prev) => !prev)}
            aria-label={openEmoji ? "Close emoji picker" : "Open emoji picker"}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenEmoji((prev) => !prev); } }}
          />
          {openEmoji && (
            <div className="picker" onClick={(e) => e.stopPropagation()}>
              <Suspense fallback={null}>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </Suspense>
            </div>
          )}
        </div>
        {editingMessage && (
          <button className="cancel-btn" onClick={handleCancelEdit}>
            ✕
          </button>
        )}
        <textarea
          ref={inputRef}
          placeholder="Type a message..."
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="sendButton"
          onClick={handleSendClick}
          disabled={text === ""}
        >
          {editingMessage ? "Save" : "Send"}
        </button>
      </div>
    </>
  );
};

export default MessageInput;
