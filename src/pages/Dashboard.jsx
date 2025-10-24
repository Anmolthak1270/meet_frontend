
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContextApi";
import { FaBars, FaDoorClosed, FaMicrophone, FaMicrophoneSlash, FaPhoneAlt, FaPhoneSlash, FaTimes, FaVideo, FaVideoSlash } from "react-icons/fa";
import SocketContext from "../Socket/SocketContext";
import Simplepeer from "simple-peer";
import SimplePeer from "simple-peer";
const sidebarWidth = 280;

const Dashboard = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [socketidme, setsocketidme] = useState();
  const [onlineUsers, SetOnlineUsers] = useState([]);
  const hasjoined = React.useRef(false);
  const [showRecieverDetailsPopup, setShowRecieverDetailsPopup] = useState(false);
  const [showRecieverDetails, setShowRecieverDetails] = useState(false);
  const myVideo = useRef();
  const myAudio = useRef();
  const connectionref = useRef();
  const [stream ,setStream] = useState(null);
  const[ReciveingCall,setRecievingCall] = useState(false);
  const[caller,setcaller] = useState(null);
  const[calleSignal,setCallersignal] = useState(null);
  const[callAccepted, setCallAccepted] = useState(false);
  const socket = SocketContext.getsocket();
  const [callRejectpopup,setcallrejectpopup]=useState(false);
  const [callRejectedUser,setcallrejectedUser]=useState(null);
  const reciverref = useRef();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  // const reciverVideo= useRef();
  async function fetchAllUsers() {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/user/allusers", {
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        setLoading(false);
        return;
      }
      const data = await res.json();
      setUsers(data.users);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineUser =(userid)=>{
     return onlineUsers.some((u)=>u.userId ===userid)
  }

// const handelacceptCall=async ()=>{
//   try{
// const currentstream = await navigator.mediaDevices.getUserMedia({
// video:true,
// audio:{
//   echoCancellation:true,
//   noiseSuppression:true,
// }
// })
// setStream(currentstream);
// if(myVideo.current){
// myVideo.current.srcObject = currentstream;
// // myVideo.current.muted = true;
// // myVideo.current.volume = 0;
// }
// currentstream.getAudioTracks().forEach(track=>(track.enabled = true));
// setCallAccepted(true);
// setRecievingCall(true);
// setIsSidebarOpen(false);

// const peer = new SimplePeer({
// initiator:false,
// trickle:false,
// stream:currentstream,
// })

// peer.on("signal",(data=>{
//     socket.emit("answeredcall",{
//       signal:data,
//       from:socketidme,
//       to:caller.from 
//     })
// }))


// peer.on("stream",(remotedata)=>{
//   if(reciverref.current){
//     reciverref.current.srcObject =remotedata;
//     reciverref.current.muted = false;
//     reciverref.current.volume = 1.0;
//   }

//   if(calleSignal) peer.signal(calleSignal);
//   connectionref.current= peer;
// })
//   }

 
//   catch(error){
//     console.log("error in acceptcall", error )
//   }
// }
const handelacceptCall = async () => {
  try {
    const currentstream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      }
    });
    setStream(currentstream);
    if (myVideo.current) {
      myVideo.current.srcObject = currentstream;
    }

    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: currentstream // singular
    });

    // Signal back to caller when peer is ready
    peer.on("signal", (data) => {
      socket.emit("answeredcall", {
        signal: data,
        from: socketidme,
        to: caller.from
      });
    });

    // Receive remote stream (from caller)
    peer.on("stream", (remoteStream) => {
      if (reciverref.current) {
        reciverref.current.srcObject = remoteStream;
        reciverref.current.muted = false;
        reciverref.current.volume = 1.0;
      }
    });

    // SIGNAL the peer with the caller's offer!
    if (calleSignal) {
      peer.signal(calleSignal);  // <-- This is crucial!
    }

    connectionref.current = peer;
    setCallAccepted(true);
    setRecievingCall(true);
    setIsSidebarOpen(false);
  } catch (error) {
    console.log("error in acceptcall", error)
  }
};
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:4000/auth/user/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        socket.off("disconnect");
         socket.disconnect();
         SocketContext.setSocket();
        localStorage.removeItem("userData");
        navigate("/login");
        updateUser(null);
      }
    } catch (error) {}
  };

  const handleSelectedUser = (User) => {
    console.log("Selected User:", User);
    setShowRecieverDetailsPopup(true);
    setShowRecieverDetails(User)
    setSelectedUser(User._id);
  };

  const endcallcleanup = async ()=>{
    if(stream){
      stream.getAudioTracks().forEach((track)=>track.stop());
    }
      // if(reciverref.current){
      //   reciverref.current.srcObject = null;
      // }
      // if(myVideo.current){
      //   myVideo.current.srcObject = null;
      // }

      // connectionref.current?.destroy();

      // setStream(null);
      // setRecievingCall(false);
      // setCallAccepted(false);
      // setTimeout(()=>{
      //   window.location.reload();
      // },100)
      // if (reciverref.current) {
      //   try { reciverref.current.srcObject = null; } catch (_) {}
      // }
      // if (myVideo.current) {
      //   try { myVideo.current.srcObject = null; } catch (_) {}
      // }
      
      // if (connectionref.current) {
      //   try {
      //     connectionref.current.destroy();
      //   } catch (_) {}
      //   connectionref.current = null;
      // }
      
      // setStream(null);
      // setRecievingCall(false);
      // setCallAccepted(false);
      
      // stop all local media tracks
if (stream) {
  stream.getTracks().forEach(track => {
    // debug('stopping track', track.kind);
    try { track.stop(); } catch (e) { 
      // debug('track stop err', e);
     }
  });
}

// clear video elements
if (myVideo?.current) {
  try { myVideo.current.srcObject = null; } catch (e) { 
    // debug('myVideo clear err', e); 
  }
}
if (reciverref?.current) {
  try { reciverref.current.srcObject = null; } catch (e) { 
    // debug('reciverref clear err', e); 
  }
}

// small delay to ensure tracks actually stop before destroying peer
await new Promise(res => setTimeout(res, 80));

// destroy SimplePeer instance safely
if (connectionref?.current) {
  try {
    if (typeof connectionref.current.destroy === 'function') {
      connectionref.current.destroy();
      // debug('peer destroyed');
    }
  } catch (e) {
    // debug('peer destroy error', e);
  }
  connectionref.current = null;
}

// reset local state (update to match your state setters)
setStream(null);
setRecievingCall(false);
setCallAccepted(false);
setcaller(null);
setCallersignal(null);
setSelectedUser(null);

// debug('endcallcleanup: done');
      // avoid forcing reload; prefer resetting state or navigate if needed
      window.location.reload();
    
  }

  // reject call 
  const handelrejectCall = () =>{
    setRecievingCall(false);
    setCallAccepted(false);
    socket.emit('reject-call',{
      to:caller.from,
      name:user.username,
      profilepic:user.profilepic
    })
  
  }

  // Toggle Microphone
  const toggleMic = ()=>{
    if(stream){
      const audiotrack = stream.getAudioTracks()[0];
      if(audiotrack){
        audiotrack.enabled = !isMicOn;
        setIsMicOn(audiotrack.enabled);
      }
    }
  }
