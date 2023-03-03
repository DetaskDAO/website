import { Skeleton } from "antd";
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "react-admin";
import { useAccount } from "wagmi";
import { getJwt } from "../utils/GetJwt";
import ConnectModal from "./CustomModal/ConnectModal";

export default function withAuth (Component)  {
    const Auth = props => {
        const { user } = useContext(AuthContext);
        let [token, setToken] = useState()
        const { address, status } = useAccount();
        let [isModalVisible,setIsModalVisible] = useState(false);

        useEffect(() => {
            setToken(localStorage.getItem(`session.${address?.toLowerCase()}`))
            if (!address) {
                setIsModalVisible(true)
            }
        },[user])
        
        return <>
           {
            isModalVisible &&  <ConnectModal setStatus={setIsModalVisible} status={isModalVisible} />
           }
           {
            token ? <Component {...props} /> : 
            <div className="Skeleton-task">
                <Skeleton active paragraph={{ rows: 4, width: '50%'}} > <Component {...props} /> </Skeleton>
            </div>
           }
            {/* <Component {...props} /> */}
        </>
    }
    return Auth
}
