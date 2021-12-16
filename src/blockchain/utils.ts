import Web3 from 'web3';
import { addresses, defaultChainId, rpcUrls } from './constants';
import { BigNumber } from "bignumber.js";
import KataNFT from './contracts/KataNFT';
import moment from "moment";
// import { useState } from 'react';

export const createWeb3 = (provider) => {

  var realProvider;

  if (typeof provider === 'string') {
    if (provider.includes('wss')) {
      realProvider = new Web3.providers.WebsocketProvider(
        provider
      );
    } else {
      realProvider = new Web3.providers.HttpProvider(
        provider
      );
    }
  } else {
    realProvider = provider;
  }

  return new Web3(realProvider);
}

export const getDefaultWeb3 = () => {
  return createWeb3(rpcUrls[defaultChainId]);
}

export const getDefaultContractOptions = () => {
  const web3 = getDefaultWeb3();
  return { 
    web3, 
    chainId: defaultChainId, 
    account: null 
  };
}

export const BntoNum = (value, decimal = 18) => {
  return new BigNumber(value).shiftedBy(-decimal).toNumber();
}

export const NumToBn = (value, decimal = 18) => {
  return new BigNumber(value).shiftedBy(decimal);
}

export const toFixed = (num, digit) => {
  if (isNaN(num)) return 0;
  var fixed_num = Number(num).toFixed(digit)
  return Number(fixed_num.toString());
}

export const getPercent = (MintData) => {
  if (!MintData) return 0;
  return toFixed(MintData.totalSupply / MintData.maxSupply * 100, 1);
}

export const getDateStr = (tiemstamp) => {
  const dateObj = new Date(tiemstamp * 1000);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[dateObj.getMonth()];
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  const output = month  + ' ' + day  + ', ' + year;
  return output;
}

export const getPreMintData = async () => {
  const premint = new KataNFT(getDefaultContractOptions(), addresses.PreMint[defaultChainId]);

  const NFTPrice = await premint.call("price");
  const maxSupply = await premint.call("maxSupply");
  const totalSupply = await premint.call("totalSupply");
  const maxMintAmount = await premint.call("maxMintAmount");
  // const whitelistTime = Number(await premint.call("whitelistTime"));

  const whitelistTime = 1639498981;
  let currentTime = moment().unix();
  let status = 0;

  if (currentTime > whitelistTime)
    status = 1;
  else
    status = 0;
  
  return {
    NFTPrice: BntoNum(NFTPrice,18),
    maxSupply: Number(maxSupply),
    totalSupply: Number(totalSupply),
    maxMintAmount: Number(maxMintAmount),
    whitelistTime: whitelistTime,
    status: status
  };
}
