import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { CameraAlt, Close, Image, Mic, Stop } from "@mui/icons-material";
import dataURLtoFile from "../../lib/dataUrltoFile";

const Chat = () => {
  const [chat, setChat] = useState();
  const [openEmoji, setOpenEmoji] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [openCamera, setOpenCamera] = useState(false);
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const streamRef = useRef(null);
  const [imageCamera, setImageCamera] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpenEmoji(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "" && !img.file && !imageCamera && !audioBlob) return; // Return if there's no text and no image

    let imgUrl = null;
    let audioUrl = null;

    try {
      // Upload image if present
      if (img.file) {
        imgUrl = await upload(img.file);
      } else if (imageCamera) {
        const file = dataURLtoFile(imageCamera, "camera_photo.jpg");
        imgUrl = await upload(file);
      } else if (audioBlob) {
        audioUrl = await upload(audioBlob);
      }

      // Construct message object
      const message = {
        senderId: currentUser.id,
        createdAt: new Date(),
      };

      // Add text if present
      if (text) {
        message.text = text;
      }

      // Add image URL if present
      if (imgUrl) {
        message.img = imgUrl;
      } else if (imageCamera) {
        message.img = imageCamera;
      } else if (audioUrl) {
        message.audioUrl = audioUrl;
      }

      // Update chat document with new message
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(message),
      });

      // Update user chats with last message and other details
      const userIDs = [currentUser.id, user.id];

      for (const id of userIDs) {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (text) {
            userChatsData.chats[chatIndex].lastMessage = text;
          } else if (imgUrl) {
            userChatsData.chats[chatIndex].lastMessage = "[Image]";
          } else if (imageCamera) {
            userChatsData.chats[chatIndex].lastMessage = "[Image]";
          } else if (audioBlob) {
            userChatsData.chats[chatIndex].lastMessage = "[audio]";
          }
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }

    // Reset state
    setImg({
      file: null,
      url: "",
    });

    setImageCamera(null);
    setAudioBlob(null);
    setText("");
  };

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  useEffect(() => {
    if (openCamera) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
        .then((stream) => {
          streamRef.current = stream;
          let video = videoRef.current;
          video.srcObject = stream;
          video.play();

          // Menggunakan ImageCapture untuk pengaturan tambahan
          const track = stream.getVideoTracks()[0];
          const imageCapture = new ImageCapture(track);

          imageCapture.getPhotoCapabilities().then((capabilities) => {
            console.log(capabilities);

            // Contoh menyesuaikan exposure
            if (capabilities.exposureMode.includes("manual")) {
              track.applyConstraints({
                advanced: [{ exposureMode: "manual", exposureTime: 5000 }],
              });
            }
          });
        })
        .catch((err) => {
          console.error("error:", err);
        });
    } else if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [openCamera]);

  const takePhoto = () => {
    setTimeout(() => {
      const width = 400;
      const height = width / (16 / 9);
      let video = videoRef.current;
      let photo = photoRef.current;

      photo.width = width;
      photo.height = height;

      let ctx = photo.getContext("2d");
      ctx.drawImage(video, 0, 0, width, height);
      const imageData = photo.toDataURL("image/jpeg");
      setImageCamera(imageData);
      setImg({
        file: null,
        url: imageData,
      });
      setOpenCamera(false);
    }, 100); // Menunda 100ms
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  console.log(audioBlob);

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Lorem, ipsum dolor sit amet</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={message?.createAt}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              {message.audioUrl && (
                <audio controls>
                  <source src={message.audioUrl} type="audio/ogg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              {message.text && <p className="message-text">{message.text}</p>}

              {/* <span>{message.}</span> */}
            </div>
          </div>
        ))}

        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            id="file"
            type="file"
            onChange={handleImg}
            style={{
              display: "none",
            }}
          />
          <img src="./camera.png" alt="" onClick={() => setOpenCamera(true)} />
          {isRecording ? (
            <Stop
              onClick={handleMicClick}
              style={{ color: "red", cursor: "pointer" }}
            />
          ) : (
            <Mic onClick={handleMicClick} style={{ cursor: "pointer" }} />
          )}
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpenEmoji((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} />
          </div>
        </div>

        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>

      {openCamera && (
        <div className="camera-modal">
          <div className="option">
            <h4>Take a photo</h4>
            <Close
              style={{
                cursor: "pointer",
              }}
              onClick={() => setOpenCamera(!openCamera)}
            />
          </div>
          <video ref={videoRef}></video>
          <CameraAlt
            style={{
              width: "150px",
              height: "30px",
              cursor: "pointer",
            }}
            onClick={takePhoto}
          />
        </div>
      )}
      <canvas ref={photoRef} style={{ display: "none" }}></canvas>
    </div>
  );
};

export default Chat;
