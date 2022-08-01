import { Blockchain } from "../Blockchain";
import { TransactionPool } from "../TransactionPool";
import { Wallet } from "../Wallet";
import { PubNubPubSub } from "./PubNub.PubSub";
import { PubSub, PubSubType } from "./PubSub";
import { RedisPubSub } from "./Redis.PubSub";

export class PubSubFactory {
    public static getInstance = (type?: PubSubType): PubSub => {
        
        const pubSubType = type ?? process.env.PubSubType;

        if (!pubSubType) throw new Error('PubSub Type not specified!');


        switch (pubSubType) {
            case PubSubType.REDIS:
                const url = process.env.redisUrl;
                return new RedisPubSub({url, legacyMode: true})
            break;
            case PubSubType.PUBNUB:
                const publishKey = process.env.pubnub_publishKey;
                const subscribeKey = process.env.pubnub_subscribeKey
                const secretKey = process.env.pubnub_secretKey
                if(!publishKey || !subscribeKey || !secretKey) throw new Error('PubNub credentials missing!');
                return new PubNubPubSub({publishKey, subscribeKey, secretKey})
            break;
            default:
                throw new Error("Unknown PubSub type!")
        }
    }
}