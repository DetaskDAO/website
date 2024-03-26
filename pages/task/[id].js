

import { Button, message, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useAccount, useContractWrite, useSigner, useWaitForTransaction } from 'wagmi';
import { useRouter } from 'next/router';
import { ethers } from "ethers";

import { ConfigTask, useContracts } from '../../src/controller';

import { deform_Skills } from '@/utils/Deform';
import ApplyTaskModal from '../../components/CustomModal/ApplyTaskModal';
import Computing_time from '../../components/Computing_time';
import { getUserInfo, searchTaskDetail, updateUserInfo } from '@/request/_api/public';
import qs from 'querystring';
import { createApply, getApplyStatus, deleteApply, updateApplyInfo, getSillTreeMap } from '@/request/_api/task';
import { GetSignature } from '@/utils/GetSignature';
import ConnectModal from '../../components/CustomModal/ConnectModal';
import { taskCurrency, taskCurrencyValue } from '@/utils/Currency';
import { download } from '@/utils/download';
import i18n from 'i18next';
import { useTranslation } from "react-i18next";
import { constans } from "@/utils/constans";

export default function Task() {
    const { t } = useTranslation("task");
    const router = useRouter();
    const { address } = useAccount();
    const { getToken } = constans();

    const { write: Apply, data: ApplyData, isLoading: applyLoading } = useContractWrite({
        ...ConfigTask("applyFor"),
        onSuccess(data) {
            writeSuccess(data.hash)
        },
        onError(err) {
            console.log(err);
        }
    })
    const waitForApply = useWaitForTransaction({
        hash: ApplyData?.hash,
        onSuccess(data) {
            transactionSuccess(ApplyData?.hash)
        },
        onError(err) {
            writeError()
        }
    })

    const { write: ApplyCancel, data: ApplyCancelData, isLoading: applycancelLoading } = useContractWrite({
        ...ConfigTask("cancelApply"),
        onSuccess(data) {
            celSuccess(data.hash)
        },
        onError(err) {
            console.log(err);
        }
    })
    const waitForApplyCancel = useWaitForTransaction({
        hash: ApplyCancelData?.hash,
        onSuccess(data) {
            history.go(0)
        },
        onError(err) {
            writeError()
        }
    })

    // let { useTaskContractWrite: celTask } = useContracts("cancelApply");
    let [isModalOpen,setIsModalOpen] = useState(false);
    // task详情
    let [detail,setDetail] = useState();
    // 记录用户的联系方式
    let [userContact,setUserContact] = useState({})
    // 自我推荐
    let [desc, setDesc] = useState('');
    // task报名状态
    let [progress, setProgress] = useState(0);
    // task用户报名信息
    let [applyInfo,setApplyInfo] = useState({})
    // 连接钱包弹窗
    const [isModalVisible, setIsModalVisible] = useState(false);
    // 发送签名
    const { data: signer } = useSigner();
    // 遮罩层显示
    let [showSpin,setShowSpin] = useState(false)

    const showModal = ()=>{
        // 判断是否登陆 && 是否签名 && token有效期
        if (!address) {
            setIsModalVisible(true)
            return
        }else if(!getToken()){
            // 获取签名
            GetSignature({address:address,signer:signer});
            return  
        }
        setIsModalOpen(true)
    }

    const handleCancel = ()=>{
        setIsModalOpen(false)
    }

    const apply = async(obj) => {
        await getApply(detail.task_id)
        if (progress == 2) {
            history.go(0)
            return
        }
        let isUpdate = false;

        let flag = false;
        for (const i in obj) {
            if (obj[i] === '') {
                flag = true
            }
        }
        if (flag) {
            // message.warning("请完善信息!")
            return
        }
        desc = obj.desc;
        setDesc(desc);
        let amount = taskCurrencyValue(detail.currency, obj.valuation);
        Apply({
            recklesslySetUnpreparedArgs:[
                address,
                Number(detail.task_id),
                amount
            ]
        })
        console.log('desc ==>',obj);
        await updateUserInfo({
            ...userContact,
            address: address
        })
        .then(res => {
            isUpdate = res.code === 0 ? true : false;
        })
        if (!isUpdate) {
            return
        }

    }

    const transactionSuccess = (hash) => {
        setTimeout(()=>{
            router.push(`/user/projects?w=worker&bar=apply&hash=${hash}`)
        },500)
    }

    const writeSuccess = async(hash) => {
        applyInfo ? 
        await updateApplyInfo({
            task_id: detail.task_id,
            apply_addr: address,
            hash: hash,
            desc: desc
        })
        .then((res)=>{
            if (res.code === 0) {
                setIsModalOpen(false);
                setShowSpin(true)
            }
        })
        :
        await createApply({
            apply_addr: address,
            hash: hash,
            task_id: detail.task_id,
            desc: desc
        })
        .then(res => {
            if (res.code === 0) {
                setIsModalOpen(false);
                setShowSpin(true)
            }
        })
    }

    // 用户取消报名
    const celApply = async() => {
        let taskID = detail.task_id
        await getApply(taskID)
        if (progress != 1) {
            history.go(0)
            return
        }
        ApplyCancel({
            recklesslySetUnpreparedArgs:[
                Number(taskID)
            ] 
        })
    }

    const celSuccess = (hash) => {
        deleteApply({hash: hash})
        .then((res) => {
            if (res.code === 0) {
                setShowSpin(true)
            }
            console.log(res.msg);
        })
        .catch(err => {
            console.log(err);
        })
    }

    const switchBtns = () => {
        switch (progress) {
            case 0:
                return <Button className="btn" onClick={showModal}>{t("btn-apply")}</Button>
            case 1:
                return <div className='applyed-btns'>
                    <Button className='applyed-inspect' onClick={()=>setIsModalOpen(true)}>{t("btn-modify")}</Button>
                    <Button className='applyed-cancel' onClick={celApply} loading={applycancelLoading}>{t("btn-cancel")}</Button>
                </div>
            case 2:
                // 跳转Order页面
                return <Button className="btn" onClick={() => router.push(`/order?w=worker&order_id=${applyInfo.order_id}`)}>{t("btn-stage")}</Button>
            default:
                break;
        }
    }

    const getApply = async(task_id) => {
        // 获取该用户task状态
        var applyList;
        await getApplyStatus({
            address: address, task_id: task_id
        })
        .then(res => {
            if (res.code === 0) {
                applyList = res.data?.list || [];
            }
        })
        applyList.map((e)=>{
            if ( e.apply_addr == address ) {
                applyInfo = e;
                setApplyInfo({...applyInfo})
                console.log(applyInfo);
            }
        })
        if (applyList.length === 0) {
            progress = 0;   //  未报名
        }else if(applyList[0].status === 1) {
            progress = 1;   //  已报名
        }else{
            progress = 2;   //  甲方已选乙方
        }
        setProgress(progress);
    }

    const init = async() => {
        // 获取技能树
        const skill = await getSillTreeMap()
        console.log(skill?.data);
        const { id, issuer } = qs.parse(location.search.slice(1));
        const arr = location.pathname.split('/')
        const task_id = arr[arr.length-1];
        // 获取task详情
        await searchTaskDetail({
            task_id: task_id, id: id, issuer: issuer
        })
        .then(res => {
            if (res.code === 0 && res.data.list) {
                detail = res.data.list[0];
                detail.role = deform_Skills(detail.role, skill?.data);
                detail.currency = detail.currency === 'USD' ? 'USDC' : detail.currency;
                detail.budget = taskCurrency(detail.currency,detail.budget);
                detail.desc = JSON.parse(detail.attachment).desc;
                detail.suffix = JSON.parse(detail.attachment).suffix;
                detail.attachment = JSON.parse(detail.attachment).attachment;
                setDetail(detail);
            }
        })
        if (!address) {
            return
        }

        // 获取用户个人信息
        await getUserInfo({address:address})
        .then((res) => {
            if (res.code === 0) {
                userContact = res.data
                setUserContact({...userContact})
            }else{
                userContact = null;
                setUserContact(userContact);
            }
        })

        getApply(task_id)
    }

    useEffect(() => {
        init()
        console.log(detail);
    },[])

    return <div className="project">
        <Spin spinning={showSpin}>
        {
            isModalVisible && 
            <ConnectModal
                setStatus={setIsModalVisible} 
                status={isModalVisible} 
            />
        }
        {
            detail &&
            <div className="project-content">
            <div className="content-nav">
                <div className="nav-left">
                    <div className="img">

                    </div>
                    <div className="info">
                        <p className="title">{detail.title}</p>
                        <div className='time'>
                            <img className='time-icon' src='/clock-white.jpg' />
                            <Computing_time create_time={detail.created_at} />
                        </div>
                        <p className="skills">
                            {t("task.skill")}{t("mao")}
                            {
                                detail.role.map((e,i) => <span key={i}>
                                    {
                                        i18n.language === 'en' ? 
                                        e.en
                                        :
                                        e.zh
                                    }
                                </span> )
                            } 
                        </p>
                    </div>
                </div>
                { switchBtns() }
            </div>
            {
                progress === 2 && detail.issuer !== address &&
                <p className='applyed-tip2'>{t("tip-stage")}</p>
            }
            <div className="content-container">
                <p className='task-details'>{t("detail-title")}</p>
                <div className='task-detail-list'>
                    <p className='task-cost task-li'>
                        <span className='task-cost-title title'>{t("task.amount")}{t("mao")}&nbsp;</span>
                        <span className='task-cost-price content'>
                            {
                                detail.budget == 0 ? 
                                t("task.quotation")
                                :
                                <>
                                {detail.budget}&nbsp;{detail.currency}
                                </>
                            }
                        </span>
                    </p>
                    <p className='task-date task-li'>
                        <span className='task-date-title title'>{t("task.period")}{t("mao")}&nbsp;</span>
                        <span className='task-date-time content'>{detail.period / 86400} {t("task.day")}</span>
                    </p>
                </div>
                <div className="content-li">
                    <p className="li-title">{t("task.desc")}{t("mao")}</p>
                    <div className="li-box">
                        <p className="detail content">
                            {detail.desc}
                        </p>
                    </div>
                </div>
                {
                    detail.suffix &&
                    <div className="content-li">
                        <p className="li-title">{t("task.file")}{t("mao")}</p>
                        <div className="li-box">
                            <div className="upload">
                                <p className="upload-title File" onClick={() => download(`${process.env.NEXT_PUBLIC_DEVELOPMENT_FILE}/${detail.attachment}`,detail.suffix)}>
                                    {detail.suffix}
                                </p>
                                {/* <p>下载</p> */}
                            </div>
                        </div>
                    </div>
                }
                <div className="content-li">
                    <p className="li-title">{t("task.skill")}{t("mao")}</p>
                    <div className="li-box boxs">
                        {
                            detail.role.map((e,i) => <div className="box" key={i}>
                                {
                                    i18n.language === 'en' ? 
                                    e.en
                                    :
                                    e.zh
                                }
                            </div> )
                        }
                    </div>
                </div>

            </div>
            </div>
        }
        {/* <Button type="primary" className="project-btn" onClick={showModal}>报名参加</Button> */}
        
            {/* <Modal_applyTask setParams={setParams} params={params} project={project} submit={apply} applyInfo={userApplyInfo} userContact={userContact} /> */}
            {
                isModalOpen &&
                <ApplyTaskModal 
                    open={isModalOpen} 
                    onCancel={handleCancel} 
                    project={detail} 
                    submit={apply} 
                    userContact={userContact} 
                    setUserContact={setUserContact} 
                    applyInfo={applyInfo} 
                    applyLoading={applyLoading}
                />
            }
            </Spin>
    </div>


}