// Toggle video
const toggleCam = ()=>{
  if(stream){

    const videotrack = stream.getVideoTracks()[0];

    if(videotrack){
      videotrack.enabled = !isCamOn;
      setIsCamOn(videotrack.enabled);
    }
  }
}

useEffect(()=>{
if(user && socket &&!hasjoined.current){
socket.emit('join',{id:user.id,name:user.username})
hasjoined.current =true;
}
socket.on('me',(data)=>{
  console.log("Socket ID:", data);
  setsocketidme(data)
})
socket.on("online-users",(data)=>{
  console.log("online Users:",data)
SetOnlineUsers(data)  

// socket.emit('disconnect', {  });
socket.on("callToUser",(data)=>{
  console.log('data in call to user',data);
  setRecievingCall(data);
  setcaller(data);
  setCallersignal(data.signal);
})
})

socket.on("callRejected",(data)=>{
  setcallrejectpopup(true);
  setcallrejectedUser(data);
})

socket.on('callended',(data)=>{
  console.log("data of all rejected ", data);
  endcallcleanup()
})
return()=>{
  socket.off("online-users");
  socket.off("me"); 
  socket.off("callToUser"); 
  socket.off("callRejected"); 
  socket.off("callended"); 
  
}
},[user,socket])
console.log('getting call',caller)


  useEffect(() => {
    

    socket.on("connect", () => {
      console.log("✅ Socket connected!", socket.id);
    });
    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });
    // Clean up on unmount
    fetchAllUsers();
    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
    
    // eslint-disable-next-line
  }, []);


  // handleendcall
  const handelendCall =()=>{
    socket.emit("call-ended",{
      to:caller?.from || showRecieverDetails._id,
      name:user.username
    })
    endcallcleanup()
  }

//startcall function to handle media and calling
const isOnlineUser = (userid)=>{onlineUsers.some((u)=>u.userId ===userid)};
const startCall = async ()=>{

  try {
    const currentsream = await navigator.mediaDevices.getUserMedia({
      video:true,
      audio:{
        echoCancellation:true,
        noiseSuppression:true,
      },

    })
    setStream(currentsream);

    if(myVideo.current){
      myVideo.current.srcObject = currentsream;
      myVideo.current.muted = true;
      myVideo.current.volume = 0;
    }
    // setIsSidebarOpen(false);
    setShowRecieverDetailsPopup(false);
    setSelectedUser(showRecieverDetails._id);
    currentsream.getAudioTracks().forEach(track=>{track.enabled = true});
    console.log('showrecever id',showRecieverDetails._id );

    const peer = new Simplepeer({
      initiator:true,
      trickle:false,
      stream:currentsream
    })

    // handle the "signal " event this occur 
peer.on("signal",(data)=>{
  console.log("call to user with signal");
  socket.emit("callToUser",{
    callToUserId:showRecieverDetails._id,
    signalData:data,
    from:socketidme,
    email:user.email,
    name:user?.username,
    profilepic:user.profilepic
  })
})

peer.on("stream",(remotedata)=>{
  if(reciverref.current){
    reciverref.current.srcObject = remotedata;
    reciverref.current.muted = false;
    reciverref.current.volume = 1.0;
  }
})


// socket.once("callAccepted",(data)=>{
//   setcallrejectpopup(false);
//   setCallAccepted(true);
//   setcaller(data.from);
//   peer.signal(data.signal);
// })
socket.once("callAccepted",(data)=>{
  setcallrejectpopup(false);
  setCallAccepted(true);
  setcaller(data.from);
  peer.signal(data.signal); // <-- signal with answer!
});
// store the connection
connectionref.current = peer;
showRecieverDetailsPopup(false);
 
  } catch (error) {
    console.log('Error starting call:', error);
  }
}


  // Responsive: show hamburger when sidebar is closed, hide on large screens
  const hamburgerButton = (
    !isSidebarOpen && (
      <button
        aria-label="Open Sidebar"
        onClick={() => setIsSidebarOpen(true)}
        style={{
          position: "fixed",
          top: 24,
          left: 24,
          zIndex: 50,
          width: 48,
          height: 48,
          background: "#fff",
          border: "none",
          borderRadius: "50%",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          cursor: "pointer",
        }}
      >
        <FaBars size={24} color="#4b5563" />
      </button>
    )
  );

  // Overlay for closing sidebar (on mobile)
  const overlay = (
    isSidebarOpen && (
      <div
        onClick={() => setIsSidebarOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(30, 41, 59, 0.28)",
          zIndex: 30,
          display: "block",
        }}
      ></div>
    )
  );

  // Sidebar styles
  const sidebarBaseStyle = {
    position: "fixed",
    left: 0,
    top: 0,
    width: sidebarWidth,
    height: "100vh",
    padding: 24,
    background:
      "linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)", // blue to purple
    color: "#fff",
    boxSizing: "border-box",
    zIndex: 40,
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.4s cubic-bezier(0.86, 0, 0.07, 1)",
    transform: isSidebarOpen
      ? "translateX(0)"
      : `translateX(-${sidebarWidth + 50}px)`,
  };

  // Responsive: Hide hamburger on medium+ screens, always show sidebar
  const responsiveSidebarStyle = {
    ...sidebarBaseStyle,
    minWidth: sidebarWidth,
    maxWidth: sidebarWidth,
  };

  // Main content area style
  const contentStyle = {
    flex: 1,
    marginLeft: sidebarWidth,
    padding: 40,
    background: "#f3f4f6",
    minHeight: "100vh",
    transition: "margin-left 0.4s cubic-bezier(0.86, 0, 0.07, 1)",
  };

  // Responsive: On small screens, main content overlays the sidebar
  // (You can adjust to fit your own needs)
