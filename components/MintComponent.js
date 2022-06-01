import React, { useEffect, useState } from 'react'
import { useMoralis, useWeb3Contract, useWeb3ExecuteFunction } from 'react-moralis'
import { ABI } from "../constants/abi"
import { CONTRACT_ADDRESSES } from '../constants/contractAddresses';
import { OWNER } from '../constants/Owner';
import styles from "../styles/MintComponent.module.css"

export const MintComponent = () => {
    const [mintCount, setMintCount] = useState(0);
    const [userAmount, setUserAmount] = useState(0);
    const [txProcessing, setTxProcessing] = useState(false);
    const { Moralis, chainId: hexChainId, account, isWeb3Enabled } = useMoralis();

    let chainId = parseInt(hexChainId).toString();
    let Owner = OWNER[chainId];
    let contractAddress = CONTRACT_ADDRESSES[chainId]

    //error messages
    let userDenyTx = "MetaMask Tx Signature: User denied transaction signature.";
    let cantMintZeroNfts = "VM Exception while processing transaction: revert need to mint at least 1 NFT";
    let userIsNotWhitelisted = "VM Exception while processing transaction: revert user is not whitelisted";
    let maxNftExceeded = "VM Exception while processing transaction: revert max NFT limit exceeded";
    let whiteListAmountExcceded = "VM Exception while processing transaction: revert max NFT per address exceeded for whitelist";

    let amount;
    if (account == Owner.toLowerCase()) {
        amount = Moralis.Units.ETH(0)
    } else {
        amount = Moralis.Units.ETH(userAmount * 0.01)
    }

    const handleMintSuccess = async (tx) => {
        setTxProcessing(prev => !prev)
        await tx.wait(2)
        //it delays a bit..
        setTxProcessing(prev => !prev)

    }

    const { data, error, fetch, isFetching, isLoading } = useWeb3ExecuteFunction({
        abi: ABI,
        contractAddress: contractAddress,
        functionName: "mint",
        params: {
            _mintAmount: userAmount
        },
        msgValue: amount,

    })

    const { data: totalSupply, runContractFunction } = useWeb3Contract({
        abi: ABI,
        contractAddress: contractAddress,
        functionName: "totalSupply",
    });

    const updateUI = async () => {
        let nftCountHex = await runContractFunction()
        let nftCountNum = parseInt(nftCountHex._hex);
        setMintCount(nftCountNum)
        //console.log(nftCountHex);
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled, account, chainId])


    const handleError = (err) => {
        if (err) {
            if (err.data) {
                if (err.data.message == cantMintZeroNfts) {
                    return <p className={styles.error}>You cant mint zero Nfts</p>
                }
                if (err.data.message == userIsNotWhitelisted) {
                    return <p className={styles.error}> Only whitelisted Addreses can mint now!</p >
                }
                if (err.data.message == maxNftExceeded) {
                    return <p className={styles.error}>You're trying to mint more than the max supply of our nfts</p>
                }
                if (err.data.message == whiteListAmountExcceded) {
                    return <p className={styles.error}>You're trying to mint more than the allowed whitelist amount</p>
                }
            }
            if (err.message == userDenyTx) {
                console.log(err.message)
            }

        }

    }

    if (txProcessing) {
        return (
            <div className={styles.processing}>
                <p>Your transaction is processing....</p>
                <p>View your transaction on etherscan here:</p>
                <a href={`https://mumbai.polygonscan.com/tx/${data.hash}`} target={"_blank"}>{data.hash}</a>

            </div>
        )
    }

    return (
        <div className={styles.wrapper}>
            <h1>FRANFRAN NFT'S</h1>
            <p>
                Just some random landscape free images gotten from pexels.com!.. We''l assume they're awesome. LOL!
            </p>
            <a href='https://testnets.opensea.io/collection/franfran/' target={'_blank'}>Click here to view our NFTS that have been minted by you or others on opensea</a>
            <p>Select the amount you want to mint and click the button below to mint yours now!</p>
            <div className={styles.minted}>
                Minted {mintCount} /10
            </div>
            <input type='number' onChange={(e) => setUserAmount(e.target.value)} className={styles.mintInput} placeholder="Enter mint amount..." />
            {error ? handleError(error) : ""}
            <button onClick={async () => await fetch({ onSuccess: handleMintSuccess })} className={styles.mintButton}>MINT</button>
        </div >
    )
}
