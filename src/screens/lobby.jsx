
import React, {useState, useCallback, useEffect} from "react";
import {useSocket} from '../context/SocketProvider'
import {useAsyncError, useNavigate} from 'react-router-dom'
const LobbyScreen = () => {
    const [email, setEmail]=useState('');
    const [room, setRoom]=useState('');

    const socket=useSocket()
    const navigate=useNavigate()
    const handleForm = useCallback((e)=>{
        e.preventDefault();
        socket.emit('room:join', {email,room});

    },[email, room,socket])

    const handleJoinRoom= useCallback((data)=>{
      const {email, room} =data
      navigate(`/room/${room}`)
      console.log(email, room)
    }, [navigate])


useEffect(()=>{
  socket.on('room:join',handleJoinRoom);
    return() => {
      socket.off('room:join', handleJoinRoom)
    }

},[socket])

  return (
    <div>
      <h1>Lobby Screen</h1>
      <form onSubmit={handleForm}>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
        <label htmlFor="room">Room Number</label>
        <input type="text" id="room" value={room} onChange={(e)=>setRoom(e.target.value)}/>
        <button type="submit" className="butn">
          Join
        </button>
      </form>
    </div>
  );
};
export default LobbyScreen;
