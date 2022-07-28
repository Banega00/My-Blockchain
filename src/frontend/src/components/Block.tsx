import { Box, Card, CardContent, Divider, Typography } from '@mui/material'
import React from 'react'
import { Block as BlockModel } from '../../../Block'
import moment from 'moment'
import { binaryToHex } from '../services/helpers'

export const Block: React.FC<{ block: BlockModel, index: number }> = ({ block, index }) => {
    return (
        <Card sx={{ backgroundColor: 'rgba(255, 255, 255,0.75)', mb: 4, pr: 1, pl: 1 }} elevation={2}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography >
                        <b> #{index} </b>
                    </Typography>
                    <Typography >
                        <b> {moment(new Date(block.timestamp)).format('MMM Do YY, h:mm:ss')} </b>
                    </Typography>
                </Box>
                <Divider />
                <Typography sx={{ textAlign: 'left', fontSize: '0.6em', wordBreak: 'break-all' }}>
                    <Typography>
                        Current Block Hash: <span style={{fontWeight:'bold', fontSize:'0.75em'}}>{binaryToHex(block.hash).result}</span>
                    </Typography>
                    <Typography>
                        Previous Block Hash: <span style={{fontWeight:'bold', fontSize:'0.75em'}}>{binaryToHex(block.previousHash).result}</span>
                    </Typography>
                </Typography>
                <Divider />

                <Box sx={{ p: 1 }}>
                    Data
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>
                        Nonce: <b>{block.nonce}</b>
                    </Typography>
                    <Typography >
                        Difficulty: <b> {block.difficulty} </b>
                    </Typography>
                </Box>
            </CardContent>

        </Card>
    )
}
