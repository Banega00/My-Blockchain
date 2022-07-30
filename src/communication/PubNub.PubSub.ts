import PubNub from 'pubnub';
import { v4 as uuidv4 } from 'uuid';
import { Blockchain } from '../Blockchain';
import { saveBlockchainState } from '../storage/state-management';
import { Transaction } from '../Transaction';
import { CHANNELS, PubSub } from './PubSub';



export class PubNubPubSub extends PubSub {


    private pubnub: PubNub;

    constructor(pubNubCredentials: { publishKey: string, subscribeKey: string, secretKey: string }) {
        super();
        this.pubnub = new PubNub({ ...pubNubCredentials, uuid: uuidv4() });

        console.log('Successfully connected to PubNub')

        this.subscribeToChannels();

        console.log('Successfully subscribed to PubNub Channels')

        this.pubnub.addListener(this.handleMessage());

    }

    subscribeToChannels() {
        this.pubnub.subscribe({
            channels: Object.values(CHANNELS)
        });
    }

    handleMessage() {
        return {
            message: messageObject => {
                const { channel, message } = messageObject;

                console.log(`Message received. Channel: ${channel}. Message: ${message}`);
                const parsedMessage = JSON.parse(message);

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
    }

    publish({ channel, message }) {
        // there is an unsubscribe function in pubnub
        // but it doesn't have a callback that fires after success
        // therefore, redundant publishes to the same local subscriber will be accepted as noisy no-ops
        this.pubnub.publish({ message, channel });
    }
}

