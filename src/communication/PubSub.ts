import { Blockchain } from "../Blockchain";
import { TransactionPool } from "../TransactionPool";
import { Wallet } from "../Wallet";

// const credentials = {
//   publishKey: 'pub-c-432d252e-ed92-4b6f-8f7e-b871eea60424',
//   subscribeKey: 'sub-c-f0f168f1-b3ef-4e8e-b7e9-f9e4d47bce03',
//   secretKey: 'sec-c-ZDNkNjdlZDEtNDMyOS00OTM2LWFjOTktYzY1NDk1ZTA5NTk2'
// };

export const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
};

export enum PubSubType{
  REDIS = 'REDIS',
  PUBNUB = 'PUBNUB'
}

export type MessageEvent = {message: string, channel: string};

export abstract class PubSub {
  public blockchain: Blockchain;
  public transactionPool: TransactionPool;
  public wallet: Wallet;

  constructor() {

    console.log('PubSub initialized');
  }

  abstract subscribeToChannels():void;
  abstract handleMessage(message?:MessageEvent):void;
  abstract publish(message:MessageEvent):void;

  broadcastChain() {
    console.log('CHAIN BROADCASTED!');
    
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }

  broadcastTransaction(transaction) {
    console.log('TRANSACTION BROADCASTED!');
    
    this.publish({
        channel: CHANNELS.TRANSACTION,
        message: JSON.stringify(transaction)
    });
}
}