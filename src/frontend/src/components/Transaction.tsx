import { Accordion, AccordionDetails, AccordionSummary, Box, Card, CardContent, Divider, Typography } from '@mui/material'
import React from 'react'
import moment from 'moment'
import { Transaction as ITransaction } from '../../../Transaction'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
// export interface Transaction {
//     id: string,
//     outputMap: {
//         [recipientWalletAddress: string]: number
//     },
//     input: {
//         timestamp: number,
//         amount: number,
//         address: string,
//         signature: {
//             r: string,
//             s: string,
//             recoveryParam: number
//         }
//     }
// }

export const Transaction: React.FC<{ transaction: ITransaction }> = ({ transaction }) => {
    return (
        <Box sx={{ mb: 1 }}>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
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
                            <Box sx={{textAlign:'left', '&>*:nth-child(odd)':{fontSize:'0.8em',mr:1, flex: 1, flexBasis:'auto'}, display:'flex'}}> 
                                <Typography>
                                    {index+1} 
                                </Typography>
                                <Typography sx={{borderLeft:'1px solid lightgray', borderRight:'1px solid lightgray', wordBreak:'break-all', pl:1, pr:1, fontSize:'0.8em', textAlign:'left'}}>
                                    <b>
                                        {key}
                                    </b>
                                </Typography>
                                <Typography sx={{textAlign: 'right', fontSize:'1em', ml:1}}>
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
