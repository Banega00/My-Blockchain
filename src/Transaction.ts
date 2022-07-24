import { Wallet } from "./Wallet";
import { uuid } from 'uuidv4';
import { verifySignature } from "./helpers";
import { REWARD_INPUT, MINING_REWARD } from "./config";

export class Transaction {
  private id: string;
  private outputMap:{recipient?: any, [key:string]:number};
  public input:{timestamp: number, amount: number, address: Wallet['publicKey'], signature:any};
  
  constructor(obj:{ senderWallet?: Wallet, recipient?: Wallet['publicKey'], amount?:number, outputMap?: Transaction['outputMap'], input?:any }) {
    const {senderWallet, recipient, amount, outputMap, input} = obj;
    this.id = uuid();
    this.outputMap = outputMap || this.createOutputMap({ senderWallet, recipient, amount });
    this.input = input || this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  createOutputMap({ senderWallet, recipient, amount }) {
    const outputMap = {};

    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

    return outputMap;
  }

  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap)
    };
  }

  update({ senderWallet, recipient, amount }) {
    if (amount > this.outputMap[senderWallet.publicKey]) {
      throw new Error('Amount exceeds balance');
    }

    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    this.outputMap[senderWallet.publicKey] =
      this.outputMap[senderWallet.publicKey] - amount;

    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  static validTransaction(transaction: Transaction) {
    const { input: { address, amount, signature }, outputMap } = transaction;

    const outputTotal = Object.values(outputMap)
      .reduce((total, outputAmount) => total + outputAmount);

    if (amount !== outputTotal) {
      console.error(`Invalid transaction from ${address}`);
      return false;
    }

    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error(`Invalid signature from ${address}`);
      return false;
    }

    return true;
  }

  static rewardTransaction(obj:{ minerWallet:Wallet }) {
    const { minerWallet } = obj;
    return new this({
      input: REWARD_INPUT,
      outputMap: {[minerWallet.publicKey]: MINING_REWARD }
    });
  }
}

module.exports = Transaction;