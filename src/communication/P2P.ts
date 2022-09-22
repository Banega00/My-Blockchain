import { Blockchain } from "../Blockchain";
import { saveBlockchainState } from "../storage/state-management";
import { Transaction } from "../Transaction";
import { TransactionPool } from "../TransactionPool";
import { Wallet } from "../Wallet";
import { EventEmitter } from "events";
import { Communication } from "./Communication";
import { env } from "../helpers";
import net from 'net'

type Socket = net.Socket & {id?: string};

const PORT = env.p2p_port
const ROOT_ADDRESS = env.root_node_p2p_address ?? '::ffff:127.0.0.1';
const ROOT_PORT = env.root_node_p2p_port!;

enum MessageType{
    HANDSHAKE = 'HANDSHAKE',
    PEERS = "PEERS",
    PEER_DATA = "PEER_DATA",
    MESSAGE = "MESSAGE",
    BLOCKCHAIN = "BLOCKCHAIN",
    TRANSACTION = "TRANSACTION"
}

const randomString = (len = 10) => {
    return Math.random().toString(36).substring(2, len + 2);
}

export class P2P extends Communication{
    public blockchain: Blockchain;
    public transactionPool: TransactionPool;
    public wallet: Wallet;

    private eventEmitter: EventEmitter;
    private NODE_ID: string;
    private peers:{[id: string]: any};
    constructor() {
        super();
        this.eventEmitter = new EventEmitter()
        
        this.NODE_ID = randomString();
        this.peers = {}
        console.log(`NODE ${this.NODE_ID} DEPLOYED`)
        this.initialize();
    }

    async initialize() {
        const myLocaleAddress = await this.getLocaleIpAddress();
        //SERVER
        const server = net.createServer(this.handleClientSocket.bind(this))
        server.listen(PORT);

        //CLIENT
        try {
            const clientSocket: Socket = await this.connectClientToServer(ROOT_ADDRESS, ROOT_PORT);
            console.log("Successfully connected to server")
            clientSocket.id = this.NODE_ID
            const address = myLocaleAddress

            this.sendMessage(clientSocket, { type: MessageType.HANDSHAKE, port: PORT, address, node_id: this.NODE_ID })

            this.registerSendMessageOnInput(clientSocket)
            this.registerBlockchainEvents(clientSocket)

            clientSocket.on('data', data => this.handleMessageFromServer(clientSocket, data))


        } catch (error) {
            console.log("Error connecting to server")
            console.log(error);
        }
    }

    handleClientSocket(socket: Socket) {
        this.registerSendMessageOnInput(socket)
        this.registerBlockchainEvents(socket)
        socket.on('data', buffer =>{
            const data = JSON.parse(buffer.toString())
            
            switch(data.type){
                case MessageType.HANDSHAKE:
                    const { node_id, port, address } = data;
                    if(node_id != this.NODE_ID) this.sendAllPeers(socket)
                    this.addNewPeer({node_id, port, address})
                    socket.id = node_id
                    break;
                case MessageType.PEER_DATA:
                    this.peers[data.node_id] = { address: data.address, port: data.port}
                    socket.id = data.node_id                
                    break;
                case MessageType.MESSAGE:
                    console.log(`${data.peer_id}: ${data.message}`)
                    break;
                case MessageType.BLOCKCHAIN:
                    const chain: Blockchain['chain'] = data.message.chain;
                    this.blockchain.replaceChain(chain, true, () => {
                        this.transactionPool.clearBlockchainTransactions(
                            { chain: chain }
                        );
                    });
                    break;
                case MessageType.TRANSACTION:
                    const { id, outputMap, input } = data.message.transaction
                    const newTransaction = new Transaction({ id, outputMap, input });
                    this.transactionPool.setTransaction(newTransaction)
                    break;
            }
        })
        saveBlockchainState({ blockchain: this.blockchain, wallet: this.wallet, transactionPool: this.transactionPool })
        this.closeSocket(socket)
    
        // socket.on('end', socket.end);
        // socket.on('close', socket.end);
    }

    registerBlockchainEvents(socket: Socket){
        this.eventEmitter.on('message', data =>{
            switch(data.type){
                case 'broadcastChain':
                    this.sendMessage(socket, {type: MessageType.BLOCKCHAIN, message: data.message})
                    break;
                case 'broadcastTransaction':
                    this.sendMessage(socket, {type:MessageType.TRANSACTION, message: data.message})
                    break;
            }
        })
        saveBlockchainState({ blockchain: this.blockchain, wallet: this.wallet, transactionPool: this.transactionPool })
    }

    sendAllPeers(socket: net.Socket){
        this.sendMessage(socket, {type: MessageType.PEERS, peers: this.peers, my_root: {id: this.NODE_ID}})
    }
    
    addNewPeer(obj:{node_id: string, port: number, address: string}){
        const { node_id, port, address } = obj;
        if(node_id == this.NODE_ID){
            console.log("HANDSHAKE TO MYSELF")
        }else{
            this.peers[node_id] = {port, address}
            console.log("NEW PEER ADDED", this.peers[node_id])
        }
        console.log("PEERS:", this.peers)
    }

