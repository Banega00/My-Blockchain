import { Wallet } from "./Wallet";
import { v4 as uuidv4 } from 'uuid';
import { verifySignature } from "./helpers";
import { REWARD_INPUT, MINING_REWARD } from "./config";

export class Transaction {
  public id: string;
  public outputMap:{recipient?: any, [key:string]:number};
  public input:{timestamp: number, amount: number, address: Wallet['publicKey'], signature:any};
  
  constructor(obj:{ id?:string, senderWallet?: Wallet, recipient?: Wallet['publicKey'], amount?:number, outputMap?: Transaction['outputMap'], input?:any }) {
    const {id, senderWallet, recipient, amount, outputMap, input} = obj;
    this.id = id ?? uuidv4();
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
      this.outputMap[recipient] = amount;//if recipient is new
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;//if same recipient already exists in transaction
    }

    this.outputMap[senderWallet.publicKey] =
      this.outputMap[senderWallet.publicKey] - amount;//reduce sender remaining value

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