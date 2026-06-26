import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Notification.css";

const Notification = () => {
  return (
    <div className="notification">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover={false}
        toastClassName="custom-toast"
      />
    </div>
  );
};

export default Notification;
