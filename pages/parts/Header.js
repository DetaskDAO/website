import { Button, Dropdown, Menu, message, Popover, } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDisconnect, useAccount } from 'wagmi';    // 切换链 
import ConnectModal from '../../components/CustomModal/ConnectModal';
import MessagePopover from '../../components/CustomItem/MessagePopover';
import { unReadMsgList } from '../../http/_api/user';
import store from '../../redux/store';
import { HashAvatar } from '../../utils/HashAvatar';
import LocaleSwitcher from '../../components/locale-switcher';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';


export default function Header(props) {

    const { t } = useTranslation("task");
    const {isConnected, address} = useAccount()
    const {disconnect} = useDisconnect()
    const router = useRouter();

    
    let [selectItem,setSelectItem] = useState('')
    let item = [
        {title: t("header.home"), url: '/', value: 'home'},
        // {title: t("btn"), url: '/publish', value: 'publish'},
        {title: t("header.task"), url: '/projects', value: 'task'}
    ]
    const [isModalVisible, setIsModalVisible] = useState(false);
    let [wagmi,setWagmi] = useState({});
    let [account,setAccount] = useState('');
    let [isScroll,setIsScroll] = useState(false);
    let [messageList,setMessageList] = useState([]);
    let [isUnread, setIsUnread] = useState();

    const menu = (
        <Menu
          items={[
            { key: '1', icon: <img src='/icon/icon-myinfo.png' style={{ height: 16}} />, label: (  <Link href={{pathname: '/myInfo'}}>{t("header.user1")}</Link> ) },
            { type: 'divider' },
            { key: '2', icon: <img src='/icon/icon-post.png' style={{ height: 16}} />, label: ( <Link href={`/user/projects?w=issuer&bar=tasks`}>{t("header.user2")}</Link>) },
            { type: 'divider' },
            { key: '3', icon: <img src='/icon/icon-apply.png' style={{ height: 16}} />, label: ( <Link href={`/user/projects?w=worker&bar=apply`}>{t("header.user3")}</Link>) },
            { type: 'divider' },
            { key: '4', icon: <img src='/icon/icon-disconnect.png' style={{ height: 16}} />, label: ( <p onClick={() => signOut()}>{t("header.disconnect")}</p>) },
          ]}
        />
    );

    const content = (
        <MessagePopover messageList={messageList} setMessageList={setMessageList} />
    );

    store.subscribe(() => {
        setIsUnread(store.getState())
    })

    const getUnReadMsgList = () => {
        unReadMsgList()
        .then(res => {
            if (res.code === 0) {
                messageList = res.data.list;
                setMessageList([...messageList]);
            }else{
                message.warning(res.mesg);
            }
        })
    }

    const signOut = () => {
        disconnect();
        // localStorage.clear();
    }


    const onchange = (value) => {
        selectItem = value;
        setSelectItem(selectItem);
    }

    useEffect(() => {
        item.map(e => {
            if (e.url === location.pathname) {
                selectItem = e.value;
            }
        })
        setSelectItem(selectItem)
    },[])

    useEffect(()=>{
        if(isConnected){
            wagmi = {
                isActive: isConnected
            }
        }else{
            wagmi = {
                isActive: isConnected
            }
        }
        setWagmi({...wagmi})
    },[isConnected])

    useEffect(() => {
        if (address) {
            account = address.slice(0,5)+"..."+address.slice(38,42);
            setAccount(account);
        }
    },[address])

    useEffect(() => {
        window.addEventListener("scroll", handleScroll)
        handleScroll()
        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    })
    const handleScroll = () =>{
        let scrollY = window.scrollY;
        if(scrollY > 0){
            isScroll = true;
        }else{
            isScroll = false
        }
        setIsScroll(isScroll);
    }

    useEffect(() => {
        if (router.pathname === "/") {
            setSelectItem('home')
        }else if (router.pathname === "/projects") {
            setSelectItem('task')
        }else{
            setSelectItem('')
        }
    },[router])

    return <div className={`Header ${selectItem === "home" ? "Bg-none" : ""}`}>
        <div className={`content ${isScroll ? 'scroll':''}`}>
            <div className="content-left">
                <Link href="/">
                    <div className="header-logo">
                        <Image src="/logo1.png" alt="" layout="fill" objectFit="cover" />
                    </div>
                </Link>
                <div className="header-nav">
                    {
                        item.map((e,i) => 
                            <Link key={i} href={{pathname:e.url}}>
                                <div className={`li ${selectItem === e.value ? 'li-active':''}`} onClick={() => onchange(e.value)}>
                                    {e.title}
                                    <div className="line" />
                                </div>
                            </Link>
                        )
                    }
                </div>
            </div>
            <div className="header-info">
                <LocaleSwitcher />
                {
                    wagmi.isActive &&
                    <>
                        <Popover content={content} trigger="click">
                            <div className="message" onClick={() => getUnReadMsgList()}>
                                <Image src="/img/header_notice.png" alt="" layout="fill" objectFit="cover"  />
                                <div className={isUnread === 'unread' ? 'unread' : ''} />
                            </div>
                        </Popover>
                        <Button className='post' onClick={() => router.push('/publish')}>
                            <img src="/icon/icon-add.png" alt="" />
                            {t("btn")}
                        </Button>
                        <Dropdown overlay={menu} placement="bottom" arrow>
                                
                            <div className="btn" style={{cursor: "pointer"}}>
                                {
                                    address && 
                                    <img className="img" src={HashAvatar(address)} alt="" />
                                }
                                {account}
                            </div>
                        </Dropdown>
                    </>

                }
                {
                    !wagmi.isActive &&
                        <Button className="btn" style={{paddingInline: 20}} onClick={() => setIsModalVisible(true)}>
                            {t("header.wallet")}
                        </Button>
                }
            </div>
        </div>
        <ConnectModal setStatus={setIsModalVisible} status={isModalVisible} />
    </div>
}

export async function getStaticProps({ locale }) {
    return {
      props: {
        ...(await serverSideTranslations(locale)),
      },
    };
  }