import Image from "next/image";
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { msgList, readMsg } from "@/request/_api/user";
import { getDate } from "@/utils/GetDate";
import { Pagination } from "antd";
import { HashAvatar } from "@/utils/HashAvatar";
import { useTranslation } from "react-i18next";
import { constans } from "@/utils/constans";

export default function MessageCenter(params) {
    

    const { t } = useTranslation("task");
    const { address } = useAccount();
    const { getToken } = constans();

    let [messageList, setMessageList] = useState([]);
    let [pageConfig, setPageConfig] = useState({
        page: 1, pageSize: 10, total: 0
    })

    const read = (id,i) => {
        readMsg({id: id})
        .then(res => {
            if (res.code === 0) {
                messageList[i].status = 1;
                setMessageList([...messageList]);
                // message.success(res.msg)
            }else{
                // message.warning(res.msg)
            }
        })
    }

    const changeConfig = (e) => {
        pageConfig.page = e;
        setPageConfig({...pageConfig});
    }

    const switchAvatar = (e) => {
        // 是否是自己的消息
        if (e.send_id === 0) {
            return <Image src="/icon/message.png" layout="fill" />
        }else{
            if (e.user.avatar) {
                return <img src={process.env.NEXT_PUBLIC_DEVELOPMENT_API + "/" + e.avatar} alt="" />
            }else{
                return <img src={HashAvatar(e.user.address)} alt="" />
            }
        }          
    }

    const init = () => {
        if (!getToken()) {
            return
        }
        msgList(pageConfig)
       .then(res => {
            if (res.code === 0) {
                messageList = res.data?.list || [];
                pageConfig.total = res.data.total;
                setPageConfig({...pageConfig})
                messageList.map(e => {
                    e.created_at = getDate(e.created_at, 'd')
                })
                setMessageList([...messageList]);
            }
       }) 
    }

    useEffect(() => {
        init()
    },[pageConfig.page])

    return  <div className="messageCenter">
        <div className="banner">
        </div>
        <div className="content">
            <div className="container">
                <p className="content-title">{t("header.allmessage")}</p>
                <div className="message-list">
                    {
                        messageList.map((e,i) => 
                            <div key={e.ID} className="message-item" onClick={() => {read(e.ID,i)}}>
                                <div className="item-icon">
                                    {switchAvatar(e)}
                                    {e.status === 0 && <div className="unread" />}
                                </div>
                                <div className={`item-content ${e.status === 0 ? "block" : "none"}`} dangerouslySetInnerHTML={{__html: e.message}} />
                                <div className="item-date">
                                    {e.created_at}
                                </div>
                            </div>    
                        )
                    }
                </div>
                <Pagination onChange={(e) => changeConfig(e)} className="pagination" defaultCurrent={1} total={pageConfig.total} size={pageConfig.pageSize} />
            </div>
        </div>
    </div>
}
