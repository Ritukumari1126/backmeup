// src/pages/ChatPage.jsx
import { useEffect, useState, useRef } from "react";
import { useUser } from "../context/UserContext";
import axios from "axios";
import io from "socket.io-client";
import { toast } from "react-toastify";

// backend URL (can override via VITE_BACKEND_URL)
const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const socket = io(BACKEND, { transports: ["websocket"] });

export default function ChatPage() {
  const { user } = useUser();
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [selectedUid, setSelectedUid] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [isOnline, setIsOnline] = useState({});
  const [readUids, setReadUids] = useState({});
  const fileInputRef = useRef();
  const mediaRecorderRef = useRef();
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef();

  // 1️⃣ Load matched users & join socket
  useEffect(() => {
    if (!user?.uid) return;
    axios.get(`${BACKEND}/api/user/${user.uid}`).then(({ data }) => {
      const list = data.matchedWith || [];
      Promise.all(list.map(uid =>
        axios.get(`${BACKEND}/api/user/${uid}`)
      )).then(res => setMatchedUsers(res.map(r => r.data)));
    });

    socket.emit("join", user.uid);

    socket.on("online-status", list => {
      const map = {};
      list.forEach(uid => (map[uid] = true));
      setIsOnline(map);
    });

    socket.on("receive-message", msg => {
      if (msg.from === selectedUid || msg.to === selectedUid)
        setMessages(m => [...m, msg]);
      socket.emit("message-read", { from: msg.from, to: msg.to });
    });

    socket.on("typing", ({ from }) => {
      if (from === selectedUid) {
        setPartnerTyping(true);
        setTimeout(() => setPartnerTyping(false), 1500);
      }
    });

    socket.on("message-read", ({ from }) => {
      setReadUids(r => ({ ...r, [from]: true }));
    });

    socket.on("new-checkin", ({ from, goal, note, date }) => {
      toast.success(`👏 ${from} checked in: "${note || goal}" (${date})`);
    });

    return () => socket.off();
  }, [user, selectedUid]);

  // 2️⃣ Load history when selecting a chat
  useEffect(() => {
    if (!selectedUid) return;
    axios
      .get(`${BACKEND}/api/messages?from=${user.uid}&to=${selectedUid}`)
      .then(({ data }) => setMessages(data));
  }, [selectedUid, user]);

  // 3️⃣ Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4️⃣ Send text msg
  const sendMessage = async () => {
    if (!text.trim()) return;
    const msg = {
      from: user.uid,
      to: selectedUid,
      text,
      timestamp: new Date().toISOString()
    };
    socket.emit("send-message", msg);
    await axios.post(`${BACKEND}/api/send-message`, msg);
    setMessages(m => [...m, msg]);
    setText("");
  };

  // 5️⃣ Typing indicator
  const handleTyping = () => {
    socket.emit("typing", { from: user.uid, to: selectedUid });
  };

  // 6️⃣ File upload
  const handleFile = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("from", user.uid);
    fd.append("to", selectedUid);

    const { data: msg } = await axios.post(
      `${BACKEND}/api/send-file`,
      fd
    );
    socket.emit("send-message", msg);
    setMessages(m => [...m, msg]);
  };

  // 7️⃣ Voice recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    mediaRecorderRef.current = mr;
    const chunks = [];
    mr.ondataavailable = e => chunks.push(e.data);
    mr.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const fd = new FormData();
      fd.append("file", blob, "voice.webm");
      fd.append("from", user.uid);
      fd.append("to", selectedUid);

      const { data: msg } = await axios.post(
        `${BACKEND}/api/send-file`,
        fd
      );
      socket.emit("send-message", msg);
      setMessages(m => [...m, msg]);
    };
    mr.start();
    setRecording(true);
  };
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* ─── Sidebar ───────────────────────────── */}
      <div className="w-64 bg-gray-100 border-r overflow-y-auto">
        <h2 className="p-4 font-bold text-lg">Chats</h2>
        {matchedUsers.map(u => (
          <div
            key={u.uid}
            onClick={() => setSelectedUid(u.uid)}
            className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-purple-100 ${selectedUid === u.uid ? "bg-purple-200" : ""
              }`}
          >
            <img
              src={u.photoURL}
              alt=""
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="flex items-center gap-2 font-medium">
                {u.name}
                {isOnline[u.uid] && (
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {u.goal}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Chat window ────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUid ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b font-semibold bg-gray-50">
              Chat with{" "}
              {matchedUsers.find(u => u.uid === selectedUid)?.name}
              {partnerTyping && (
                <span className="ml-4 text-sm text-gray-400 animate-pulse">
                  Typing…
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[70%] p-2 px-4 rounded-lg break-words ${msg.from === user.uid
                      ? "bg-purple-500 text-white self-end ml-auto"
                      : "bg-gray-200 text-black"
                    }`}
                >
                  {msg.fileUrl ? (
                    msg.fileType?.startsWith("image/") ? (
                      <img
                        src={`${BACKEND}${msg.fileUrl}`}
                        className="max-w-xs rounded"
                      />
                    ) : msg.fileType?.startsWith("audio/") ? (
                      <audio
                        controls
                        src={`${BACKEND}${msg.fileUrl}`}
                      />
                    ) : (
                      <a
                        href={`${BACKEND}${msg.fileUrl}`}
                        download
                        className="underline text-sm"
                      >
                        Download file
                      </a>
                    )
                  ) : (
                    msg.text
                  )}

                  {msg.from === user.uid && (
                    <div className="text-xs text-right mt-1">
                      {readUids[msg.to] ? "✓✓" : "✓"}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t flex gap-2 items-center">
              <input
                className="flex-1 border border-gray-300 rounded px-3 py-2"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Type a message"
                onInput={handleTyping}
              />

              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFile}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                📎
              </button>

              {recording ? (
                <button
                  onClick={stopRecording}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  ⏹️
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  🎤
                </button>
              )}

              <button
                onClick={sendMessage}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
