import { createPortal } from "react-dom";
import "./AddUser.css";
import { useUserSearch } from "./useUserSearch";
import { getAvatar } from "@/lib/avatar";

const AddUser = ({ onClose }) => {
  const {
    users, searching, addedIds, existingIds, username, showResults,
    handleInputChange, handleKeyDown, handleSearchClick, handleAdd,
  } = useUserSearch();

  return createPortal(
    <div className="addUser-overlay" onClick={onClose}>
      <div className="addUser-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <h2 className="modal-title">Add User</h2>
          <p className="modal-subtitle">Search by username to start a new conversation</p>
        </div>
        <div className="addUser-form">
          <input
            type="text"
            placeholder="Enter username..."
            value={username}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearchClick}>Search</button>
        </div>
        {!showResults && !username && (
          <p className="status empty-hint">Type a username above to find users</p>
        )}
        {searching && <p className="status">Searching...</p>}
        {showResults && !searching && users.length === 0 && (
          <p className="status not-found">No users found</p>
        )}
        {users.length > 0 && (
          <div className="addUser-results">
            {users.map((u) => {
              const avatar = getAvatar(u.username);
              const isAdded = addedIds.has(u.id) || existingIds.has(u.id);
              return (
                <div className="addUser-result" key={u.id}>
                  <div className="avatar-letter" style={{ background: avatar.color }}>
                    {avatar.letter}
                  </div>
                  <span className="result-name">{u.username}</span>
                  <button
                    className={`add-btn ${isAdded ? "added" : ""}`}
                    onClick={() => handleAdd(u)}
                    disabled={isAdded}
                  >
                    {isAdded ? "Added" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AddUser;
