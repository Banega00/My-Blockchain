import axios from "axios";
import { Block } from "./Block";
import { MINING_REWARD, REWARD_INPUT } from "./config";
import { calculateHash, concatAndStringify } from "./helpers";
import { Transaction } from "./Transaction";
import { Wallet } from "./Wallet";
import hexToBinary from 'hex-to-binary';

export class Blockchain {
    public chain:Block[];
    constructor(chain?:Block[]) {
      this.chain = chain ?? [Block.genesis()];
    }
  
    addBlock({ data }) {
      const newBlock = Block.mineBlock({
        lastBlock: this.chain[this.chain.length-1],
        data
      });
  
      this.chain.push(newBlock);
    }
  
    replaceChain(chain: Block[], validateTransactions: boolean, onSuccess: Function) {
      if (chain.length <= this.chain.length) {
        console.error('The incoming chain must be longer');
        return;
      }
  
      if (!Blockchain.isValidChain(chain)) {
        console.error('The incoming chain must be valid');
        return;
      }
  
      if (validateTransactions && !this.validTransactionData({ chain })) {
        console.error('The incoming chain has invalid data');
        return;
      }
      
      console.log('replacing chain with', chain);
      this.chain = chain;
  
      if (onSuccess) onSuccess();
    }
  
    validTransactionData({ chain }) {
      for (let i=1; i<chain.length; i++) {
        const block = chain[i];
        const transactionSet = new Set();
        let rewardTransactionCount = 0;
  
        for (let transaction of block.data) {
          if (transaction.input.address === REWARD_INPUT.address) {
            rewardTransactionCount += 1;
  
            if (rewardTransactionCount > 1) {
              console.error('Miner rewards exceed limit');
              return false;
            }
  
            if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
              console.error('Miner reward amount is invalid');
              return false;
            }
          } else {
            if (!Transaction.validTransaction(transaction)) {
              console.error('Invalid transaction');
              return false;
            }
  
            const trueBalance = Wallet.calculateBalance({
              chain: this.chain.slice(0,i),
              address: transaction.input.address
            });
  
            if (transaction.input.amount !== trueBalance) {
              console.error('Invalid input amount');
              return false;
            }
  
            if (transactionSet.has(transaction)) {
              console.error('An identical transaction appears more than once in the block');
              return false;
            } else {
              transactionSet.add(transaction);
            }
          }
        }
      }
  
      return true;
    }
  
    static isValidChain(chain:Blockchain['chain']) {
      if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
        return false
      };
  
      for (let i=1; i<chain.length; i++) {
        //validate every single block
        const { timestamp, previousHash, hash, nonce, difficulty, data } = chain[i];
        const actualLastHash = chain[i-1].hash;
        const lastDifficulty = chain[i-1].difficulty;
  
        if (previousHash !== actualLastHash) return false;
  
        const validatedHash = hexToBinary(calculateHash(concatAndStringify(timestamp, previousHash, data, nonce, difficulty)));
  
        if (hash !== validatedHash) return false;
  
        if (Math.abs(lastDifficulty - difficulty) > 1) return false;
      }
  
      return true;
    }

    public static syncChain = async () =>{
      const blocks = await axios({method:'GET',url:`${process.env.ROOT_NODE_URL}/api/blocks`})
      const transactionMap = await axios({method:'GET',url:`${process.env.ROOT_NODE_URL}/api/transaction-pool-map`})
      return { blocks: blocks.data, transactionMap: transactionMap.data};
  }
  }