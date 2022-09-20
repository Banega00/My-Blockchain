import { Blockchain } from './Blockchain';
import { TransactionPool } from './TransactionPool';
import { Wallet } from './Wallet';
import { PubSub } from './communication/PubSub'
import { Transaction } from './Transaction';
import { P2P } from './communication/P2P';
import { Communication } from './communication/Communication';

export class TransactionMiner {
  private blockchain:Blockchain;
  private transactionPool: TransactionPool;
  private wallet: Wallet;
  private communication: Communication;
  constructor(object:{ blockchain, transactionPool, wallet, communication }) {
    const {blockchain, transactionPool, wallet, communication} = object;
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.communication = communication;
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

    this.communication.broadcastChain();

    this.transactionPool.clear();
  }
}

