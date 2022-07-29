import { Button, Card, CardContent, Divider, LinearProgress, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'
import { BlockchainService } from '../services/Blockchain.service'
import { Transaction } from './Transaction'
import { Transaction as ITransaction } from '../../../Transaction'

export interface ITransactionPool {
    [transactionId: string]: ITransaction
}

export const TransactionPool: React.FC<{ transactionPool: ITransactionPool | undefined, setTransactionPool:Function }> = ({ transactionPool, setTransactionPool }) => {
    const [miningInProcessFlag, setMiningInProcessFlag] = useState<boolean>(false);
    const mineTransactions = () => {
        setMiningInProcessFlag(true)

        BlockchainService.mineTransactions()
        .then(response => {
            alert(`Block successfully mined!`)
            setMiningInProcessFlag(false);
            setTransactionPool(undefined)
        })
        .catch(error => {
            console.log(error)
            alert(`Error mining block!`)
            setMiningInProcessFlag(false);
        })
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant='h5' sx={{ color: 'white', mb: 4 }}>
                TransactionPool
            </Typography>
            {   
                (transactionPool && !miningInProcessFlag) ?
                    <Card sx={{ backgroundColor: 'rgba(255, 255, 255,0.75)', p: 2, mb: 4, pr: 1, pl: 1 }} elevation={2}>
                        <CardContent>
                            <Box sx={{display:'flex', pb:1}}>
                                <Typography><b>{Object.values(transactionPool).length}</b> transactions in pool</Typography>
                                {Object.values(transactionPool).length > 0 && 
                                    <Button sx={{marginLeft:'auto'}} onClick={mineTransactions} variant="contained">Mine</Button>}

                            </Box>
                            <Divider sx={{ mb: 1 }} orientation="horizontal" variant='middle' />
                            {Object.values(transactionPool).map(transaction => <Transaction transaction={transaction} />)}
                        </CardContent>
                    </Card>
                    : <LinearProgress />
            }
        </Box>
    )
}
