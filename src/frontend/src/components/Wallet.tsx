import { Button, Card, CardContent, LinearProgress, TextField, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'
import { BlockchainService } from '../services/Blockchain.service'

export const Wallet:React.FC<{wallet:{address: string, balance: number} | undefined}> = ({wallet}) => {
    const [transaction, setTransaction] = useState<{recipient:string, amount: number}>({recipient:'', amount:0})

    const submitTransaction = async() =>{
        if(!transaction?.recipient || !transaction.amount){
            alert('Please fill in all required fields for a transaction!')
            return;
        }
        if(transaction.amount <= 0){
            alert('Transaction amount must be greater than 0')
            return;
        }

        console.log(transaction);
        await BlockchainService.submitTransaction(transaction?.recipient, transaction?.amount)
        .then(response=>{
            console.log(response)
            console.log('Transaction successfully submitted');
        })
        .catch(error=>{
            console.log(error)
            alert('Error submitting transaction!')
        })
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant='h5' sx={{ color: 'white', mb: 4 }}>
                Wallet
            </Typography>
            {
                wallet ?
                    <>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255,0.75)', p: 2, mb: 4 }} elevation={2}>
                            <CardContent>
                                <Typography sx={{wordWrap:'break-word'}}>Address: <br/><b style={{wordBreak:'break-all'}}>{wallet.address}</b></Typography>
                                <Typography>Balance: <b>{wallet.balance}</b></Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255,0.75)', p: 2 }} elevation={2}>
                            <CardContent sx={{ display:'flex', flexDirection:'column', '& > *': { mb: '25px !important' } }}>
                                <Typography>Make transaction </Typography>
                                <TextField value={transaction?.amount} onChange={event => setTransaction({...transaction, amount: +event.target.value})} required id="outlined-basic" label="Transaction amount" variant="outlined" type="number" />
                                <TextField value={transaction?.recipient} onChange={event => setTransaction({...transaction, recipient: event.target.value})} required id="outlined-basic" label="Recipient address" variant="outlined" />
                            </CardContent>
                            <Button variant="contained" onClick={submitTransaction}>Submit</Button>
                        </Card>
                    </>
                    : <LinearProgress />
            }

        </Box>
    )
}
