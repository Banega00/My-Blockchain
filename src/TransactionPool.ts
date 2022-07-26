import { Transaction } from "./Transaction";

export class TransactionPool {
    public transactionMap:{[key:string]: Transaction}; //{transactionId: TransactionObject}

    constructor(transactionMap?: TransactionPool['transactionMap']) {
      if(transactionMap){
        Object.entries(transactionMap).forEach(([key, value]) => {
          transactionMap[key] = new Transaction({...value});
        })

      }
      this.transactionMap = transactionMap ?? {}
    }
  
    clear() {
      this.transactionMap = {};
    }
  
    setTransaction(transaction: Transaction) {
      this.transactionMap[transaction.id] = transaction;
    }
  
    setMap(transactionMap:TransactionPool['transactionMap']) {
      this.transactionMap = transactionMap;
    }
  
    existingTransaction({ inputAddress }) {
      const transactions = Object.values(this.transactionMap);
  
      return transactions.find(transaction => transaction.input.address === inputAddress);
    }
  
    validTransactions() {
      return Object.values(this.transactionMap).filter(
        transaction => Transaction.validTransaction(transaction)
      );
    }
  
    clearBlockchainTransactions({ chain }) {
      for (let i=1; i<chain.length; i++) {
        const block = chain[i];
  
        for (let transaction of block.data) {
          if (this.transactionMap[transaction.id]) {
            delete this.transactionMap[transaction.id];
          }
        }
      }
    }
  }