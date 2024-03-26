import '../styles/globals.css'
import '../styles/Index.scss'
import '../styles/Projects.scss'
import '../styles/Project.scss'
import '../styles/Publish.scss'
import '../styles/Parts.scss'
import '../styles/Antd.scss'
import '../styles/All_User.scss'
import '../styles/Components.scss'
import '../styles/Order/StageCard.scss'
import '../styles/Modal.scss'
import '../styles/Message.scss'
import '../styles/Myinfo.scss'
import "../public/locales/config";
import i18n from 'i18next';

import {
  WagmiConfig,
  createClient,
  chain,
  configureChains,
} from 'wagmi'


import { publicProvider } from 'wagmi/providers/public'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import DefaultLayout from '../containers/DefaultLayout'
import { useEffect } from 'react'

const {chains, provider} = configureChains([chain.polygon, chain.polygonMumbai],
  [
    publicProvider()
  ]
)

const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    })
  ],
  provider,
})

function MyApp({ Component, pageProps }) {

  // 语种初始化
  useEffect(() => {
    let lang
    if (localStorage.getItem("detask.lang")) {
      lang = localStorage.getItem("detask.lang");
    }else{
      lang = navigator.language !== 'zh-CN' ? 'en' : 'zh';
      localStorage.setItem("detask.lang",lang)
    }
    i18n.changeLanguage(lang);
  },[])
  return (
    <>
      <WagmiConfig client={client} >

        <DefaultLayout>
          <Component {...pageProps} />
        </DefaultLayout>

      </WagmiConfig>
    </>
  )
}

export default MyApp;
