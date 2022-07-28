import { Box } from '@mui/system'
import Typography from '@mui/material/Typography';
import { Block as BlockModel } from '../../../Block';
import { Block } from './Block';
import { LinearProgress } from '@mui/material';

export const Blockchain: React.FC<{ blockchain: BlockModel[] | undefined }> = ({ blockchain }) => {
  return (
    <Box sx={{ p: 2, overflow:'auto', position:'relative'}}>
      <Typography variant='h5' sx={{ color: 'white', mb: 4, position:'sticky'}}>
        Blockchain
      </Typography>
      {
        blockchain ? blockchain.map((block, index) => {
          return <Block block={block} index={blockchain.length - index}/>
        }) : <LinearProgress />}
    </Box>
  )
}
