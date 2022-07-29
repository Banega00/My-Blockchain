import { Blockchain } from "../Blockchain";
import { TransactionPool } from "../TransactionPool";

import { createClient, RedisClientOptions } from 'redis';
import { PubSub, MessageEvent, CHANNELS } from "./PubSub";
import { Wallet } from "../Wallet";

export class RedisPubSub extends PubSub{
    private publisher;
    private subscriber;
        
    constructor(redisUrl: RedisClientOptions) {
        super();
        
        this.publisher = createClient(redisUrl);
        this.subscriber = createClient(redisUrl);

        console.log('Successfully connected to Redis PubSub')

        this.subscribeToChannels();

        console.log('Successfully subscribed to Redis Channels:', Object.values(CHANNELS).join(" "))

        this.subscriber.on(
            'message',
            (channel, message) => this.handleMessage({channel, message})
        );
    }

    subscribeToChannels() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        });
    }

    publish({ channel, message }) {
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel);
            });
        });
    }

    handleMessage(messageEvent:MessageEvent) {
        const {channel, message} = messageEvent;
        console.log(`Message received. Channel: ${channel}. Message: ${message}.`);

        const parsedMessage = JSON.parse(message);

        switch (channel) {
            case CHANNELS.BLOCKCHAIN:
                this.blockchain.replaceChain(parsedMessage, true, () => {
                    this.transactionPool.clearBlockchainTransactions({
                        chain: parsedMessage
                    });
                });
                break;
            case CHANNELS.TRANSACTION:
                console.log('TRANSACTION ARRIVED!');
                
                this.transactionPool.setTransaction(parsedMessage);
                break;
            default:
                return;
        }
    }
}