    closeSocket(socket: Socket){
        socket.on('end',()=>{
            console.log(`Connection with socket ${socket.id} closed`)
    
            if(socket.id && this.peers[socket.id]) delete this.peers[socket.id];
    
            socket.end();
        })
    }
    
    connectClientToServer(address: string, port: number): Promise<net.Socket> {
        return new Promise((resolve, reject) => {
            const socket = net.connect({ port: port, host: address,  }, () => {
                resolve(socket)
            }).on('error', (error) => reject(error))
        })
    }

    registerSendMessageOnInput(socket: net.Socket) {
        process.stdin.on('data', data=>{
            if(data.toString().startsWith('peers')){
                console.log("PEEROVI",this.peers)
                return;
            }
            this.sendMessage(socket, { type: MessageType.MESSAGE, message: data.toString(), peer_id: this.NODE_ID})
        })
    }

    handleMessageFromServer(clientSocket: Socket, buffer: Buffer) {
        const data = JSON.parse(buffer.toString())
    
        switch (data.type) {
            case MessageType.PEERS:
                this.peers = data.peers
                
                //connect to all peers except my_root (bcs you are already connected to it)
                for(const peer_id in this.peers){
                    this.connectToPeer(this.peers[peer_id].address, this.peers[peer_id].port, peer_id)
    
                }
                this.peers[data.my_root.id] = { address: ROOT_ADDRESS, port: ROOT_PORT }
                console.log('PEERS RECEIVED', this.peers)
                clientSocket.id = data.my_root.id;
                break;
            case MessageType.MESSAGE:
                console.log(`${data.peer_id}: ${data.message}`)
                break;
            case MessageType.BLOCKCHAIN:
                const chain: Blockchain['chain'] = data.message.chain;
                this.blockchain.replaceChain(chain, true, () => {
                    this.transactionPool.clearBlockchainTransactions(
                        { chain: chain }
                    );
                });
                break;
            case MessageType.TRANSACTION:
                const {id , outputMap, input} = data.message.transaction
                const newTransaction = new Transaction({ id, outputMap, input });
                this.transactionPool.setTransaction(newTransaction)
                break;
        }
        saveBlockchainState({ blockchain: this.blockchain, wallet: this.wallet, transactionPool: this.transactionPool })
        this.closeSocket(clientSocket)
    }

    async connectToPeer(address:string, port:number, peer_id?: string){
        const socket: Socket = await this.connectClientToServer(address, port);
    
        const myLocaleAddress = await this.getLocaleIpAddress();
        this.sendMessage(socket, {type: MessageType.PEER_DATA, node_id: this.NODE_ID, port: PORT, address: myLocaleAddress })
    
        console.log("Successfully connected to peer", peer_id)
        socket.id = peer_id;
        socket.on('data', data => this.handleMessageFromServer(socket, data))
        this.registerSendMessageOnInput(socket)
        this.registerBlockchainEvents(socket)
    
        this.closeSocket(socket)
    }

    getLocaleIpAddress() {
        return new Promise((resolve, reject) => {
            require('dns').lookup(require('os').hostname(), function (_, address, __) {
                resolve(address);
            })
        })
    }

    sendMessage(socket: Socket, message: any) {
        if (socket.destroyed || socket.isPaused()) return;
    
        socket.write(JSON.stringify(message));
    }

    randomString = (len = 10) => {
        return Math.random().toString(36).substring(2, len + 2);
    }
    

    

    broadcastChain() {
        console.log('CHAIN BROADCASTED!');

        this.eventEmitter.emit('message', {type: 'broadcastChain', message:{chain: this.blockchain.chain}})
    }

    broadcastTransaction(transaction: Transaction) {
        console.log('TRANSACTION BROADCASTED!');

        this.eventEmitter.emit('message', {type: 'broadcastTransaction', message: {transaction: transaction}})
    }

    // handleMessage(messageEvent: MessageEvent) {
    //     const { type, message } = messageEvent;

    //     let parsedMessage: any = message;
    //     try {
    //         parsedMessage = JSON.parse(message);
    //     } catch (error) {
    //         //this is parsing error - that means message is not an object, rather is string
    //     }

    //     switch (type) {
    //         case 'blockchain':
    //             const chain: Blockchain['chain'] = parsedMessage;
    //             this.blockchain.replaceChain(chain, true, () => {
    //                 this.transactionPool.clearBlockchainTransactions(
    //                     { chain: chain }
    //                 );
    //             });
    //             break;
    //         case 'transaction':
    //             const newTranscation = new Transaction({ id: parsedMessage.id, outputMap: parsedMessage.outputMap, input: parsedMessage.input });
    //             this.transactionPool.setTransaction(newTranscation)
    //             break;
    //         default:
    //             break;
    //     }
    //     saveBlockchainState({ blockchain: this.blockchain, wallet: this.wallet, transactionPool: this.transactionPool })
    // }
}



