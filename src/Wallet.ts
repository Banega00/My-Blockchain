import { ec } from "elliptic";
import { Blockchain } from "./Blockchain";
import { STARTING_BALANCE } from "./config";
import { calculateHash, concatAndStringify, ecliptic } from "./helpers";
import { Transaction } from "./Transaction";

export class Wallet {
  private balance: number;
  private keyPair: ec.KeyPair
  public publicKey: string;
  constructor() {
    this.balance = STARTING_BALANCE;
    this.keyPair = ecliptic.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex', true);
  }

  sign(data) {
    return this.keyPair.sign(calculateHash(concatAndStringify(data)))
  }

  createTransaction(obj:{ recipient: Wallet['publicKey'], amount:number, chain: Blockchain['chain'] }) {
    const {recipient, amount, chain} = obj;
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey
      });
    }

    if (amount > this.balance) {
      throw new Error('Amount exceeds balance');
    }

    return new Transaction({ senderWallet: this, recipient, amount });
  }

  //calculate balance of specific wallet (by its public key)
  static calculateBalance(obj:{ chain: Blockchain['chain'], address: Wallet['publicKey'] }) {
    const { chain, address } = obj;

    let hasConductedTransaction = false;
    let outputsTotal = 0;

    for (let i=chain.length-1; i>0; i--) {
      const block = chain[i];

      for (let transaction of block.data) {
        if (transaction.input.address === address) {
          hasConductedTransaction = true;
        }

        const addressOutput = transaction.outputMap[address];

        if (addressOutput) {
          outputsTotal = outputsTotal + addressOutput;
        }
      }

      if (hasConductedTransaction) {
        break;
      }
    }

    return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
  }
};
