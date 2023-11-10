import React, {useCallback, useEffect, useState} from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from 'react-player';
import peer from "../service/peer";
const RoomPage=()=>{
    const socket=useSocket();

    const [remoteSocketId, setRemoteSocketId]=useState(null);
    const [myStream, setmyStream]=useState()
    const [RemoteStream, setRemoteStream]=useState()

    const handleUserJoined=useCallback(({email,id})=>{
        console.log(`Email ${email} joined the group`)
        setRemoteSocketId(id);
    },[])

    const handleCallUser= useCallback(async()=>{
        const stream =await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true,
            
        });
        const offer=await peer.getOffer();
        socket.emit("user:call", {to:remoteSocketId, offer})
        setmyStream(stream);
    },[remoteSocketId, socket])

    const handleIncoming=useCallback(async ({from, offer})=>{
        setRemoteSocketId(from)
        const stream =await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true,
            
        });
        setmyStream(stream);
        const ans=await peer.getAnswer(offer)
        socket.emit('call:accepted',{to: from, ans})
    },[socket])


    const sendStreams = useCallback(() =>{
        for(const track of myStream.getTracks()){
            peer.peer.addTrack(track,myStream);
        }
    },[myStream])

    const handlecallAccepted=useCallback(({from,ans})=>{
        peer.setLocalDescription(ans)
        sendStreams();
         
    },[sendStreams])

    const handleNegotiation=useCallback(async()=>{
        const offer =await peer.getOffer();
            socket.emit('peer:nego:nedded', {offer,to:remoteSocketId})
    },[remoteSocketId, socket])





    useEffect(()=>{
        peer.peer.addEventListener('negotiationneeded', handleNegotiation)
        return()=>
        peer.peer.removeEventListener('negotiationneeded', handleNegotiation)
    },[handleNegotiation])

    const handleNegotiationIncoming =useCallback(async ({from, offer})=>{

        const ans= await peer.getAnswer(offer);
        socket.emit('peer:nego:done',{to: from, ans})

    },[socket])


    const handleNegotiationFinal=useCallback(async({ans})=>{
        await  peer.setLocalDescription(ans);
     },[])

    useEffect(()=>{
        peer.peer.addEventListener('track', async ev =>{
            const RemoteStream=ev.streams;
            setRemoteStream(RemoteStream[0])
        },[])
    })
    useEffect(()=>{
        socket.on('user:joined',handleUserJoined)
        socket.on('incoming:call', handleIncoming)
        socket.on('call:accepted', handlecallAccepted)
        socket.on('peer:nego:nedded', handleNegotiationIncoming)
        socket.on('peer:nego:final', handleNegotiationFinal)

        return()=>{
            socket.off('user:joined', handleUserJoined);
            socket.off('incoming:call', handleIncoming)
            socket.off('call:accepted', handlecallAccepted)
            socket.off('peer:nego:nedded', handleNegotiationIncoming)
        socket.off('peer:nego:final', handleNegotiationFinal)
        }
    },[socket, handleUserJoined, handleIncoming,handlecallAccepted, handleNegotiationIncoming, handleNegotiationFinal])


    return (
        <div>
            <h1 className="text">Room Page</h1>
            <h4 className="text">{remoteSocketId ? 'Connected' :'no peers'}</h4>
            {myStream && <button onClick={sendStreams} className="butn">Send Stream</button>}
            {remoteSocketId && <button onClick={handleCallUser} className="butn">Call</button>}
            {myStream && <><h1 className="text">My Stream</h1> <div className="Stream"><ReactPlayer  playing height="200px" width="200px" url={myStream}/></div></>}
            {RemoteStream && <><h1 className="text">Remote Stream</h1> <div className="Stream"><ReactPlayer  playing height="200px" width="200px" url={RemoteStream}/></div></>}
        </div>
    )
}
export default RoomPage