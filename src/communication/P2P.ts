import { Blockchain } from "../Blockchain";
import { saveBlockchainState } from "../storage/state-management";
import { Transaction } from "../Transaction";
import { TransactionPool } from "../TransactionPool";
import { Wallet } from "../Wallet";
import { EventEmitter } from "events";
import { Communication } from "./Communication";
import { env } from "../helpers";
const net = require('net')

const PORT = env.p2p_port
const ROOT_ADDRESS = env.root_node_p2p_address ?? '::ffff:127.0.0.1';
const ROOT_PORT = env.root_node_p2p_port!;

const rootPeer: { address: string, port: number, id?: string } = { address: ROOT_ADDRESS, port: ROOT_PORT }
let peers = [rootPeer] //this is previously connected sockets

export type MessageEvent = { message: string, type: string };

const randomString = (len = 10) => {
    return Math.random().toString(36).substring(2, len + 2);
}

export class P2P extends Communication{
    public blockchain: Blockchain;
    public transactionPool: TransactionPool;
    public wallet: Wallet;

    private eventEmiiter: EventEmitter;
    constructor() {
        super();
        this.eventEmiiter = new EventEmitter()
        //CLIENT PART
        const p2p = this;
        
        let socket = net.connect(ROOT_PORT, ROOT_ADDRESS, () => {
            
            sendMessage(socket, { type: 'port', port: PORT })
            socket.id = randomString(10);
            rootPeer.id = socket.id
            socket.on('data', data => {
                const message = JSON.parse(data.toString());
                switch (message.type) {
                    case 'peers':
                        peers = addMissingPeers(peers, message.peers);
                        peers.forEach(peer => {
                            //because you are already connected to root server
                            if (peer.address == ROOT_ADDRESS && peer.port == ROOT_PORT) return;

                            connectToPeer(peer)
                        })
                        break;
                    case 'message':
                        console.log(message.message);
                        break;
                    case 'blockchain':
                        const chain: Blockchain['chain'] = message.message.chain;
                        
                        p2p.blockchain.replaceChain(chain, true, () => {
                            p2p.transactionPool.clearBlockchainTransactions(
                                { chain: chain }
                            );
                        });
                        break;
                    case 'transaction':
                        const transaction = message.message.transaction
                        const newTranscation = new Transaction({ id: transaction.id, outputMap: transaction.outputMap, input: transaction.input });
                        p2p.transactionPool.setTransaction(newTranscation)
                        break;
                }
                saveBlockchainState({ blockchain: p2p.blockchain, wallet: p2p.wallet, transactionPool: p2p.transactionPool })
            })

            p2p.eventEmiiter.on('message', data=>{
                switch(data.type){
                    case 'broadcastChain':
                        sendMessage(socket, {type:'blockchain', message: data.message})
                        break;
                    case 'broadcastTransaction':
                        sendMessage(socket, {type:'transaction', message: data.message})
                        break;
                }
            })

            process.stdin.on('data', data => {
                if (socket.destroyed) return;
                sendMessage(socket, { type: 'message', message: data.toString() })
            })

            socket.on('close', () => {
                console.log("Removing", socket.id)
                peers = peers.filter(peer => peer.id != socket.id)
                console.log(peers.map(peer => {
                    return { id: peer.id, port: peer.port }
                }));
                socket.destroy()
            })
        })

        function addMissingPeers(oldPeers, newPeers) {
            for (const newPeer of newPeers) {
                if (oldPeers.some(peer => peer.address == newPeer.address && peer.port == newPeer.port)) continue;

                oldPeers.push(newPeer)
            }
            return oldPeers
        }

        function connectToPeer(peer) {
            console.log('Connecting to client', peer.port)
            let socket = net.connect(peer.port, peer.address, () => {
                socket.id = randomString(10);
                peer.id = socket.id;
                socket.on('data', data => {
                    const message = JSON.parse(data.toString());
                    switch (message.type) {
                        case 'message':
                            console.log(message.message);
                            break;
                        case 'blockchain':
                            const chain: Blockchain['chain'] = message.message.chain;
                            
                            p2p.blockchain.replaceChain(chain, true, () => {
                                p2p.transactionPool.clearBlockchainTransactions(
                                    { chain: chain }
                                );
                            });
                            break;
                        case 'transaction':
                            const transaction = message.message.transaction
                            const newTranscation = new Transaction({ id: transaction.id, outputMap: transaction.outputMap, input: transaction.input });
                            p2p.transactionPool.setTransaction(newTranscation)
                            break;
                    }
                    saveBlockchainState({ blockchain: p2p.blockchain, wallet: p2p.wallet, transactionPool: p2p.transactionPool })
                })

                sendMessage(socket, { type: 'peer-port', port: PORT })

                process.stdin.on('data', data => {
                    if (socket.destroyed) return;

                    sendMessage(socket, { type: 'message', message: data.toString() })
                })

                socket.on('close', () => {
                    console.log("Removing", socket.id)
                    peers = peers.filter(peer => peer.id != socket.id)
                    console.log(peers.map(peer => peer.port));
                    socket.destroy()
                })

                p2p.eventEmiiter.on('message', data=>{
                    switch(data.type){
                        case 'broadcastChain':
                            sendMessage(socket, {type:'blockchain', message: data.message})
                            break;
                        case 'broadcastTransaction':
                            sendMessage(socket, {type:'transaction', message: data.message})
                            break;
                    }
                })
            })
        }

        //SERVER PART
        const server = net.createServer(function (socket) {
            socket.id = randomString(10);
            console.log('Client connected', socket.id)

            socket.on('data', data => {
                const message = JSON.parse(data.toString());
                switch (message.type) {
                    case 'port':
                        sendMessage(socket, { type: 'peers', peers })
                        peers = addMissingPeers(peers, [{ id: socket.id, address: socket.remoteAddress, port: message.port }])
                        break;
                    case 'peer-port':
                        peers = addMissingPeers(peers, [{ id: socket.id, address: socket.remoteAddress, port: message.port }])
                        break;
                    case 'message':
                        console.log(message.message);
                        break;
                    case 'blockchain':
                        const chain: Blockchain['chain'] = message.message.chain;
                        
                        p2p.blockchain.replaceChain(chain, true, () => {
                            p2p.transactionPool.clearBlockchainTransactions(
                                { chain: chain }
                            );
                        });
                        break;
                    case 'transaction':
                        const transaction = message.message.transaction
                        const newTranscation = new Transaction({ id: transaction.id, outputMap: transaction.outputMap, input: transaction.input });
                        p2p.transactionPool.setTransaction(newTranscation)
                        break;
                }
                saveBlockchainState({ blockchain: p2p.blockchain, wallet: p2p.wallet, transactionPool: p2p.transactionPool })
            })

            p2p.eventEmiiter.on('message', data=>{
                switch(data.type){
                    case 'broadcastChain':
                        sendMessage(socket, {type:'blockchain', message: data.message})
                        break;
                    case 'broadcastTransaction':
                        sendMessage(socket, {type:'transaction', message: data.message})
                        break;
                }
            })

            process.stdin.on('data', data => {
                if (socket.destroyed) return;

                sendMessage(socket, { type: 'message', message: data.toString() })
            })

            socket.on('close', () => {
                console.log("Removing", socket.id)
                peers = peers.filter(peer => peer.id != socket.id)
                console.log(peers.map(peer => peer.port));
                socket.destroy()
            })
        })

        function sendMessage(socket, message) {
            socket.write(JSON.stringify(message))
        }

        server.listen(PORT)
    }

