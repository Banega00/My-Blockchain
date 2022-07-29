import { PubSubType } from "./PubSub";
import { PubSubFactory } from "./PubSubFactory";
import { config } from 'dotenv'
config()

const pubSub = PubSubFactory.getInstance(PubSubType.PUBNUB);

pubSub.publish({channel:'TEST',message:'PORUKA'})