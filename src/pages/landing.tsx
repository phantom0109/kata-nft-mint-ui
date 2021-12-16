import katamint from "assets/kata-mint.png";
import { Button, Form } from "react-bootstrap";
import { defaultChainId, networkNames } from "blockchain/constants";
import { Web3ModalContext } from "contexts/Web3ModalProvider";
import { NotificationManager } from 'react-notifications';
import { useEffect, useContext, useCallback, useState } from 'react';
import useMintData from "hooks/useMintData";
import { toFixed, getPercent, getDateStr } from "blockchain/utils";
import useAccountData from 'hooks/useAccountData';
import {Web3WrapperContext} from "contexts/Web3WrapperProvider";
import LoaderSpinner from "react-loader-spinner";

const Landing = () => {

  const { connect, account } = useContext(Web3ModalContext);
  const { chainId } = useContext(Web3ModalContext);
  const MintData = useMintData();
  const percent = getPercent(MintData);
  const [Amount, setAmount] = useState<string>("0");
  const [mintRequested, setBuyReqeusted] = useState<boolean>(false);
  const accountData = useAccountData();
  const { web3Wrapper: wrapper } = useContext(Web3WrapperContext);

  useEffect(() => {
    if (chainId !== null && Number(chainId) !== Number(defaultChainId)) {
      NotificationManager.error(`Try on ${networkNames[defaultChainId]}`, "Wrong Network");
    }
  }, [chainId])


  const handleChange = (e) => {
    setAmount(e.target.value);
  } 

  const handleConnectWallet = useCallback(() => {
    connect();
  }, [connect]);

  const handleMaxClick = useCallback(() => {
    if (!mintRequested && accountData)
      setAmount(MintData.maxMintAmount)
  }, [MintData, mintRequested, accountData]);

  const CalcETHAmount = useCallback(() => {
    return Number(MintData.NFTPrice) * Number(Amount); 
  }, [MintData, Amount]);

  const handleMint = async () => {
    if (mintRequested || !accountData || !MintData || !wrapper) return;
    if (Amount === "" || isNaN(Number(Amount)) || Number(Amount) <= 0) {
      NotificationManager.error("Invalid amount.");
      return;
    }
    if (Number(Amount) + Number(accountData.balance) > Number(MintData.maxMintAmount)) {
      NotificationManager.error(`Maximum mint amount is ${MintData.maxMintAmount}`);
      return;
    }
    if (Number(Amount) * Number(MintData.NFTPrice) > Number(accountData.ethBalance)) {
      NotificationManager.error("Insufficient ETH balance.");
      return;
    }
    const left = (Number(MintData.maxSupply) - Number(MintData.totalSupply));
    if (Number(Amount) > left) {
      NotificationManager.error("Exceeds max supply");
      return;
    }
    setBuyReqeusted(true);
    const txHash = await wrapper.mint(Amount,Number(MintData.NFTPrice));
    setBuyReqeusted(false);
    if (!txHash) {
      NotificationManager.error('Mint Transaction Error');
      return;
    }
    
    NotificationManager.success(`${Amount} NFTs minted`, 'Mint Success');
    setAmount("0");

  }
  return (
      <>
      {
        !MintData ? 
        (
          <div className='page-loading'>
            <LoaderSpinner
              type="ThreeDots"
              color="#FE0565"
              height={100}
              width={100}
            />
          </div>
        )
        :
        (
          <div className="landing justify-content-center text-center">
            <div className="mt-5">
              <h1 className="upper-text">
                  <span>Katana Inu</span>&nbsp;
                  NTF-Minting
              </h1>
            </div>
            <div className="upper-text1 mt-3">
              <h3>1 Katana Inu One Collection</h3>
              <h3>
                Costs&nbsp;
                <span>{toFixed(MintData.NFTPrice, 4)}ETH</span>
              </h3>
              <h6>Excluding gas fee</h6>
            </div>
            {
              !account ?
              (
                <div className="mt-4">
                  <Button className="skew-btn px-2 py-2" onClick={handleConnectWallet}>CONNECT NOW</Button>
                </div>
              ):(
                <div className="mint-section mt-4">
                  {(MintData.status === 0 && !accountData.isWhitelist) ?
                    (
                      <div className="text-white whitelistTime">
                        <h2>You can Mint from</h2>
                        <h3>{getDateStr(MintData.whitelistTime)}</h3>
                      </div>
                    )
                    :
                    (
                      accountData ?
                      (<>
                        <div className="mint-range d-flex justify-content-between">
                          <h6 className="mintedAmount">
                            Balance: {accountData.balance}
                          </h6>
                          <h6 className="maxMintAmount"
                            onClick={handleMaxClick}
                            style={{ cursor: mintRequested?"auto":"pointer" }}
                          >
                            Max: {MintData.maxMintAmount}
                          </h6>
                        </div>
                        <Form.Control 
                          type="number" 
                          className="custom_input"
                          onChange={handleChange}
                          value={Amount}
                          disabled={mintRequested}
                        />
    
                        <div className="ethAmount mt-2">
                          <h6 className="calcEth">
                            ={CalcETHAmount()} ETH
                          </h6>        
                        </div>
                        <div className="mt-3">
                          <Button className="mint-btn" onClick={handleMint} disabled={mintRequested}>
                            { mintRequested?"Minting...":"Mint" }
                          </Button>
                        </div>
                      </>
                      ) : 
                      (
                        <div className="mint-loading">
                          <LoaderSpinner
                            type="ThreeDots"
                            color="#FE0565"
                            height={50}
                            width={50}                        
                          />
                        </div>
                      )                    
                    ) 
                  }
                </div>
              )
            }
            <div className="mt-4">
                <img src={katamint} alt="" className="katana-mint d-none d-sm-block" />
            </div>

            <div className="progress-bar mt-4">
              <div className="bar" style={{ width: `${percent}%` }}> </div>
            </div>

            <div className="mt-4">
              <h4 className="font-weight-bold text-white">Minted NFTs: {percent}%</h4>
              <h3 className="mint-goal font-weight-bold">{toFixed(MintData.totalSupply, 4)} / {toFixed(MintData.maxSupply, 4)}</h3>  
            </div>
          
            <div className="mt-5">
              <h6 className="text-white">Current Price</h6>
                <h2 className="upper-text mt-2">
                  1 Katana Inu NFT costs &nbsp;
                  <span>{toFixed(MintData.NFTPrice, 4)}ETH</span>
                </h2>
                <h4 className="text-white">excluding gas fee</h4>
            </div>
            <div className="text-white mt-5">
              <h6>
                Please make sure you are connected to the network(Ethereum Mainnet) and the correct address.
                <br />
                Please not: Once you make the purchase, you cannot undo this action.
              </h6>
            </div>
            <div className="text-white mt-4 mb-4">
              <h6>
                We have set the gas limit to 285000 for the contract to succesfully mint your NFT. We recommend that you don't
                <br />
                lower the gas limit
              </h6>
            </div>
          </div>  
        )
      }
      </>
  );
}
export default Landing;