import axios from "axios";

export class BlockchainService{
    private static api_url = `http://localhost:3001/api`;

    public static getWalletInfo = async() =>{
        const response = await axios(`${this.api_url}/wallet-info`)
        return response.data;
    }

    public static getTransactionPool = async() =>{
        const response = await axios(`${this.api_url}/transaction-pool-map`)
        return response.data;
    }

    public static submitTransaction = async (recipient: string, amount: number) =>{
        const response = await axios(`${this.api_url}/transact`, {data:{recipient, amount}, method:'POST'})
    }
}