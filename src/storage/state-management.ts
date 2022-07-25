import { readFileSync, writeFileSync } from "fs"
import { Blockchain } from "../Blockchain"
import { TransactionPool } from "../TransactionPool";
import { Wallet } from "../Wallet";

export interface BlockchainState{
    blockchain: Blockchain;
    transactionPool: TransactionPool;
    wallet: Wallet;
}

export const saveBlockchainState = (newBlockchainState:Partial<BlockchainState>) =>{
    try{
        let blockchainState = getBlockchainState()

        for(const prop in newBlockchainState){
            blockchainState[prop] = newBlockchainState[prop]
        }

        writeFileSync('./data/blockchain-data', JSON.stringify(blockchainState), {encoding:'binary'})

        console.log('Blockchain state saved');
    }catch(error){
        //file does not exists - create new
        writeFileSync('./data/blockchain-data', JSON.stringify(newBlockchainState), {encoding:'binary'})

        console.log('Blockchain state saved');
    }
}

export const getBlockchainState = ():BlockchainState =>{
    let dataBuffer = readFileSync('./data/blockchain-data')
    let blockchainState = JSON.parse(dataBuffer.toString());

    if(blockchainState){
        blockchainState.transactionPool = new TransactionPool(blockchainState.transactionPool.transactionMap)
        blockchainState.wallet = new Wallet({...blockchainState.wallet})
        blockchainState.blockchain = new Blockchain(blockchainState.blockchain.chain);
    }

    return blockchainState;
}