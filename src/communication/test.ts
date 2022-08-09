import { PubSubType } from "./PubSub";
import { PubSubFactory } from "./PubSubFactory";
import { config } from 'dotenv'
import { RedisPubSub } from "./Redis.PubSub";
import { io, connect } from "socket.io-client";
config()


// const pubSub = PubSubFactory.getInstance(PubSubType.REDIS);
// pubSub.publish({channel:'TEST',message:'PORUKA'})

const clientSocket = io('http://localhost:3001');
const clientSocket2 = connect('http://localhost:3001');
clientSocket.emit('serverEvent','desiiiiii')
console.log(clientSocket.connected)
console.log(clientSocket2.connected)