// import {io} from 'socket.io-client';
// let socket;

// const getsocket = ()=>{
//     if(!socket){
//     socket = io("http://localhost:3000", { withCredentials: true }); // adjust port if needed
//     }
//     return socket;

// }

// const setSocket = ()=>{
//     socket = null;
// }

// export default{getsocket,setSocket}

// SocketContext.js
import { io } from "socket.io-client";
let socket;

const getsocket = () => {
  if (!socket) {
    socket = io("http://localhost:4000", { withCredentials: true });
  }
  return socket;
};

const setSocket = () => {
  socket = null;
};

export default { getsocket, setSocket };


// import { io } from "socket.io-client";

// let socket;

// // Change this to your PC's IPv4 address
// const SERVER_URL = process.env.REACT_APP_SOCKET_URL || "http://192.168.161.136:4000";

// const getsocket = () => {
//   if (!socket) {
//     socket = io(SERVER_URL, { withCredentials: true });
//   }
//   return socket;
// };

// const setSocket = () => {
//   socket = null;
// };

// export default { getsocket, setSocket };
