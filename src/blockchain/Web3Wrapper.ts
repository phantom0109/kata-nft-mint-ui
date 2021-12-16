import Web3 from 'web3';
import  KataNFT from "./contracts/KataNFT";
import { addresses } from './constants';
import { BntoNum, NumToBn } from './utils';
import { whitelist } from './whitelist';

export default class Web3Wrapper {
    web3: Web3;
    chainId: number;
    account: string;
    wrapperOptions: any;
    PreMint: KataNFT;

    constructor(web3, chainId, account, options = {}) {

        this.web3 = web3;
        this.chainId = chainId;
        this.account = account;

        this.wrapperOptions = {
            web3, chainId, account,
            ...options
        }
        this.PreMint = new KataNFT(this.wrapperOptions, addresses.PreMint[this.chainId]);
    } 
    async getAccountData() {
        
        const ethBalacne = await this.web3.eth.getBalance(this.account);
        const balance = await this.PreMint.call("balanceOf", this.account);
        // const isWhitelist = await this.PreMint.call("whitelist", this.account);

        const result = whitelist.find(addr => this.web3.utils.toChecksumAddress(addr) === this.account);
        return { 
            ethBalance: BntoNum(ethBalacne, 18),
            balance : Number(balance),
            // isWhitelist: Boolean(isWhitelist)
            isWhitelist: (result !== undefined)
        }
    }  
    async mint(amount,price) {
        try {
            const tx = await this.PreMint.send("mint", {value: NumToBn(amount * price, 18)}, amount);
            return tx;
        } catch (e) {
            console.log(e);
            return false;
        }
    } 
}

