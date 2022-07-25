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
                        <Typography>ID: {transaction.id}</Typography>
                        <Divider />
                        <Typography>Time: {moment(new Date(transaction.input.timestamp)).format('MMM Do YY, h:mm:ss')}</Typography>
                        <Divider />
                        <Typography sx={{wordBreak:'break-all', fontSize:'0.8em'}}>Sender: {transaction.input.address}</Typography>
                        <Divider />
                        <Typography>Total ammount: {Object.entries(transaction.outputMap).reduce((prevValue,[currKey,currValue])=>{
                            if(currKey == transaction.input.address) return prevValue;
                            return prevValue+currValue;
                        },0)}</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                        malesuada lacus ex, sit amet blandit leo lobortis eget.
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </Box>
    )
}
