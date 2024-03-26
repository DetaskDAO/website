import { Empty } from "antd";
// import { useTranslation } from "react-i18next";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { readMsg } from "@/request/_api/user";
import {
    DoubleRightOutlined
} from '@ant-design/icons';



export default function MessagePopover(params) {
    
    const { messageList, setMessageList } = params;
    const { t } = useTranslation("task");
    const router = useRouter();

    const read = (id,i) => {
        readMsg({id: id})
        .then(res => {
            if (res.code === 0) {
                messageList[i].status = 1;
                setMessageList([...messageList])
                // message.success(res.msg)
            }else{
                // message.warning(res.msg)
            }
        })
    }

    return <div className="messagePopover">
        <div className="nav">
            <p className="nav-title">{t("header.message")}</p>
            <p onClick={() => router.push(`/messageCenter`)}>{t("header.view")} <DoubleRightOutlined /></p>
        </div>
        <div className="message-list">
            {
                messageList.map((e,i) => 
                    <div className="message-item" key={e.ID} onClick={() => read(e.ID,i)}>
                        <div className="content">
                            <div className={`point ${e.status === 0 ? "unread" : "read"}`}></div>
                            <div className="item-content" dangerouslySetInnerHTML={{__html: e.message}}></div>
                        </div>
                    </div>
                )
            }
            {
                messageList.length === 0 &&
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            }
        </div>
    </div>
}