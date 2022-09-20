import { Box, Divider } from '@mui/material';
import { Wallet } from './components/Wallet';
import { ITransactionPool, TransactionPool } from './components/TransactionPool';
import { BlockchainLedger } from './components/BlockchainLedger';
import { useEffect, useState } from 'react';
import { Blockchain as IBlockchain } from '../../../src/Blockchain';
import { BlockchainService } from './services/Blockchain.service';

function App() {
  const [wallet, setWallet] = useState<{ address: string, balance: number } | undefined>(undefined)
  const [transactionPool, setTransactionPool] = useState<ITransactionPool | undefined>(undefined)
  const [blockchain, setBlockchain] = useState<IBlockchain['chain'] | undefined>(undefined);

  const fetchData = async () =>{
    BlockchainService.getWalletInfo()
    .then(wallet => setWallet(wallet))
    .catch(console.log)

  BlockchainService.getTransactionPool()
    .then(transactionPool => setTransactionPool(transactionPool))
    .catch(console.log)

  BlockchainService.getBlockchain()
    .then(blockchain => setBlockchain(blockchain.reverse()))
    .catch(console.log)
  }
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    
  }, [])

  return (
    <Box className="App" sx={{height: '100vh', backgroundColor:'#0093E9', backgroundImage:'linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)',  display:'flex', '&>*:nth-child(odd)':{flex:1, width:'33%', textAlign:'center'}}}>
      <Wallet wallet={wallet} />

        <Divider orientation="vertical" variant='middle'/>

      <TransactionPool transactionPool={transactionPool} setTransactionPool={setTransactionPool}/>

        <Divider orientation="vertical" variant='middle'/>

      <BlockchainLedger blockchain={blockchain}/>
    </Box>
  );
}

export default App;
