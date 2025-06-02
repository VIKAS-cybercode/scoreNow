// src/socket.ts
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // your server URL

export default socket;
