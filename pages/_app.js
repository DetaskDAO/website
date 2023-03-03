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
import '../iconfont/iconfont.css'
import '../styles/Message.scss'
import '../styles/Myinfo.scss'
import Header from './parts/Header'
import Footer from './parts/Footer'

import {
  WagmiConfig,
  createClient,
  chain,
  configureChains,
  useAccount,
} from 'wagmi'

import { infuraProvider } from 'wagmi/providers/infura'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { detectZoom } from '../utils/DetectZoom.js';
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getJwt } from '../utils/GetJwt'
import { unReadMsgList } from '../http/_api/user'
import store from '../redux/store'
import { appWithTranslation } from "next-i18next";
import { message } from 'antd'
// import Container from '../components/Container'

const {chains, provider} = configureChains([chain.mainnet,chain.goerli,chain.hardhat,chain.polygonMumbai,
  {
    id: 8166,
    name: 'BuildBear',
    network: 'buildBear',
    rpcUrls: {
      default: 'https://rpc.buildbear.io/Urgent_Bib_Fortuna_77c584c8'
    }
  }],
  [
    infuraProvider({ apiKey: '9aa3d95b3bc440fa88ea12eaa4456161', priority: 0 }),
    jsonRpcProvider({
      rpc: (chain) => ({ http: chain.rpcUrls.default }),
    })
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
    }),
    // new InjectedConnector({
    //   chains,
    //   options: {
    //     name: 'Injected',
    //     shimDisconnect: true,
    //   },
    // }),

  ],
  provider,
})


function MyApp({ Component, pageProps }) {


  const router = useRouter();
  
  const zoom = (m) => {
    if (window.screen.width * window.devicePixelRatio >=3840) {
      switch (m) {
        // 4k ==> 100%
        case 100:
          document.body.style.zoom = 100 / (0.625 * 1920);
          break;
          // 4k ==> 125%
        case 125:
          document.body.style.zoom = 100 / (0.625 * 1920);
          break;
          // 4k ==> 150%
        case 150:
          document.body.style.zoom = 100 / (0.75 * 1920);
          break;
          // 4k ==> 175%
        case 175:
          document.body.style.zoom = 100 / (0.874715 * 1920);
          break;
          // 4k ==> 200%
        case 200:
          document.body.style.zoom = 1920 / 1920;
          break;
          // 4k ==> 225%
        case 225:
          document.body.style.zoom = 100 / (1.12485 * 1920);
          break;
      
        default:
          break;
      }
    }
    else if(m === 100 && window.devicePixelRatio === 1){
      document.body.style.zoom = window.screen.width / 1920;
      // console.log('正常屏');
      // console.log(window.screen.width + "====" + window.devicePixelRatio);
    }
    else if (window.screen.width <= 1915) {
      document.body.style.zoom = 1440 / 1920;
      // console.log('笔记本');
      // console.log(window.screen.width + "====" + window.devicePixelRatio);
    }
  }

  const getUnreadMsg = async() => {
    if (!window.ethereum) {
      // message.warning('请下载metamask');
      return
    }
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    const token = localStorage.getItem(`session.${accounts[0]}`);
    if (!token) {
        return
    }else{
        // 判断token有效期
        const status = getJwt(token);
        if (!status) {
            return
        }
    }
    // console.log(local);
    unReadMsgList()
      .then(res => {
          if (res.code === 0 && res.data.list.length > 0) {
            // redux修改
            store.dispatch({
              type: 'change',
              payload: 'unread'
            })
            // console.log('有未读信息');
          }
          else{
            store.dispatch({
              type: 'change',
              payload: 'read'
            })
          }
      })
  }

  useEffect(() => {
    zoom(detectZoom());
  },[])

  useEffect(() => {
    getUnreadMsg()
  },[router])

  return (
    // initDone &&
    <>
      <WagmiConfig client={client} >
        <Header></Header>
        <Component {...pageProps} />
        {/* <Container Component={Component} pageProps={pageProps} /> */}
        <Footer />
      </WagmiConfig>
    </>
  )
}

export default appWithTranslation(MyApp);
