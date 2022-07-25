import { Card, CardContent, Divider, LinearProgress, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'
import { BlockchainService } from '../services/Blockchain.service'
import { Transaction } from './Transaction'

export interface ITransactionPool {
    [transactionId: string]: Transaction
}

export const TransactionPool:React.FC<{transactionPool:ITransactionPool | undefined}> = ({transactionPool}) => {

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant='h5' sx={{ color: 'white', mb: 4 }}>
                TransactionPool
            </Typography>
            {
                transactionPool ?
                    <Card sx={{ backgroundColor: 'rgba(255, 255, 255,0.75)', p: 2, mb: 4, pr: 1, pl: 1 }} elevation={2}>
                        <CardContent>
                            <Typography><b>{Object.values(transactionPool).length}</b> transactions in pool</Typography>
                            <Divider sx={{mb:1}} orientation="horizontal" variant='middle'/>
                            {Object.values(transactionPool).map(transaction => <Transaction transaction={transaction}/>)}
                        </CardContent>
                    </Card>
                    : <LinearProgress />
            }
        </Box>
    )
}
