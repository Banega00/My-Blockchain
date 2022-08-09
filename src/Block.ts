import { GENESIS_DATA, MINE_RATE } from "./config";
import { calculateHash, concatAndStringify } from "./helpers";
import { Transaction } from "./Transaction";
import hexToBinary from 'hex-to-binary';
 
export class Block {
    public timestamp: number;
    public previousHash: string;
    public hash: string;
    public data: Transaction[];
    public nonce: number;
    public difficulty: number;

    constructor(obj: { timestamp: Block['timestamp'], previousHash: Block['previousHash'], hash: Block['hash'], data: Block['data'], nonce: Block['nonce'], difficulty: Block['difficulty'] }) {
        this.timestamp = obj.timestamp;
        this.previousHash = obj.previousHash;
        this.hash = obj.hash;
        this.data = obj.data;
        this.nonce = obj.nonce;
        this.difficulty = obj.difficulty;
    }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock(obj: { lastBlock: Block, data: any }) {
        const { lastBlock, data } = obj;

        const previousHash = lastBlock.hash;
        let hash, timestamp;
        let { difficulty } = lastBlock;
        let nonce = 0;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });

            hash = calculateHash(concatAndStringify(timestamp, previousHash, data, nonce, difficulty));
            hash = hexToBinary(hash)
            console.log(`${difficulty} - BINARY HASH:${hash}`)
            
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this({ timestamp, previousHash, data, difficulty, nonce, hash});
    }

    static adjustDifficulty(obj:{ originalBlock: Block, timestamp: Block['timestamp'] }) {
        const { originalBlock, timestamp} = obj;
        const { difficulty } = originalBlock;

        if (difficulty < 1) return 1;

        if ((timestamp - originalBlock.timestamp) > MINE_RATE && difficulty > 1) return difficulty - 1;

        return difficulty + 1;
    }

    public getHash = () =>{
        return calculateHash(concatAndStringify(this.timestamp, this.previousHash, this.data, this.nonce, this.difficulty));
    }
}