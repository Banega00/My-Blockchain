import { MessageEvent, PubSub } from "./PubSub";
import { Server, Socket } from "socket.io";
import { PORT, server } from "../../main";
import { io, Socket as ClientSocket } from "socket.io-client";

interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    'new-peer': (connectionUrl:string) => void
}

interface ClientToServerEvents {
    port: (port:number) => void;
    'new-peer': (connctionUrl:string) => void
}

interface InterServerEvents {
    ping: () => void;
    'new-peer': (connectionUrl:string) => void
}

interface SocketData {
    name: string;
    age: number;
}


export class SocketPubSub extends PubSub {

    public serverSocket: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
    public clientSockets: Socket<ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData>[];
    public rootClientSocket: ClientSocket<ServerToClientEvents, ClientToServerEvents>;
    public peersSocket: ClientSocket<ServerToClientEvents, ClientToServerEvents>[];
    //represents connection with root node
    constructor() {
        super();

        this.clientSockets = [];
        this.peersSocket = [];
        setTimeout(() => {
            this.serverSocket = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server);
            console.log(`Socket is listening for connections`)

            this.serverSocket.on('connection', (socket) => {
                console.log('Established connection with new peer')


                //only root node should receive info about port
                if (process.env.IS_ROOT_NODE?.toLowerCase() == 'true') {
                    socket.on('port', (port) => {
                        const clientSocketConnectionURL = `http://${socket.handshake.address}:${port}`;

                        //broadcast to all other peers info about new peer
                        this.clientSockets.forEach(socket =>{
                            socket.emit('new-peer', clientSocketConnectionURL)
                        })

                        this.clientSockets.push(socket);
                    });
                }

                this.serverSocket.on('new-peer',connectionUrl =>{
                    //send new peer connection request
                    const newPeerSocket:ClientSocket<ServerToClientEvents, ClientToServerEvents> = io(connectionUrl);
                    this.peersSocket.push(newPeerSocket);
                })

                
            })

            setTimeout(() => {
                //first connect to root node
                //ONLY if you are not root node - avoid connecting root node with itself
                if (process.env.IS_ROOT_NODE?.toLowerCase() != 'false') return;

                const rootNodeUrl = process.env.ROOT_NODE_URL;
                if (!rootNodeUrl) throw new Error('Missing root node url')

                this.rootClientSocket = io(rootNodeUrl);

                //send info about your port to root node - so it can broadcast to it to all other peers - so they can connect back to your server socket
                this.rootClientSocket.emit('port', +PORT)

                
            }, 0)
        }
            , 0)


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