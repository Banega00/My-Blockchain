import { Accordion, AccordionDetails, AccordionSummary, Box, Card, CardContent, Divider, Typography } from '@mui/material'
import React from 'react'
import moment from 'moment'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
export interface Transaction {
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

export const Transaction: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    return (
        <Box sx={{ mb: 1 }}>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandCircleDownIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Box sx={{'& > *': {textAlign:'left', fontSize:'0.8em', color:'#565759'}}}>
                        <Typography>ID: <b>{transaction.id}</b></Typography>
                        <Divider />
                        <Typography>Time: <b> {moment(new Date(transaction.input.timestamp)).format('MMM Do YY, h:mm:ss')} </b></Typography>
                        <Divider />
                        <Typography sx={{wordBreak:'break-all', fontSize:'0.8em'}}>Sender: <b> {transaction.input.address} </b></Typography>
                        <Divider />
                        <Typography>Total amount: <b style={{fontSize:'1.2em'}}> {Object.entries(transaction.outputMap).reduce((prevValue,[currKey,currValue])=>{
                            if(currKey == transaction.input.address) return prevValue;
                            return prevValue+currValue;
                        },0)} </b></Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Divider />
                    <Typography>
                        {Object.keys(transaction.outputMap).filter(key => key != transaction.input.address).map((key,index)=>{
                            return (
                            <Box sx={{textAlign:'left', '& > *':{fontSize:'0.8em', flex: 1, flexBasis:'auto'}, display:'flex'}}> 
                                <Typography>
                                    {index+1} | 
                                </Typography>
                                <Typography>
                                    <b>
                                        {key}
                                    </b>
                                </Typography>
                                <Typography sx={{textAlign: 'right'}}>
                                    <b>{transaction.outputMap[key]}</b>
                                </Typography>
                            </Box>
                            )
                        })}
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </Box>
    )
}
