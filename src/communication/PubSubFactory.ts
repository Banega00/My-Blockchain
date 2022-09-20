import { Blockchain } from "../Blockchain";
import { env } from "../helpers";
import { TransactionPool } from "../TransactionPool";
import { Wallet } from "../Wallet";
import { PubNubPubSub } from "./PubNub.PubSub";
import { PubSub, PubSubType } from "./PubSub";
import { RedisPubSub } from "./Redis.PubSub";
import { SocketPubSub } from "./Socket.PubSub";

export class PubSubFactory {
    public static getInstance = (type?: PubSubType): PubSub => {
        
        const pubSubType = type ?? env.pubSubType;

        if (!pubSubType) throw new Error('PubSub Type not specified!');


        switch (pubSubType) {
            case PubSubType.REDIS:
                const url = env.redis.url;
                return new RedisPubSub({url, legacyMode: true})
            break;
            case PubSubType.PUBNUB:
                const publishKey = env.pubnub.publishKey;
                const subscribeKey = env.pubnub.subscribeKey
                const secretKey = env.pubnub.secretKey
                if(!publishKey || !subscribeKey || !secretKey) throw new Error('PubNub credentials missing!');
                return new PubNubPubSub({publishKey, subscribeKey, secretKey})
            break;
            case PubSubType.SOCKET:
                return new SocketPubSub()
            break;
            default:
                throw new Error("Unknown PubSub type!")
        }
    }
}