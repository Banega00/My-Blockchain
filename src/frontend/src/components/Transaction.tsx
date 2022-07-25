import { Box } from '@mui/material'
import React from 'react'

export interface Transaction{
    id: string,
    outputMap: {
        [recipientWalletAddress: string]: number
    },
    input: {
        timestamp: number,
        amount: number,
        address: string,
        signature: {
            r: string,
            s: string,
            recoveryParam: number
        }
    }
}

export const Transaction:React.FC<{transaction:Transaction}> = ({transaction}) => {
  return (
    <Box>
        {transaction.id}
    </Box>
  )
}
