import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getUserInfo } from "@/request/_api/user";
import UserSocialMedia from "../components/CustomItem/UserSocialMedia";
import { FormOutlined } from "@ant-design/icons";
import { Button, Modal, Pagination } from "antd";
import ModifyUserModal from "../components/CustomModal/ModifyUserModal";
import { HashAvatar } from "@/utils/HashAvatar";
import i18n from 'i18next';
import { useTranslation } from "react-i18next";
import { getOrderUser } from "@/request/_api/order";
import { useUpdateEffect } from "ahooks";
import { deform_Skills } from "@/utils/Deform";
import { getSillTreeMap } from "@/request/_api/task";
import { ConvertToken, ConvertTokenAddress } from "@/utils/Currency";
import TaskDetail from "../components/CustomItem/TaskDetail";
import { Sysmbol } from "@/utils/Sysmbol";
import Link from "next/link";

export default function MyInfo() {
  const { address } = useAccount();

  const { t } = useTranslation("task");
  let [selectAddr, setSelectAddr] = useState();
  let [userInfo, setUserInfo] = useState();
  let [isModify, setIsModify] = useState(false);
  let [modalDetail, setModalDetail] = useState();
  let [isOpen, setIsOpen] = useState(false);

  let [checkItem, setCheckItem] = useState();
  let [list, setList] = useState([]);
  let [skill, setSkill] = useState();
  let [pageConfig, setPageConfig] = useState({
    page: 1,
    pageSize: 5,
    total: 1,
  });

  const getUser = (addr) => {
    getUserInfo({ address: addr }).then((res) => {
      if (res.code === 0) {
        console.log(res.data);
        userInfo = res.data;
        setUserInfo({ ...userInfo });
      }
    });
  };

  const changeItem = (e) => {
    checkItem = e;
    setCheckItem(checkItem);
  };

  const init = () => {
    const addr = location.search.split("?")[1];
    if (!addr && address) {
      getUser(address);
      selectAddr = address;
      setSelectAddr(selectAddr);
    } else if (addr) {
      getUser(addr);
      selectAddr = addr;
      setSelectAddr(selectAddr);
    }
    checkItem = "worker";
    setCheckItem(checkItem);
  };

  const openModal = (e) => {
    modalDetail = null;
    modalDetail = e;
    modalDetail.stages =
      typeof modalDetail.stages === "string"
        ? JSON.parse(modalDetail.stages)
        : modalDetail.stages;
    let amount = 0;
    modalDetail.stages.amount.map(e => {
        amount += Number(e)
    })
    let period = 0;
    modalDetail.stages.period.map(e => {
        period += Number(e)
    })
    modalDetail.task.budget = amount;
    modalDetail.task.currency = ConvertTokenAddress(modalDetail.currency);
    modalDetail.task.period = period * 24 * 60 * 60;

    setModalDetail({ ...modalDetail });
    setIsOpen(true);
  };

  useEffect(() => {
    init();
  }, [address]);

  useUpdateEffect(() => {
    let obj = { ...pageConfig };
    obj[checkItem] = address;
    // TODO: 获取order
    getOrderUser(obj).then((res) => {
      if (res.code === 0) {
        pageConfig.total = res.data.total;
        setPageConfig({ ...pageConfig });
        list = res.data.list ? res.data.list : [];
        setList([...list]);
      }
    });
  }, [checkItem, pageConfig.page]);

  useEffect(() => {
    // 获取技能树
    getSillTreeMap().then((res) => {
      if (res.code === 0) {
        skill = res.data;
        setSkill([...skill]);
      }
    });
  }, []);

  return (
    <div className="myinfo">
      {modalDetail && (
        <Modal
          title=""
          open={isOpen}
          footer={null}
          style={{
              borderRadius: "28px",
              overflow: "hidden",
              padding: 0
          }}
          bodyStyle={{
            padding: 0,
            paddingTop: 0,
            position: "relative"
          }}
          onCancel={() => {
            setIsOpen(false);
          }}
          className="enddingModal"
          closeIcon={<></>}
          width="1200px"
        >
            <div className="top">
                <div className="enddingModal-header">
                    <p className="title">{modalDetail.task.title}</p>
                    <div className="amount">
                        <p>
                            {t("task.amount")}&nbsp;&nbsp;
                            <span>
                                {modalDetail.task.budget}
                                {modalDetail.task.currency}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="payMode">
                    <p className="title">{t("order.model.title")}</p>
                    <p>
                        {
                            modalDetail.pay_type === 1 ? 
                            t("order.model.model1")
                            :
                            t("order.model.model2")
                        }
                    </p>
                </div>
            </div>
            <TaskDetail task={modalDetail.task} />
        </Modal>
      )}
      {isModify && (
        <ModifyUserModal
          status={isModify}
          setStatus={setIsModify}
          info={userInfo}
        />
      )}
      <div className="myinfo-content">
        <div className="userInfo">
          {userInfo && (
            <>
              <div className="userInfo-detail">
                <div className="detail-avatar">
                  {userInfo.avatar ? (
                    <img
                      src={
                        process.env.NEXT_PUBLIC_DEVELOPMENT_API +
                        "/" +
                        userInfo.avatar
                      }
                      alt=""
                    />
                  ) : (
                    <img src={HashAvatar(userInfo.address)} alt="" />
                  )}
                </div>
                <p className="detail-name">
                  {userInfo.username
                    ? userInfo.username
                    : address.substring(0, 5) +
                      "..." +
                      address.substring(38, 42)}
                </p>
                <p className="detail-desc">
                  {userInfo.description ? userInfo.description : t("user.none")}
                </p>
                <div className="detail-sociality">
                    <UserSocialMedia userInfo={userInfo} />
                </div>
              </div>
              <div className="userInfo-role">
                <p className="title">
                  {t("applylist.skill")}:&nbsp;&nbsp;
                  {deform_Skills(userInfo.role, skill).map((e, i) => (
                    <span className="role" key={i}>
                      {i18n.language === 'en' ? e.en : e.zh}
                    </span>
                  ))}
                  {userInfo.role.length === 0 && (
                    <span className="roleNone">{t("user.none")}</span>
                  )}
                </p>
                {selectAddr === address && (
                  <Button
                    type="primary"
                    icon={<FormOutlined />}
                    onClick={() => setIsModify(true)}
                  >
                    <span className="ml20">{t("user.edit")}</span>
                  </Button>
                )}
              </div>
              <div className="line"></div>
              <div className="task">
                <p className="title">{t("user.title")}</p>
                <ul>
                  <li
                    className={`${checkItem === "worker" ? "active" : ""}`}
                    onClick={() => changeItem("worker")}
                  >
                    {t("user.subtitle1")}
                  </li>
                  <li
                    className={`${checkItem === "issuer" ? "active" : ""}`}
                    onClick={() => changeItem("issuer")}
                  >
                    {t("user.subtitle2")}
                  </li>
                </ul>
                <div className="list">
                  {list.length > 0 ? (
                    list.map((e) => (
                      <div
                        className="user-info-item"
                        key={e.ID}
                        onClick={() => openModal(e)}
                      >
                        <div className="li">
                          <div className="li-title">
                            <p className="text-ellipsis">{e.task.title}</p>
                            <a 
                              className="goSBT" 
                              href={`https://testnets.opensea.io/${location.pathname.indexOf('/zh') === -1 ? '':'zh-CN/'}assets/mumbai/${address === e.issuer ? Sysmbol().Issuer: Sysmbol().Builder}/${e.order_id}`} 
                              target="_blank"
                            >
                              <div>
                                {t("gosbt")} &gt;&gt;
                              </div>
                            </a>
                          </div>
                          <div className="li-content">
                            <div className="li-info">
                              <p className="role info-title">
                                {t("task.skill")}: &nbsp;
                                {deform_Skills(e.task.role, skill).map((e) => (
                                  <span key={e.index}>
                                    {i18n.language === 'en'
                                      ? e.en
                                      : e.zh}
                                  </span>
                                ))}
                              </p>
                              <div className="detail">
                                <p className="info-content info-title">
                                  {t("task.period")}: &nbsp;
                                  <span>{e.task.period / 60 / 60 / 24}</span>
                                  <span>&nbsp;{t("task.day")}</span>
                                </p>

                                <p className="info-content info-title">
                                  {t("task.amount")}: &nbsp;
                                  {e.budget == 0 ? (
                                    <span>{t("task.quotation")}</span>
                                  ) : (
                                    <span>
                                      {ConvertToken(e.currency, e.amount)}&nbsp;
                                      {ConvertTokenAddress(e.currency)}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="img">
                          <img
                            src={`/img/img-completed-${
                              location.pathname.indexOf("zh") === -1
                                ? "en"
                                : "zh"
                            }.png`}
                            alt=""
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="nodata">
                      <p>{t("user.nodata")}</p>
                      {checkItem === "worker" ? (
                        <Link href="/projects">
                          <Button>{t("user.btn2")}</Button>
                        </Link>
                      ) : (
                        <Link href="/publish">
                          <Button>{t("user.btn1")}</Button>
                        </Link>
                      )}
                    </div>
                  )}
                  {list.length > pageConfig.pageSize && (
                    <Pagination
                      className="item-pagination"
                      pageSize={pageConfig.pageSize}
                      current={pageConfig.page}
                      total={pageConfig.total}
                      onChange={(e) => {
                        (pageConfig.page = e), setPageConfig({ ...pageConfig });
                      }}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}