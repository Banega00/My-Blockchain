import { CommunicationType, Communication } from "./Communication";
import { P2P } from "./P2P";
import { PubSubType } from "./PubSub";
import { PubSubFactory } from "./PubSubFactory";

export class CommunicationFactory {

    public static getInstance = (type?: CommunicationType): Communication => {

        const communicationType = type ?? process.env.communicationType;

        if (!communicationType) throw new Error('PubSub Type not specified!');


        switch (communicationType) {
            case PubSubType.REDIS:
            case PubSubType.PUBNUB:
            case PubSubType.SOCKET:
                return PubSubFactory.getInstance(communicationType as PubSubType)
            case CommunicationType.P2P:
                console.log('INITIALIZING P2P communication')
                return new P2P()
            default:
                throw new Error("Unknown PubSub type!")
        }
    }
}