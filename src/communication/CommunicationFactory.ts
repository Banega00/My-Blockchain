import { env } from "../helpers";
import { CommunicationType, Communication } from "./Communication";
import { P2P } from "./P2P";
import { PubSubType } from "./PubSub";
import { PubSubFactory } from "./PubSubFactory";

export class CommunicationFactory {

    public static getInstance = (type?: CommunicationType): Communication => {

        const communication_type = type ?? env.communication_type;

        if (!communication_type) throw new Error('Communication Type not specified!');


        switch (communication_type) {
            case PubSubType.REDIS:
            case PubSubType.PUBNUB:
            case PubSubType.SOCKET:
                return PubSubFactory.getInstance(communication_type as PubSubType)
            case CommunicationType.P2P:
                console.log('INITIALIZING P2P communication')
                return new P2P()
            default:
                throw new Error("Unknown PubSub type!")
        }
    }
}