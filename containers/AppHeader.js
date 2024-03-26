import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
// antd
import { Button, Dropdown, message, Popover } from "antd";
// chain
import { useAccount } from "wagmi";
// redux
import store from "@/redux/store";
// request
import { unReadMsgList } from "@/request/_api/user";
// utils
import { HashAvatar } from "@/utils/HashAvatar";
import { constans } from "@/utils/constans";
// components
import ConnectModal from "@/components/CustomModal/ConnectModal";
import MessagePopover from "@/components/CustomItem/MessagePopover";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import AppMenu from "./AppMenu";
import { useTranslation } from "react-i18next";


export default function AppHeader(props) {
  const { t } = useTranslation(["task"]);
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { subStringAddr } = constans();

  const item = [
    { title: t("header.home"), url: "/", value: "home" },
    { title: t("header.task"), url: "/projects", value: "task" },
  ];
  let [isModalVisible, setIsModalVisible] = useState(false);
  let [selectItem, setSelectItem] = useState("");
  let [wagmi, setWagmi] = useState({});
  let [isScroll, setIsScroll] = useState(false);
  let [messageList, setMessageList] = useState([]);
  let [isUnread, setIsUnread] = useState();

  store.subscribe(() => {
    setIsUnread(store.getState().msg);
  });

  const getUnReadMsgList = () => {
    unReadMsgList().then((res) => {
      if (res.code === 0) {
        messageList = res.data.list;
        setMessageList([...messageList]);
      } else {
        message.warning(res.mesg);
      }
    });
  };

  useEffect(() => {
    item.map((e) => {
      if (e.url === location.pathname) {
        selectItem = e.value;
      }
    });
    setSelectItem(selectItem);
  }, []);

  useEffect(() => {
    if (isConnected) {
      wagmi = {
        isActive: isConnected,
      };
    } else {
      wagmi = {
        isActive: isConnected,
      };
    }
    setWagmi({ ...wagmi });
  }, [isConnected]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
  const handleScroll = () => {
    let scrollY = window.scrollY;
    if (scrollY > 0) {
      isScroll = true;
    } else {
      isScroll = false;
    }
    setIsScroll(isScroll);
  };

  useEffect(() => {
    if (router.pathname === "/[locale]") {
      setSelectItem("home");
    } else if (router.pathname === "/projects") {
      setSelectItem("task");
    } else {
      setSelectItem("");
    }
  }, [router]);

  return (
    <div className={`Header ${selectItem === "home" ? "Bg-none" : ""}`}>
      <div className={`content ${isScroll ? "scroll" : ""}`}>
        <div className="content-left">
          <Link href="/">
            <div className="header-logo">
              <Image src="/logo1.png" alt="" layout="fill" objectFit="cover" />
            </div>
          </Link>
          <div className="header-nav">
            {item.map((e, i) => (
              <Link key={i} href={e.url}>
                <div
                  className={`li ${selectItem === e.value ? "li-active" : ""}`}
                >
                  {e.title}
                  <div className="line" />
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="header-info">
          <LocaleSwitcher />
          {wagmi.isActive && (
            <>
              <Popover
                content={
                  <MessagePopover
                    messageList={messageList}
                    setMessageList={setMessageList}
                  />
                }
                trigger="click"
              >
                <div className="message" onClick={() => getUnReadMsgList()}>
                  <Image
                    src="/img/header_notice.png"
                    alt=""
                    layout="fill"
                    objectFit="cover"
                  />
                  <div className={isUnread === "unread" ? "unread" : ""} />
                </div>
              </Popover>
              <Button
                className="post"
                onClick={() => router.push("/publish")}
              >
                <img src="/icon/icon-add.png" alt="" />
                {t("btn")}
              </Button>
              <Dropdown overlay={<AppMenu />} placement="bottom" arrow>
                <div className="btn" style={{ cursor: "pointer" }}>
                  {address && (
                    <img className="img" src={HashAvatar(address)} alt="" />
                  )}
                  {subStringAddr(address)}
                </div>
              </Dropdown>
            </>
          )}
          {!wagmi.isActive && (
            <Button
              className="btn"
              style={{ paddingInline: 20 }}
              onClick={() => setIsModalVisible(true)}
            >
              {t("header.wallet")}
            </Button>
          )}
        </div>
      </div>
      <ConnectModal setStatus={setIsModalVisible} status={isModalVisible} />
    </div>
  );
}