    broadcastChain() {
        console.log('CHAIN BROADCASTED!');

        this.eventEmiiter.emit('message', {type: 'broadcastChain', message:{chain: this.blockchain.chain}})
    }

    broadcastTransaction(transaction: Transaction) {
        console.log('TRANSACTION BROADCASTED!');

        this.eventEmiiter.emit('message', {type: 'broadcastTransaction', message: {transaction: transaction}})
    }

    handleMessage(messageEvent: MessageEvent) {
        const { type, message } = messageEvent;

        let parsedMessage: any = message;
        try {
            parsedMessage = JSON.parse(message);
        } catch (error) {
            //this is parsing error - that means message is not an object, rather is string
        }

        switch (type) {
            case 'blockchain':
                const chain: Blockchain['chain'] = parsedMessage;
                this.blockchain.replaceChain(chain, true, () => {
                    this.transactionPool.clearBlockchainTransactions(
                        { chain: chain }
                    );
                });
                break;
            case 'transaction':
                const newTranscation = new Transaction({ id: parsedMessage.id, outputMap: parsedMessage.outputMap, input: parsedMessage.input });
                this.transactionPool.setTransaction(newTranscation)
                break;
            default:
                break;
        }
        saveBlockchainState({ blockchain: this.blockchain, wallet: this.wallet, transactionPool: this.transactionPool })
    }
}



