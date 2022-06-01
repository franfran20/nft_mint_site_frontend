import Head from 'next/head'
import Image from 'next/image'
import { useMoralis } from 'react-moralis'
import { MintComponent } from '../components/MintComponent'
import styles from '../styles/Home.module.css'

export default function Home() {
  const { enableWeb3, isWeb3Enabled, chainId: chainIdHex, account, deactivateWeb3 } = useMoralis()
  let chainId = parseInt(chainIdHex).toString();
  console.log(chainId)
  return (
    <>
      <Head>
        <title>FranFran NFT's</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </Head>
      <div>
        <nav>
          {isWeb3Enabled ? <button className={styles.button} onClick={deactivateWeb3}>Disconnect</button> : <button className={styles.button} onClick={enableWeb3}>Connect</button>}
        </nav>
        {chainId == "1337" || chainId == "80001" ? (<MintComponent />) : (<p>Please connect your metamask and make sure you're on the mumbai testnet.</p>)}

        <footer>
          <p>Dont forget to join the community!</p>
        </footer>
      </div>
    </>
  )
}
