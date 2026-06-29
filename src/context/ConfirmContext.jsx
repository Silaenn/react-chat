import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./ConfirmModal.css";

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const [closing, setClosing] = useState(false);
  const closingTimer = useRef(null);

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setState({ message, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state?.resolve(true);
    close();
  };

  const handleCancel = () => {
    state?.resolve(false);
    close();
  };

  const close = () => {
    setClosing(true);
  };

  const cleanup = useCallback(() => {
    if (closingTimer.current) clearTimeout(closingTimer.current);
    setState(null);
    setClosing(false);
  }, []);

  useEffect(() => {
    if (!closing) return;
    closingTimer.current = setTimeout(cleanup, 300);
    return () => { if (closingTimer.current) clearTimeout(closingTimer.current); };
  }, [closing, cleanup]);

  const handleAnimationEnd = (e) => {
    if (e.target.classList.contains('confirm-overlay') && closing) {
      cleanup();
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && createPortal(
        <div className={`confirm-overlay ${closing ? "closing" : ""}`} onClick={handleCancel} onAnimationEnd={handleAnimationEnd}>
          <div className={`confirm-modal ${closing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
            <p className="confirm-message">{state.message}</p>
            <div className="confirm-actions">
              <button className="confirm-btn cancel" onClick={handleCancel}>Cancel</button>
              <button className="confirm-btn ok" onClick={handleConfirm}>OK</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
};
