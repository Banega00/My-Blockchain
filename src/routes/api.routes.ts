import { Request, response, Response, Router } from "express";
import { Blockchain } from "../Blockchain";
import { PubSubFactory } from "../communication/PubSubFactory";
import { TransactionMiner } from "../TransactionMiner";
import { TransactionPool } from "../TransactionPool";
import { Wallet } from "../Wallet";
import { BlockchainState, getBlockchainState, saveBlockchainState } from "../storage/state-management";
import { Transaction } from "../Transaction";

let blockchain: Blockchain;
let transactionPool: TransactionPool;
let wallet: Wallet;

const pubsub = PubSubFactory.getInstance();

try {

    let initialData: BlockchainState = getBlockchainState();

    if (!initialData) throw new Error("No initial data")
    if (!initialData.blockchain || !initialData.transactionPool || !initialData.wallet) throw new Error("Invalid initial data")


    blockchain = initialData.blockchain;
    transactionPool = initialData.transactionPool
    wallet = initialData.wallet;

} catch (error) {
    //create new initial data
    console.log(error);

    blockchain = new Blockchain();
    transactionPool = new TransactionPool();
    wallet = new Wallet();

    saveBlockchainState({ blockchain, transactionPool, wallet })
}

pubsub.blockchain = blockchain;
pubsub.transactionPool = transactionPool;
pubsub.wallet = wallet;


if (process.env.ROOT_NODE_URL != `http://localhost:${process.env.PORT}/api`) {

    Blockchain.syncChain()
        .then((response) => {
            console.log("CHAIN SYNCED");

            blockchain.chain = response.blocks;
            transactionPool.transactionMap = response.transactionMap;
        })
        .catch(error => {
            console.log(error)
            process.exit(-1)
        })
}

console.log(`Wallet address ${wallet.publicKey}`)

const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

const router = Router();

router.get('/blocks', (request: Request, response: Response) => {
    response.json(blockchain.chain);
});

router.get('/blocks/length', (request: Request, response: Response) => {
    response.json(blockchain.chain.length);
});

router.get('/blocks/:id', (request: Request, response: Response) => {
    const { id: idString } = request.params;
    const { length } = blockchain.chain;

    const blocksReversed = blockchain.chain.slice().reverse();

    let id = +idString;//converting to int

    let startIndex = (id - 1) * 5;
    let endIndex = id * 5;

    startIndex = startIndex < length ? startIndex : length;
    endIndex = endIndex < length ? endIndex : length;

    response.json(blocksReversed.slice(startIndex, endIndex));
});

router.post('/mine', (request: Request, response: Response) => {
    const { data } = request.body;

    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    response.redirect('/api/blocks');

    saveBlockchainState({ blockchain, wallet, transactionPool })
});

//add transaction to transaction pool
router.post('/transact', (
    request: Request<null, null, { amount: number, recipient: string }>,
    response: Response) => {

    const { amount, recipient } = request.body;

    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });
    
    try {
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount });
        } else {
            transaction = wallet.createTransaction({
                recipient,
                amount,
                chain: blockchain.chain
            });
        }
    } catch (error: any) {
        console.log(error);

        return response.status(400).json({ type: 'error', message: error.message });
    }

    //insert transaction in your own transaction pool
    transactionPool.setTransaction(transaction);

    //broadcast transaction to other nods in the network
    pubsub.broadcastTransaction(transaction);

    response.json({ type: 'success', transaction });
    saveBlockchainState({ blockchain, wallet, transactionPool })
});

//get transactions from transaction pool
router.get('/transaction-pool-map', (request: Request, response: Response) => {
    response.json(transactionPool.transactionMap);
});

router.post('/mine-transactions', (request: Request, response: Response) => {
    transactionMiner.mineTransactions();

    response.redirect('/api/blocks');
    saveBlockchainState({ blockchain, wallet, transactionPool })
});

//get info about your own wallet
router.get('/wallet-info', (request: Request, response: Response) => {
    const address = wallet.publicKey;

    response.json({
        address,
        balance: Wallet.calculateBalance({ chain: blockchain.chain, address })
    });
});

router.get('/known-addresses', (request: Request, response: Response) => {
    const addressMap = {};

    for (let block of blockchain.chain) {
        for (let transaction of block.data) {
            const recipient = Object.keys(transaction.outputMap);

            recipient.forEach(recipient => addressMap[recipient] = recipient);
        }
    }

    response.json(Object.keys(addressMap));
});

export const ApiRouter = router;