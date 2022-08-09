import { Blockchain } from "../Blockchain";

import { createClient, RedisClientOptions } from 'redis';
import { PubSub, MessageEvent, CHANNELS } from "./PubSub";
import { Wallet } from "../Wallet";
import { saveBlockchainState } from "../storage/state-management";
import { Transaction } from "../Transaction";

export class RedisPubSub extends PubSub{
    
    private publisher:ReturnType<typeof createClient>;
    private subscriber:ReturnType<typeof createClient>;
        
    constructor(redisConfig: RedisClientOptions) {
        super();
        
        this.publisher = createClient(redisConfig);
        this.subscriber = createClient(redisConfig);

        console.log('Successfully connected to Redis PubSub')

        this.subscribeToChannels();

        console.log('Successfully subscribed to Redis Channels:', Object.values(CHANNELS).join(" "))

        this.subscriber.on(
            'message',
            (channel, message) => this.handleMessage({channel, message})
        );

        this.publish({'message':'test poruika', channel: CHANNELS.TEST})
    }

    subscribeToChannels() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        });
    }

    publish({ channel, message }) {
        // this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () =>{
                // this.subscriber.subscribe(channel);
            });
        // });
    }

    handleMessage(messageEvent:MessageEvent) {
        const {channel, message} = messageEvent;
        console.log(`Message received. Channel: ${channel}. Message: ${message}.`);

        let parsedMessage:any = message;
        try{
            parsedMessage = JSON.parse(message);
        }catch(error){
            //this is parsing error - that means message is not an object, rather is string
        }

        switch (channel) {
            case CHANNELS.BLOCKCHAIN:
                const chain: Blockchain['chain'] = parsedMessage;
                this.blockchain.replaceChain(chain, true, () => {
                    this.transactionPool.clearBlockchainTransactions(
                        { chain: chain }
                    );
                });
                break;
            case CHANNELS.TRANSACTION:
                const newTranscation = new Transaction({ id: parsedMessage.id, outputMap: parsedMessage.outputMap, input: parsedMessage.input });
                this.transactionPool.setTransaction(newTranscation)
                break;
            default:
                break;
        }
        saveBlockchainState({ blockchain: this.blockchain, wallet: this.wallet, transactionPool: this.transactionPool })
    }
}