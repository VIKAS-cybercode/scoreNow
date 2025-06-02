// src/socket.ts
import { io } from "socket.io-client";

const socket = io("https://scorenow-vflw.onrender.com"); // your server URL

export default socket;