console.log('recivervideo',reciverref);
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Hamburger (when sidebar is closed) */}
      {hamburgerButton}

      {/* Overlay (mobile, for closing sidebar) */}
      {overlay}

      {/* Sidebar */}
      <aside style={responsiveSidebarStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: 1 }}>
            Users
          </h1>
          <button
            aria-label="Close Sidebar"
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: 28,
              marginLeft: 10,
              display: "block",
            }}
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            background: "#312e81",
            color: "#fff",
            border: "1.5px solid #6366f1",
            marginBottom: 20,
            outline: "none",
            fontSize: 15,
          }}
        />

        {/* User List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {loading ? (
              <div style={{ textAlign: "center", color: "#a5b4fc", padding: 20 }}>
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ textAlign: "center", color: "#a5b4fc", padding: 20 }}>
                No users found.
              </div>
            ) : (
              filteredUsers.map((user) => (

                <li
  key={user._id}
  onClick={() => handleSelectedUser(user)}
  style={{
    position: "relative", // important for positioning the online dot
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px",
    marginBottom: "16px",
    borderRadius: "16px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    background: selectedUser === user._id ? "#22c55e" : "#fff",
    color: selectedUser === user._id ? "#fff" : "#1e293b",
    border:
      selectedUser === user._id
        ? "2px solid #16a34a"
        : "2px solid #e5e7eb",
    cursor: "pointer",
    transition:
      "background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s",
  }}
>
  {/* Avatar Container */}
  <div style={{ position: "relative", width: 44, height: 44 }}>
    <img
      src={user.profilepic || "/default-avatar.png"}
     
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: "2px solid black",
        objectFit: "cover",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}
    />
    {onlineUser(user._id) && (
      <span
        style={{
          position: "absolute",
          top: -4,
          right: -4,
          width: "12px",
          height: "12px",
          backgroundColor: "green",
          border: "2px solid #1f2937",
          borderRadius: "50%",
          boxShadow: "0 0 6px rgba(34, 197, 94, 0.5)",
          animation: "bounce 1s infinite",
        }}
      ></span>
    )}
  </div>

  {/* Username and email */}
  <div>
    <div
      style={{
        fontWeight: 700,
        fontSize: 16,
        marginBottom: 2,
        letterSpacing: 0.1,
      }}
    >
      {user.username}
    </div>
    <div
      style={{
        fontSize: 13,
        color: selectedUser === user._id ? "#d1fae5" : "#64748b",
        letterSpacing: 0.05,
        maxWidth: 140,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {user.email}
    </div>
  </div>
</li>

              ))
            )
            }
          </ul>
        </div>

        {/* Logout Button */}
        {user && (
          <div
            onClick={handleLogout}
            style={{
              position: "absolute",
              bottom: 18,
              left: 24,
              right: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#ef4444",
              padding: "10px 0",
              borderRadius: "10px",
              cursor: "pointer",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 600,
              fontSize: 18,
              boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
            }}
          >
            <FaDoorClosed style={{ fontSize: 22 }} />
            Logout
          </div>
        )}
      </aside>


  {/* <div
    style={{
      position: "relative",
      width: "100%",
      height: "100vh",
      backgroundColor: "black",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 30,
          background: "#2d2d2d",
          padding: 22,
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(71,85,105,0.06)",
        }}
      >
        <div style={{ fontSize: 48, width: 80, height: 80 }}>👋</div>
        <div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: "800",
              background: "linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 5,
            }}
          >
            Hey {'Anmol'|| "Guest"}! 👋
          </h1>
          <p style={{ color: "#d1d5db", fontSize: 18, marginTop: 6 }}>
            Ready to <strong>connect with friends instantly?</strong>
            <br />
            Just <strong>select a user</strong> and start your video call! 🎥✨
          </p>
        </div>
      </div>
    </div>
  </div> */}

 {
    selectedUser||ReciveingCall||callAccepted?
    <>
    <div
  style={{
    position: 'relative',
    width: '100%',
    height: '100vh',
    backgroundColor: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
<video
  ref={reciverref}
  autoPlay
  playsInline 
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: "0.5rem" // 8px, same as Tailwind's rounded-lg
  }}
/>
</div>
   <div
    style={{
      position: "absolute",
      bottom: "75px", // equivalent of bottom-[75px]
      right: "0",
      backgroundColor: "#111827", // tailwind bg-gray-900
      borderRadius: "12px",       // tailwind rounded-lg
      overflow: "hidden",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // tailwind shadow-lg
    }}
    >
    <video
      ref={myVideo}
      autoPlay
      playsInline
      style={{
        width: "128px",       // tailwind w-32
        height: "192px",      // tailwind h-48
        objectFit: "cover",   // tailwind object-cover
        borderRadius: "12px", // tailwind rounded-lg
      }}
      />
      












    
          </div>

          {/* Username + Sidebar Button */}
          {/* <div className="absolute top-4 left-4 text-white text-lg font-bold flex gap-2 items-center">
            <button
              type="button"
              className="md:hidden text-2xl text-white cursor-pointer"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FaBars />
            </button>
            {caller.name || "Caller"}
          </div> */}

          {/* Call Controls */}
          {/* <div className="absolute bottom-4 w-full flex justify-center gap-4">
            <button
              type="button"
              className="bg-red-600 p-4 rounded-full text-white shadow-lg cursor-pointer"
              // onClick={handelendCall}
            >
              <FaPhoneSlash size={24} />
            </button> */}
            {/* 🎤 Toggle Mic */}
            {/* <button
              type="button"
              // onClick={toggleMic}
              className={`p-4 rounded-full text-white shadow-lg cursor-pointer transition-colors ${isMicOn ? "bg-green-600" : "bg-red-600"
                }`}
            >
              {isMicOn ? <FaMicrophone size={24} /> : <FaMicrophoneSlash size={24} />}
            </button> */}

            {/* 📹 Toggle Video */}
            {/* <button
              type="button"
              // onClick={toggleCam}
              className={`p-4 rounded-full text-white shadow-lg cursor-pointer transition-colors ${isCamOn ? "bg-green-600" : "bg-red-600"
                }`}
            >
              {isCamOn ? <FaVideo size={24} /> : <FaVideoSlash size={24} />}
            </button>


        

  </div> */}
{/* Username + Sidebar Button */}
<div
  style={{
    position: "absolute",
    top: "16px",
    left: "16px",
    color: "white",
    fontSize: "18px",
    fontWeight: "bold",
    display: "flex",
    gap: "8px",
    alignItems: "center",
  }}
>
  <button
    type="button"
    style={{
      display: "block",
      fontSize: "24px",
      color: "white",
      cursor: "pointer",
    }}
    onClick={() => setIsSidebarOpen(true)}
  >
    <FaBars />
  </button>
  {caller?.name || "Caller"}
</div>

{/* Call Controls */}
<div
  style={{
    position: "absolute",
    bottom: "16px",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: "16px",
  }}
>
  {/* End Call */}
  <button
    type="button"
    style={{
      backgroundColor: "#dc2626",
      padding: "16px",
      borderRadius: "50%",
      color: "white",
      boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
      cursor: "pointer",
    }}
    onClick={handelendCall}
  >
    <FaPhoneSlash size={24} />
  </button>

  {/* 🎤 Toggle Mic */}
  <button
    type="button"
    onClick={toggleMic}
    style={{
      padding: "16px",
      borderRadius: "50%",
      color: "white",
      boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
      cursor: "pointer",
      backgroundColor: isMicOn ? "#16a34a" : "#dc2626", // green if ON, red if OFF
      transition: "background-color 0.3s ease",
    }}
  >
    {isMicOn ? <FaMicrophone size={24} /> : <FaMicrophoneSlash size={24} />}
  </button>

  {/* 📹 Toggle Video */}
  <button
    type="button"
    onClick={toggleCam}
    style={{
      padding: "16px",
      borderRadius: "50%",
      color: "white",
      boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
      cursor: "pointer",
      backgroundColor: isCamOn ? "#16a34a" : "#dc2626", // green if ON, red if OFF
      transition: "background-color 0.3s ease",
    }}
  >
    {isCamOn ? <FaVideo size={24} /> : <FaVideoSlash size={24} />}
  </button>
</div>



      </>
    :<div style={contentStyle}>

    <div>
 <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 30,
        marginBottom: 30,
        background: "#18181b",
        padding: 22,
        borderRadius: 18,
        boxShadow: "0 4px 24px rgba(71,85,105,0.06)",
      }}
    >
      <div style={{ width: 80, height: 80, fontSize: 48 }}>👋</div>
      <div>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 800,
            background: "linear-gradient(90deg,#60a5fa 0%,#a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 5,
          }}
        >
          Hey {user?.username || "Guest"}! 👋
        </h1>
        <p style={{ color: "#d1d5db", fontSize: 18, marginTop: 6 }}>
          Ready to <strong>connect with friends instantly?</strong>
          <br />
          Just <strong>select a user</strong> and start your video call! 🎥✨
        </p>
      </div>
    </div>
      </div>
   

    {/* Instructions */}
    <div
      style={{
        background: "#18181b",
        color: "#e5e7eb",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(71,85,105,0.04)",
        fontSize: 15,
      }}
    >
      <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 10 }}>
        💡 How to Start a Video Call?
      </h2>
      <ul style={{ marginLeft: 20, color: "#cbd5e1" }}>
        <li>📌 Open the sidebar to see online users.</li>
        <li>🔍 Use the search bar to find a specific person.</li>
        <li>🎥 Click on a user to start a video call instantly!</li>
      </ul>
    </div>
  </div>
}
{showRecieverDetailsPopup && showRecieverDetails &&(
 
  <>
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: 16,
    }}
  >
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 12,
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        maxWidth: 400,
        width: "100%",
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p style={{ fontWeight: "900", fontSize: 20, marginBottom: 8 }}>
          User Details
        </p>
        <img
          src={showRecieverDetails.profilepic || "/default-avatar.png"}
          alt="User"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "4px solid #3b82f6", // blue-500
            objectFit: "cover",
          }}
        />
        <h3
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginTop: 12,
          }}
        >
          {showRecieverDetails.username}
        </h3>
        <p style={{ fontSize: 14, color: "#6b7280" }}>
          {showRecieverDetails.email}
        </p>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 20,
          }}
        >
          <button
            onClick={() => {
              setSelectedUser(showRecieverDetails._id);
              startCall(); // function that handles media and calling
              setShowRecieverDetailsPopup(false);
              setIsSidebarOpen(false);
              
            }}
            style={{
              backgroundColor: "#16a34a", // green-600
              color: "#fff",
              padding: "6px 16px",
              borderRadius: 8,
              width: 112,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            Call <FaPhoneAlt />
          </button>
          <button
            onClick={() => setShowRecieverDetailsPopup(false)}
            style={{
              backgroundColor: "#9ca3af", // gray-400
              color: "#fff",
              padding: "6px 16px",
              borderRadius: 8,
              width: 112,
              border: "none",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</>

)}
{ReciveingCall && !callAccepted && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.3)",
      backdropFilter: "blur(5px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: "1rem",
    }}
  >
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        maxWidth: "28rem",
        width: "100%",
        padding: "1.5rem",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ fontWeight: "900", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
          Call From...
        </p>
        <img
          src={caller?.profilepic || "/default-avatar.png"}
          alt="Caller"
          style={{
            width: "5rem",
            height: "5rem",
            borderRadius: "9999px",
            border: "4px solid #22c55e",
          }}
        />
        <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", marginTop: "0.75rem" }}>
          {caller.name}
        </h3>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{caller?.email}</p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem" }}>
          <button
            type="button"
            onClick={handelacceptCall}
            style={{
              backgroundColor: "#22c55e",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              width: "7rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Accept <FaPhoneAlt />
          </button>
          <button
            type="button"
            onClick={handelrejectCall}
            style={{
              backgroundColor: "#ef4444",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              width: "7rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Reject <FaPhoneSlash />
          </button>
        </div>
      </div>
    </div>
  </div>
)}
{callRejectpopup && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      backdropFilter: "blur(5px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: "1rem",
    }}
  >
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        maxWidth: "28rem",
        width: "100%",
        padding: "1.5rem",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ fontWeight: "900", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
          Call Rejected From...
        </p>
        <img
          src={showRecieverDetails.profilepic || "/default-avatar.png"}
          alt="Caller"
          style={{
            width: "5rem",
            height: "5rem",
            borderRadius: "9999px",
            border: "4px solid #22c55e",
          }}
        />
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "bold",
            marginTop: "0.75rem",
          }}
        >
          {showRecieverDetails.username}
        </h3>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem" }}>
          <button
            type="button"
            onClick={() => {
              startCall();
            }}
            style={{
              backgroundColor: "#22c55e",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              width: "7rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Call Again <FaPhoneAlt />
          </button>
          <button
            type="button"
            onClick={() => {
              setcallrejectpopup(false);
              setShowRecieverDetailsPopup(false);
            }}
            style={{
              backgroundColor: "#ef4444",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              width: "7rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Back <FaPhoneSlash />
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Dashboard;


// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useUser } from "../context/UserContextApi";
// import { FaBars, FaDoorClosed, FaMicrophone, FaMicrophoneSlash, FaPhoneAlt, FaPhoneSlash, FaTimes, FaVideo, FaVideoSlash } from "react-icons/fa";
// import SocketContext from "../Socket/SocketContext";
// import SimplePeer from "simple-peer";
// const sidebarWidth = 280;

// const Dashboard = () => {
//   const { user, updateUser } = useUser();
//   const navigate = useNavigate();
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [socketidme, setsocketidme] = useState();
//   const [onlineUsers, SetOnlineUsers] = useState([]);
//   const hasjoined = useRef(false);
//   const [showRecieverDetailsPopup, setShowRecieverDetailsPopup] = useState(false);
//   const [showRecieverDetails, setShowRecieverDetails] = useState(false);
//   const myVideo = useRef();
//   const connectionref = useRef();
//   const [stream, setStream] = useState(null);
//   const [ReciveingCall, setRecievingCall] = useState(false);
//   const [caller, setcaller] = useState(null);
//   const [calleSignal, setCallersignal] = useState(null);
//   const [callAccepted, setCallAccepted] = useState(false);
//   const socket = SocketContext.getsocket();
//   const [callRejectpopup, setcallrejectpopup] = useState(false);
//   const [callRejectedUser, setcallrejectedUser] = useState(null);
//   const reciverref = useRef();
//   const [isMicOn, setIsMicOn] = useState(true);
//   const [isCamOn, setIsCamOn] = useState(true);

//   // Fetch all users from backend
//   async function fetchAllUsers() {
//     try {
//       setLoading(true);
//       const res = await fetch("http://localhost:4000/user/allusers", {
//         credentials: "include",
//       });
//       if (!res.ok) {
//         setLoading(false);
//         return;
//       }
//       const data = await res.json();
//       setUsers(data.users);
//       setLoading(false);
//     } catch (err) {
//       setLoading(false);
//     }
//   }

//   const filteredUsers = users.filter(
//     (user) =>
//       user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       user.email.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const onlineUser = (userid) => onlineUsers.some((u) => u.userId === userid);

//   // Accept incoming call
//   const handelacceptCall = async () => {
//     try {
//       const currentstream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: { echoCancellation: true, noiseSuppression: true },
//       });
//       setStream(currentstream);
//       if (myVideo.current) {
//         myVideo.current.srcObject = currentstream;
//       }

//       const peer = new SimplePeer({
//         initiator: false,
//         trickle: false,
//         stream: currentstream
//       });

//       peer.on("signal", (data) => {
//         socket.emit("answeredcall", {
//           signal: data,
//           from: socketidme,
//           to: caller.from
//         });
//       });

//       peer.on("stream", (remoteStream) => {
//         if (reciverref.current) {
//           reciverref.current.srcObject = remoteStream;
//           reciverref.current.muted = false;
//           reciverref.current.volume = 1.0;
//         }
//       });

//       if (calleSignal) peer.signal(calleSignal);

//       // Save peer instance for cleanup
//       connectionref.current = peer;
//       setCallAccepted(true);
//       setRecievingCall(true);
//       setIsSidebarOpen(false);

//       // Listen for call end from remote peer
//       // socket.once("call-ended", () => {
//       //   endcallcleanup();
//       // });

//     } catch (error) {
//       console.log("error in acceptcall", error)
//     }
//   };

//   // Logout
//   const handleLogout = async () => {
//     try {
//       const res = await fetch("http://localhost:4000/auth/user/logout", {
//         method: "POST",
//         credentials: "include",
//       });
//       const data = await res.json();
//       if (data.success) {
//         socket.off("disconnect");
//         socket.disconnect();
//         SocketContext.setSocket();
//         localStorage.removeItem("userData");
//         navigate("/login");
//         updateUser(null);
//       }
//     } catch (error) {}
//   };

//   const handleSelectedUser = (User) => {
//     setShowRecieverDetailsPopup(true);
//     setShowRecieverDetails(User);
//     setSelectedUser(User._id);
//   };

//   // Cleanup after call ends or is rejected
//   const endcallcleanup = () => {
//     // Stop local media tracks
//     if (stream) {
//       stream.getTracks().forEach(track => { try { track.stop(); } catch (e) {} });
//     }

//     // Clear video elements
//     if (myVideo?.current) { try { myVideo.current.srcObject = null; } catch (e) {} }
//     if (reciverref?.current) { try { reciverref.current.srcObject = null; } catch (e) {} }

//     // Destroy SimplePeer instance
//     if (connectionref?.current) {
//       try { connectionref.current.destroy(); } catch (e) {}
//       connectionref.current = null;
//     }

//     // Reset state
//     setStream(null);
//     setRecievingCall(false);
//     setCallAccepted(false);
//     setcaller(null);
//     setCallersignal(null);
//     setSelectedUser(null);
//     setShowRecieverDetails(false);
//     setShowRecieverDetailsPopup(false);
//     setcallrejectpopup(false);
//     setcallrejectedUser(null);
//   };

//   // Reject incoming call
//   const handelrejectCall = () => {
//     setRecievingCall(false);
//     setCallAccepted(false);
//     socket.emit('reject-call', {
//       to: caller.from,
//       name: user.username,
//       profilepic: user.profilepic
//     });
//     endcallcleanup();
//   };

//   // End call (for both sides)
//   const handelendCall = () => {
//     // Tell the remote peer to end as well
//     socket.emit("call-ended", {
//       to: caller?.from || showRecieverDetails._id,
//       name: user.username
//     });
//     endcallcleanup();
//   };

//   // Start a call as caller
//   const startCall = async () => {
//     try {
//       const currentsream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: { echoCancellation: true, noiseSuppression: true }
//       });
//       setStream(currentsream);

//       if (myVideo.current) {
//         myVideo.current.srcObject = currentsream;
//         myVideo.current.muted = true;
//         myVideo.current.volume = 0;
//       }
//       setShowRecieverDetailsPopup(false);
//       setSelectedUser(showRecieverDetails._id);
//       currentsream.getAudioTracks().forEach(track => { track.enabled = true; });

//       const peer = new SimplePeer({
//         initiator: true,
//         trickle: false,
//         stream: currentsream
//       });

//       peer.on("signal", (data) => {
//         socket.emit("callToUser", {
//           callToUserId: showRecieverDetails._id,
//           signalData: data,
//           from: socketidme,
//           email: user.email,
//           name: user?.username,
//           profilepic: user.profilepic
//         });
//       });

//       peer.on("stream", (remotedata) => {
//         if (reciverref.current) {
//           reciverref.current.srcObject = remotedata;
//           reciverref.current.muted = false;
//           reciverref.current.volume = 1.0;
//         }
//       });

//       socket.once("callAccepted", (data) => {
//         setcallrejectpopup(false);
//         setCallAccepted(true);
//         setcaller(data.from);
//         peer.signal(data.signal);

//         // Listen for call end from remote peer
//         // socket.once("call-ended", () => {
//         //   endcallcleanup();
//         // });
//       });

//       connectionref.current = peer;
//       setShowRecieverDetailsPopup(false);

//     } catch (error) {
//       console.log('Error starting call:', error);
//     }
//   };

//   useEffect(() => {
//     if (user && socket && !hasjoined.current) {
//       socket.emit('join', { id: user.id, name: user.username });
//       hasjoined.current = true;
//     }

//     socket.on('me', (data) => {
//       setsocketidme(data);
//     });

//     socket.on("online-users", (data) => {
//       SetOnlineUsers(data);
//     });

//     // Listen for incoming call
//     socket.on("callToUser", (data) => {
//       setRecievingCall(data);
//       setcaller(data);
//       setCallersignal(data.signal);
//     });

//     // Listen for remote peer ending the call (for both initiator and receiver)
//     socket.on("call-ended", () => {
//       endcallcleanup();
//     });

//     socket.on("callRejected", (data) => {
//       setcallrejectpopup(true);
//       setcallrejectedUser(data);
//     });

//     return () => {
//       socket.off("online-users");
//       socket.off("me");
//       socket.off("callToUser");
//       socket.off("callRejected");
//       socket.off("call-ended");
//     };
//   }, [user, socket]);

//   useEffect(() => {
//     socket.on("connect", () => {});
//     socket.on("connect_error", (err) => {});
//     fetchAllUsers();
//     return () => {
//       socket.off("connect");
//       socket.off("connect_error");
//     };
//   }, []);

//   // UI code continues unchanged below...

//   return (
//     <div style={{ display: "flex", minHeight: "100vh" }}>
//       {/* Hamburger (when sidebar is closed) */}
//       {!isSidebarOpen && (
//         <button
//           aria-label="Open Sidebar"
//           onClick={() => setIsSidebarOpen(true)}
//           style={{
//             position: "fixed",
//             top: 24,
//             left: 24,
//             zIndex: 50,
//             width: 48,
//             height: 48,
//             background: "#fff",
//             border: "none",
//             borderRadius: "50%",
//             boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
//             cursor: "pointer",
//           }}
//         >
//           <FaBars size={24} color="#4b5563" />
//         </button>
//       )}

//       {/* Overlay (mobile, for closing sidebar) */}
//       {isSidebarOpen && (
//         <div
//           onClick={() => setIsSidebarOpen(false)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(30, 41, 59, 0.28)",
//             zIndex: 30,
//             display: "block",
//           }}
//         ></div>
//       )}

//       {/* Sidebar */}
//       <aside style={{
//         position: "fixed",
//         left: 0,
//         top: 0,
//         width: sidebarWidth,
//         minWidth: sidebarWidth,
//         maxWidth: sidebarWidth,
//         height: "100vh",
//         padding: 24,
//         background: "linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)",
//         color: "#fff",
//         boxSizing: "border-box",
//         zIndex: 40,
//         display: "flex",
//         flexDirection: "column",
//         transition: "transform 0.4s cubic-bezier(0.86, 0, 0.07, 1)",
//         transform: isSidebarOpen
//           ? "translateX(0)"
//           : `translateX(-${sidebarWidth + 50}px)`,
//       }}>
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             marginBottom: 28,
//           }}
//         >
//           <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: 1 }}>
//             Users
//           </h1>
//           <button
//             aria-label="Close Sidebar"
//             style={{
//               background: "none",
//               border: "none",
//               color: "#fff",
//               cursor: "pointer",
//               fontSize: 28,
//               marginLeft: 10,
//               display: "block",
//             }}
//             onClick={() => setIsSidebarOpen(false)}
//           >
//             <FaTimes />
//           </button>
//         </div>

//         {/* Search */}
//         <input
//           type="text"
//           placeholder="Search user..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           style={{
//             width: "100%",
//             padding: "12px",
//             borderRadius: 10,
//             background: "#312e81",
//             color: "#fff",
//             border: "1.5px solid #6366f1",
//             marginBottom: 20,
//             outline: "none",
//             fontSize: 15,
//           }}
//         />

//         {/* User List */}
//         <div style={{ flex: 1, overflowY: "auto" }}>
//           <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
//             {loading ? (
//               <div style={{ textAlign: "center", color: "#a5b4fc", padding: 20 }}>
//                 Loading users...
//               </div>
//             ) : filteredUsers.length === 0 ? (
//               <div style={{ textAlign: "center", color: "#a5b4fc", padding: 20 }}>
//                 No users found.
//               </div>
//             ) : (
//               filteredUsers.map((user) => (
//                 <li
//                   key={user._id}
//                   onClick={() => handleSelectedUser(user)}
//                   style={{
//                     position: "relative",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "16px",
//                     padding: "18px",
//                     marginBottom: "16px",
//                     borderRadius: "16px",
//                     boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
//                     background: selectedUser === user._id ? "#22c55e" : "#fff",
//                     color: selectedUser === user._id ? "#fff" : "#1e293b",
//                     border: selectedUser === user._id
//                       ? "2px solid #16a34a"
//                       : "2px solid #e5e7eb",
//                     cursor: "pointer",
//                     transition:
//                       "background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s",
//                   }}
//                 >
//                   {/* Avatar */}
//                   <div style={{ position: "relative", width: 44, height: 44 }}>
//                     <img
//                       src={user.profilepic || "/default-avatar.png"}
//                       style={{
//                         width: 44,
//                         height: 44,
//                         borderRadius: "50%",
//                         border: "2px solid black",
//                         objectFit: "cover",
//                         boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
//                       }}
//                       alt="avatar"
//                     />
//                     {onlineUser(user._id) && (
//                       <span
//                         style={{
//                           position: "absolute",
//                           top: -4,
//                           right: -4,
//                           width: "12px",
//                           height: "12px",
//                           backgroundColor: "green",
//                           border: "2px solid #1f2937",
//                           borderRadius: "50%",
//                           boxShadow: "0 0 6px rgba(34, 197, 94, 0.5)",
//                           animation: "bounce 1s infinite",
//                         }}
//                       ></span>
//                     )}
//                   </div>

//                   {/* Username and email */}
//                   <div>
//                     <div style={{
//                       fontWeight: 700,
//                       fontSize: 16,
//                       marginBottom: 2,
//                       letterSpacing: 0.1,
//                     }}>{user.username}</div>
//                     <div style={{
//                       fontSize: 13,
//                       color: selectedUser === user._id ? "#d1fae5" : "#64748b",
//                       letterSpacing: 0.05,
//                       maxWidth: 140,
//                       overflow: "hidden",
//                       textOverflow: "ellipsis",
//                       whiteSpace: "nowrap",
//                     }}>{user.email}</div>
//                   </div>
//                 </li>
//               ))
//             )}
//           </ul>
//         </div>

//         {/* Logout Button */}
//         {user && (
//           <div
//             onClick={handleLogout}
//             style={{
//               position: "absolute",
//               bottom: 18,
//               left: 24,
//               right: 24,
//               display: "flex",
//               alignItems: "center",
//               gap: 8,
//               background: "#ef4444",
//               padding: "10px 0",
//               borderRadius: "10px",
//               cursor: "pointer",
//               justifyContent: "center",
//               color: "#fff",
//               fontWeight: 600,
//               fontSize: 18,
//               boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
//             }}
//           >
//             <FaDoorClosed style={{ fontSize: 22 }} />
//             Logout
//           </div>
//         )}
//       </aside>

//       {/* Main Content + Call UI */}
//       {(selectedUser || ReciveingCall || callAccepted) ? (
//         <>
//           <div
//             style={{
//               position: 'relative',
//               width: '100%',
//               height: '100vh',
//               backgroundColor: 'black',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}
//           >
//             <video
//               ref={reciverref}
//               autoPlay
//               playsInline
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 width: "100%",
//                 height: "100%",
//                 objectFit: "contain",
//                 borderRadius: "0.5rem"
//               }}
//             />
//           </div>
//           <div
//             style={{
//               position: "absolute",
//               bottom: "75px",
//               right: "0",
//               backgroundColor: "#111827",
//               borderRadius: "12px",
//               overflow: "hidden",
//               boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
//             }}
//           >
//             <video
//               ref={myVideo}
//               autoPlay
//               playsInline
//               style={{
//                 width: "128px",
//                 height: "192px",
//                 objectFit: "cover",
//                 borderRadius: "12px",
//               }}
//             />
//           </div>
//           {/* Call Controls */}
//           <div
//             style={{
//               position: "absolute",
//               bottom: "16px",
//               width: "100%",
//               display: "flex",
//               justifyContent: "center",
//               gap: "16px",
//             }}
//           >
//             {/* End Call */}
//             <button
//               type="button"
//               style={{
//                 backgroundColor: "#dc2626",
//                 padding: "16px",
//                 borderRadius: "50%",
//                 color: "white",
//                 boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
//                 cursor: "pointer",
//               }}
//               onClick={handelendCall}
//             >
//               <FaPhoneSlash size={24} />
//             </button>
//             {/* 🎤 Toggle Mic */}
//             <button
//               type="button"
//               style={{
//                 padding: "16px",
//                 borderRadius: "50%",
//                 color: "white",
//                 boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
//                 cursor: "pointer",
//                 backgroundColor: isMicOn ? "#16a34a" : "#dc2626",
//                 transition: "background-color 0.3s ease",
//               }}
//             >
//               {isMicOn ? <FaMicrophone size={24} /> : <FaMicrophoneSlash size={24} />}
//             </button>
//             {/* 📹 Toggle Video */}
//             <button
//               type="button"
//               style={{
//                 padding: "16px",
//                 borderRadius: "50%",
//                 color: "white",
//                 boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
//                 cursor: "pointer",
//                 backgroundColor: isCamOn ? "#16a34a" : "#dc2626",
//                 transition: "background-color 0.3s ease",
//               }}
//             >
//               {isCamOn ? <FaVideo size={24} /> : <FaVideoSlash size={24} />}
//             </button>
//           </div>
//           {/* Username + Sidebar Button */}
//           <div
//             style={{
//               position: "absolute",
//               top: "16px",
//               left: "16px",
//               color: "white",
//               fontSize: "18px",
//               fontWeight: "bold",
//               display: "flex",
//               gap: "8px",
//               alignItems: "center",
//             }}
//           >
//             <button
//               type="button"
//               style={{
//                 display: "block",
//                 fontSize: "24px",
//                 color: "white",
//                 cursor: "pointer",
//               }}
//               onClick={() => setIsSidebarOpen(true)}
//             >
//               <FaBars />
//             </button>
//             {caller?.name || "Caller"}
//           </div>
//         </>
//       ) : (
//         <div style={{
//           flex: 1,
//           marginLeft: sidebarWidth,
//           padding: 40,
//           background: "#f3f4f6",
//           minHeight: "100vh",
//           transition: "margin-left 0.4s cubic-bezier(0.86, 0, 0.07, 1)",
//         }}>
//           <div>
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 30,
//                 marginBottom: 30,
//                 background: "#18181b",
//                 padding: 22,
//                 borderRadius: 18,
//                 boxShadow: "0 4px 24px rgba(71,85,105,0.06)",
//               }}
//             >
//               <div style={{ width: 80, height: 80, fontSize: 48 }}>👋</div>
//               <div>
//                 <h1
//                   style={{
//                     fontSize: 36,
//                     fontWeight: 800,
//                     background: "linear-gradient(90deg,#60a5fa 0%,#a78bfa 100%)",
//                     WebkitBackgroundClip: "text",
//                     WebkitTextFillColor: "transparent",
//                     marginBottom: 5,
//                   }}
//                 >
//                   Hey {user?.username || "Guest"}! 👋
//                 </h1>
//                 <p style={{ color: "#d1d5db", fontSize: 18, marginTop: 6 }}>
//                   Ready to <strong>connect with friends instantly?</strong>
//                   <br />
//                   Just <strong>select a user</strong> and start your video call! 🎥✨
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div
//             style={{
//               background: "#18181b",
//               color: "#e5e7eb",
//               padding: 20,
//               borderRadius: 12,
//               boxShadow: "0 4px 24px rgba(71,85,105,0.04)",
//               fontSize: 15,
//             }}
//           >
//             <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 10 }}>
//               💡 How to Start a Video Call?
//             </h2>
//             <ul style={{ marginLeft: 20, color: "#cbd5e1" }}>
//               <li>📌 Open the sidebar to see online users.</li>
//               <li>🔍 Use the search bar to find a specific person.</li>
//               <li>🎥 Click on a user to start a video call instantly!</li>
//             </ul>
//           </div>
//         </div>
//       )}
//       {/* Receiver Details Popup */}
//       {showRecieverDetailsPopup && showRecieverDetails && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             backgroundColor: "rgba(0, 0, 0, 0.3)",
//             backdropFilter: "blur(6px)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 50,
//             padding: 16,
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: "#ffffff",
//               borderRadius: 12,
//               boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
//               maxWidth: 400,
//               width: "100%",
//               padding: 24,
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//               }}
//             >
//               <p style={{ fontWeight: "900", fontSize: 20, marginBottom: 8 }}>
//                 User Details
//               </p>
//               <img
//                 src={showRecieverDetails.profilepic || "/default-avatar.png"}
//                 alt="User"
//                 style={{
//                   width: 80,
//                   height: 80,
//                   borderRadius: "50%",
//                   border: "4px solid #3b82f6",
//                   objectFit: "cover",
//                 }}
//               />
//               <h3
//                 style={{
//                   fontSize: 18,
//                   fontWeight: "bold",
//                   marginTop: 12,
//                 }}
//               >
//                 {showRecieverDetails.username}
//               </h3>
//               <p style={{ fontSize: 14, color: "#6b7280" }}>
//                 {showRecieverDetails.email}
//               </p>
//               <div
//                 style={{
//                   display: "flex",
//                   gap: 16,
//                   marginTop: 20,
//                 }}
//               >
//                 <button
//                   onClick={() => {
//                     setSelectedUser(showRecieverDetails._id);
//                     startCall();
//                     setShowRecieverDetailsPopup(false);
//                     setIsSidebarOpen(false);
//                   }}
//                   style={{
//                     backgroundColor: "#16a34a",
//                     color: "#fff",
//                     padding: "6px 16px",
//                     borderRadius: 8,
//                     width: 112,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     gap: 8,
//                     border: "none",
//                     cursor: "pointer",
//                   }}
//                 >
//                   Call <FaPhoneAlt />
//                 </button>
//                 <button
//                   onClick={() => setShowRecieverDetailsPopup(false)}
//                   style={{
//                     backgroundColor: "#9ca3af",
//                     color: "#fff",
//                     padding: "6px 16px",
//                     borderRadius: 8,
//                     width: 112,
//                     border: "none",
//                     cursor: "pointer",
//                   }}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       {/* Incoming Call Popup */}
//       {ReciveingCall && !callAccepted && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             backgroundColor: "rgba(0,0,0,0.3)",
//             backdropFilter: "blur(5px)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 50,
//             padding: "1rem",
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: "#fff",
//               borderRadius: "0.5rem",
//               boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
//               maxWidth: "28rem",
//               width: "100%",
//               padding: "1.5rem",
//             }}
//           >
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
//               <p style={{ fontWeight: "900", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
//                 Call From...
//               </p>
//               <img
//                 src={caller?.profilepic || "/default-avatar.png"}
//                 alt="Caller"
//                 style={{
//                   width: "5rem",
//                   height: "5rem",
//                   borderRadius: "9999px",
//                   border: "4px solid #22c55e",
//                 }}
//               />
//               <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", marginTop: "0.75rem" }}>
//                 {caller?.name}
//               </h3>
//               <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{caller?.email}</p>
//               <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem" }}>
//                 <button
//                   type="button"
//                   onClick={handelacceptCall}
//                   style={{
//                     backgroundColor: "#22c55e",
//                     color: "#fff",
//                     padding: "0.5rem 1rem",
//                     borderRadius: "0.5rem",
//                     width: "7rem",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     gap: "0.5rem",
//                     fontWeight: "bold",
//                     border: "none",
//                     cursor: "pointer",
//                   }}
//                 >
//                   Accept <FaPhoneAlt />
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handelrejectCall}
//                   style={{
//                     backgroundColor: "#ef4444",
//                     color: "#fff",
//                     padding: "0.5rem 1rem",
//                     borderRadius: "0.5rem",
//                     width: "7rem",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     gap: "0.5rem",
//                     fontWeight: "bold",
//                     border: "none",
//                     cursor: "pointer",
//                   }}
//                 >
//                   Reject <FaPhoneSlash />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       {/* Call Rejected Popup */}
//       {callRejectpopup && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             backgroundColor: "rgba(0, 0, 0, 0.3)",
//             backdropFilter: "blur(5px)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 50,
//             padding: "1rem",
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: "#ffffff",
//               borderRadius: "0.5rem",
//               boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
//               maxWidth: "28rem",
//               width: "100%",
//               padding: "1.5rem",
//             }}
//           >
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
//               <p style={{ fontWeight: "900", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
//                 Call Rejected From...
//               </p>
//               <img
//                 src={showRecieverDetails.profilepic || "/default-avatar.png"}
//                 alt="Caller"
//                 style={{
//                   width: "5rem",
//                   height: "5rem",
//                   borderRadius: "9999px",
//                   border: "4px solid #22c55e",
//                 }}
//               />
//               <h3
//                 style={{
//                   fontSize: "1.125rem",
//                   fontWeight: "bold",
//                   marginTop: "0.75rem",
//                 }}
//               >
//                 {showRecieverDetails.username}
//               </h3>
//               <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem" }}>
//                 <button
//                   type="button"
//                   onClick={() => { startCall(); }}
//                   style={{
//                     backgroundColor: "#22c55e",
//                     color: "#fff",
//                     padding: "0.5rem 1rem",
//                     borderRadius: "0.5rem",
//                     width: "7rem",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     gap: "0.5rem",
//                     fontWeight: "bold",
//                     border: "none",
//                     cursor: "pointer",
//                   }}
//                 >
//                   Call Again <FaPhoneAlt />
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setcallrejectpopup(false);
//                     setShowRecieverDetailsPopup(false);
//                   }}
//                   style={{
//                     backgroundColor: "#ef4444",
//                     color: "#fff",
//                     padding: "0.5rem 1rem",
//                     borderRadius: "0.5rem",
//                     width: "7rem",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     gap: "0.5rem",
//                     fontWeight: "bold",
//                     border: "none",
//                     cursor: "pointer",
//                   }}
//                 >
//                   Back <FaPhoneSlash />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;