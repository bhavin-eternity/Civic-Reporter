import { createContext, useContext, useState, useEffect } from "react";
import { io } from 'socket.io-client';
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null)
            }
            return;
        }

        if (socket) socket.disconnect();

        const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
            transports: ["websocket"],
        })

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);

            if (user.role === "admin") {
                newSocket.emit("join-admin");
            } else {
                newSocket.emit("join-user", user.id || user._id);
            }
        })

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user])

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);