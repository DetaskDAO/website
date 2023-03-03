import { CloseOutlined } from "@ant-design/icons"
import { useRequest } from "ahooks";
import { Button, Modal } from "antd"
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useNetwork, useSigner, useSwitchNetwork } from "wagmi";
import { getJwt } from "../../utils/GetJwt";
import { GetSignature } from "../../utils/GetSignature";


export default function ConnectModal(params) {
    
    const { t } = useTranslation("task");
    const { setStatus, status, propsInit } = params;
    const { connect, connectors } = useConnect();
    const { address, isConnecting } = useAccount();
    const router = useRouter();
    let [cacheAddr, setCacheAddr] = useState();
    // 签名
    const { data: signer } = useSigner();
    const [message, setMessage] = useState();
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
        const token = localStorage.getItem(`session.${address.toLowerCase()}`);
        if (!token) {
            getToken()
        }else{
            // 判断token有效期
            let status = getJwt(token);
            if (!status) {
                getToken();
            }
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