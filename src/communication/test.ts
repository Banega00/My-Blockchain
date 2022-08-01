import { PubSubType } from "./PubSub";
import { PubSubFactory } from "./PubSubFactory";
import { config } from 'dotenv'
import { RedisPubSub } from "./Redis.PubSub";
config()


const pubSub = PubSubFactory.getInstance(PubSubType.REDIS);
pubSub.publish({channel:'TEST',message:'PORUKA'})