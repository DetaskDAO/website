import { CloseOutlined } from "@ant-design/icons"
import { useRequest } from "ahooks";
import { Button, Modal } from "antd"
// import { useTranslation } from "react-i18next";
import { useTranslation } from "react-i18next";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useNetwork, useSigner, useSwitchNetwork } from "wagmi";
import { GetSignature } from "@/utils/GetSignature";
import { constans } from "@/utils/constans";


export default function ConnectModal(params) {
    
    const { t } = useTranslation("task");
    const { setStatus, status } = params;
    const { connect, connectors } = useConnect();
    const { address } = useAccount();
    const router = useRouter();
    const { getToken: token } = constans();
    let [cacheAddr, setCacheAddr] = useState();
    // 签名
    const { data: signer } = useSigner();
    // 链
    const { chain } = useNetwork();
    const chainID = process.env.NEXT_PUBLIC_DEVELOPMENT_CHAIN_ID || process.env.NEXT_PUBLIC_PRODUCTION_CHAIN_ID

    const addChain = () => {
    }

    const {switchNetwork} = useSwitchNetwork({
        onSuccess() {
            setStatus(false)
        },
        onError(error) {
          window.ethereum && addChain()
        }
      });
    let [needConnector,setNeedConnector] = useState([]);

    const network = () => {
        console.log(!document.hidden);
        if (!document.hidden && switchNetwork && chain.id != chainID) {
            switchNetwork(Number(chainID))
        }else{
            setStatus(false)
        }
    }

    const getToken = async() => {
        GetSignature({address: address, signer: signer})
    }

    const init = () => {
        if (!token()) {
            getToken();
        }
    }
    async function isRun() {
        if (signer && signer.signMessage) {
            init()
        }
    }

    const { data, runAsync } = useRequest(isRun, {
        debounceWait: 1000,
        manual: true
    });

    useEffect(() => {
        runAsync()
    },[signer])

    useEffect(() => {
        connectors.map((e,i) => {
            if(e.name == "MetaMask" || e.name == "WalletConnect") {
                needConnector.push(e)
            }
        })
        setNeedConnector([...new Set(needConnector)]) 
    },[])

    useEffect(() => {
        chain && network()
    },[switchNetwork, chain])
    
    useEffect(() => {
        if (address) {
            if (cacheAddr) {
                router.push("/")
                return
            }
            cacheAddr = address;
            setCacheAddr(cacheAddr);
        }
    },[address])

    return <Modal
            title={<p>{t("header.wallet")} <CloseOutlined onClick={() => setStatus(false)} /></p>} 
            footer={null} 
            open={status} 
            closable={false}
            onCancel={() => setStatus(false)}
            className="connect"
        >
        {needConnector.map((connector) => (
            <Button
                key={connector.id}
                onClick={() => connect({ connector })}
            >
                <p className='connect-img'>
                    <img src={"/"+connector.name+".png"} />
                </p>
                <p className='connect-text'>{connector.name}</p>
            </Button>
        ))}
    </Modal>
}