import { Tooltip } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react"

export default function UserSocialMedia(params) {

    const { userInfo } = params;
    
    let [list, setList] = useState([
        {title: 'telegram', icon: '/icon/telegram', value: ''},
        {title: 'wechat', icon: '/icon/wechat', value: ''},
        {title: 'skype', icon: '/icon/skype', value: ''},
        {title: 'discord', icon: '/icon/discord', value: ''},
        {title: 'phone', icon: '/icon/whatsapp', value: ''},
    ])

    useEffect(() => {
        list.map(e => {
            if (userInfo[e.title]) {
                e.value = userInfo[e.title]
            }
        })
        setList([...list]);
    },[])

    return ( userInfo &&
        <div className="socialAccount">
            {
                list.map((e,i) => {
                    if (e.value) {
                        return (
                            <div className="box" key={i}>
                                <div className="icon">
                                    <Tooltip title={e.value}>
                                        <Image src={`${e.icon}.png`} layout='fill' />
                                    </Tooltip>
                                </div>
                            </div>
                        )
                    }else{
                        return (
                            <div className="box none" key={i}>
                                <div className="icon">
                                    <Image src={`${e.icon}-none.png`} layout='fill' />
                                </div>
                            </div>
                        )
                    }
                })
            }
        </div>
    )

}