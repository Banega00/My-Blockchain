import { Blockchain } from './Blockchain';
import { TransactionPool } from './TransactionPool';
import { Wallet } from './Wallet';
import { PubSub } from './communication/PubSub'
import { Transaction } from './Transaction';

export class TransactionMiner {
  private blockchain:Blockchain;
  private transactionPool: TransactionPool;
  private wallet: Wallet;
  private pubsub: PubSub;
  constructor(object:{ blockchain, transactionPool, wallet, pubsub }) {
    const {blockchain, transactionPool, wallet, pubsub} = object;
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }

  mineTransactions() {
    const validTransactions = this.transactionPool.validTransactions();

    if(!validTransactions || validTransactions.length <= 0){
      throw new Error('No transaction in transaction pool')
    }

    validTransactions.push(
      Transaction.rewardTransaction({ minerWallet: this.wallet })
    );

    this.blockchain.addBlock({ data: validTransactions });

    this.pubsub.broadcastChain();

    this.transactionPool.clear();
  }
}