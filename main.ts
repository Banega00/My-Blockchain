import {config} from 'dotenv'
import { createServer } from 'http';
import { Server } from 'socket.io';
config()

import app from "./src/app";

const PORT = process.env.PORT ?? 8000

export const server = createServer(app);
server.listen(PORT, () =>{
    console.log(`Server is up, and listening on port ${PORT}`)
})

const serverSocket = new Server(server)
serverSocket.on('connection',()=>{
    console.log('radi')
    serverSocket.on('dogadjaj',()=>{
        console.log("IDEMOOO")
    })
})
