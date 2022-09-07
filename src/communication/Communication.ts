import { Blockchain } from "../Blockchain";
import { Transaction } from "../Transaction";
import { TransactionPool } from "../TransactionPool";
import { Wallet } from "../Wallet";
import { PubSubType } from "./PubSub";
import { PubSubFactory } from "./PubSubFactory";

export abstract class Communication {
    public blockchain: Blockchain;
    public transactionPool: TransactionPool;
    public wallet: Wallet;
    public abstract broadcastChain();
    public abstract broadcastTransaction(transaction: Transaction);

    constructor() {
        
    }
}

export enum CommunicationType {
    REDIS = 'REDIS',
    PUBNUB = 'PUBNUB',
    SOCKET = "SOCKET",
    P2P = "P2P"
}


