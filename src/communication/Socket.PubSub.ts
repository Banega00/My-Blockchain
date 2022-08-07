import { MessageEvent, PubSub } from "./PubSub";
import { Server } from "socket.io";
import { server } from "../../main";
import { io, Socket } from "socket.io-client";


export class SocketPubSub extends PubSub{

    private serverSocket:Server;
    private clientSocket:Socket;
    constructor() {
        super();
        
        // this.serverSocket = new Server(server);
        // console.log(`Socket is listening...`)

        // this.serverSocket.on('connection', function (socket) {
        //     console.log('connected:', socket.client);
        //     socket.on('serverEvent', function (data) {
        //         console.log('new message from client:', data);
        //     });
        // })
        
        // this.clientSocket = io()
        // console.log(this.clientSocket.connected)
        // this.clientSocket.emit('serverEvent','desiiiiiiiiiii')
    }

    subscribeToChannels(): void {
        throw new Error("Method not implemented.");
    }
    handleMessage(message?: MessageEvent | undefined): void {
        throw new Error("Method not implemented.");
    }
    publish(message: MessageEvent): void {
        throw new Error("Method not implemented.");
    }

}