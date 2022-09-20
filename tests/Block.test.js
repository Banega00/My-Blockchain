import { createHash } from 'crypto';
import {Block} from '../src/Block'
describe('Block', () => {
    const timestamp = 2000;
    const lastHash = 'foo-hash';
    const hash = 'bar-hash';
    const data = ['blockchain', 'data'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({ timestamp, lastHash, hash, data, nonce, difficulty });
  
    it('has a timestamp, lastHash, hash, and data property', () => {
      expect(block.timestamp).toEqual(timestamp);
      expect(block.lastHash).toEqual(lastHash);
      expect(block.hash).toEqual(hash);
      expect(block.data).toEqual(data);
      expect(block.nonce).toEqual(nonce);
      expect(block.difficulty).toEqual(difficulty);
    });
  
    describe('genesis()', () => {
      const genesisBlock = Block.genesis();
  
      it('returns a Block instance', () => {
        expect(genesisBlock instanceof Block).toBe(true);
      });
  
      it('returns the genesis data', () => {
        expect(genesisBlock).toEqual(GENESIS_DATA);
      });
    });
  
    describe('mineBlock()', () => {
      const lastBlock = Block.genesis();
      const data = 'mined data';
      const minedBlock = Block.mineBlock({ lastBlock, data });
  
      it('returns a Block instance', () => {
        expect(minedBlock instanceof Block).toBe(true);
      });
  
      it('sets the `lastHash` to be the `hash` of the lastBlock', () => {
        expect(minedBlock.lastHash).toEqual(lastBlock.hash);
      });
  
      it('sets the `data`', () => {
        expect(minedBlock.data).toEqual(data);
      });
  
      it('sets a `timestamp`', () => {
        expect(minedBlock.timestamp).not.toEqual(undefined);
      });
  
      it('Test if hash is equeal to hashing all the data', () => {
        expect(minedBlock.hash)
          .toEqual(
            createHash(
              minedBlock.timestamp,
              minedBlock.nonce,
              minedBlock.difficulty,
              lastBlock.hash,
              data
            )
          );
      });
  
      it('sets a `hash` that matches the difficulty criteria', () => {
        expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty))
          .toEqual('0'.repeat(minedBlock.difficulty));
      });
  
      it('adjusts the difficulty', () => {
        const possibleResults = [lastBlock.difficulty+1, lastBlock.difficulty-1];
  
        expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
      });
    });
  
    describe('adjustDifficulty()', () => {
      it('Increment difficulty if time is less than MINE_RATE', () => {
        expect(Block.adjustDifficulty({
          originalBlock: block, timestamp: block.timestamp + MINE_RATE - 100
        })).toEqual(block.difficulty+1);
      });
  
      it('Decrement difficulty if time is higher than MINE_RATE', () => {
        expect(Block.adjustDifficulty({
          originalBlock: block, timestamp: block.timestamp + MINE_RATE + 100
        })).toEqual(block.difficulty-1);
      });
  
      it('Set limit for difficulty to 1', () => {
        block.difficulty = -1;
  
        expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1);
      });
    });
  });