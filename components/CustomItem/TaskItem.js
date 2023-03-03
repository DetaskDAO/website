import { Button, Empty, Modal, message, Skeleton } from "antd";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { modifyApplySwitch, getSillTreeMap, getApply } from '../../http/_api/task'
import { ConvertToken, ConvertTokenAddress, taskCurrency } from "../../utils/Currency";
import { deform_Skills } from "../../utils/Deform";
import { HashAvatar } from "../../utils/HashAvatar";
import Link from "next/link";


export default function     TaskItem(params) {
    
    const { taskList, select, who, applyCancel, isLoading, skeletonHash } = params;
    const { t } = useTranslation("task");
    const router = useRouter();
    const { address } = useAccount();

    let [skill, setSkill] = useState();

    // 修改报名开关
    const applySwitch = (id,sw) => {
        if ( sw == 1 ) {
            sw = 0
        }else{
            sw = 1
        }
        modifyApplySwitch({
            task_id: id,
            apply_switch: sw
        })
        .then((res)=>{
            if ( res.code == 0 ) {
                message.success(res.msg)
                setTimeout(() => {
                    history.go(0)
                }, 500);
            }else{
                message.error(res.msg)
            }
        })
    }

    // 选择修改的任务
    const checkItem = (e) =>{
        router.push({pathname: `/publish`, search: e})
    }

    const cancel = async(e) => {
        const apply = await getApply({task_id: e.task_id})
        if (apply.data.list[0].status != 1) {
            history.go(0)
            return
        }
        applyCancel({
            recklesslySetUnpreparedArgs: [
                Number(e.task_id)
            ]
        })
    }

    const getAvatar = (url, addr) => {
        if (url) {
            return process.env.NEXT_PUBLIC_DEVELOPMENT_API + "/" + url
        }else{
            return HashAvatar(addr)
        }
    }

    const getUsername = (name, addr) => {
        if (name) {
            return name
        }else{
            return addr.substring(0,5) + "..." + addr.substring(38,42)
        }
    }

    useEffect(() => {
        // 获取技能树
        getSillTreeMap()
        .then(res => {
            if (res.code === 0) { 
                skill = res.data;
                setSkill([...skill]);
            }
        })
    },[])
    

    const print = () => {
        switch (select) {
            case 'tasks':
                return taskList.map((e,i) => 
                    <div className="item" key={i}>
                        <div className="li">
                            <div className="li-title" onClick={() => router.push(`/applylist?task_id=${e.task_id}`)}>
                                <p className="text-ellipsis">{e.title}</p>
                            </div>
                            <div className="li-content">
                                <div className="li-info">
                                    <p className="role info-title">{t("task.skill")}{t("mao")}  &nbsp;
                                        {
                                            deform_Skills(e.role, skill).map(e => 
                                                <span key={e.index}>
                                                    {
                                                        location.pathname.indexOf("/zh") === -1 ? e.en : e.zh
                                                    }
                                                </span>
                                            )
                                        }
                                    </p>
                                    <div className="detail">
                                        <p className="info-content info-title">{t("task.period")}{t("mao")} &nbsp;<span>{e.period / 60 / 60 / 24}</span><span>&nbsp;{t("task.day")}</span></p>
                                        
                                        <p className="info-content info-title">{t("task.amount")}{t("mao")} &nbsp;
                                        {
                                            e.budget == 0 ? 
                                            <span>{t("task.quotation")}</span>
                                            :
                                            <span>
                                                {/* {taskCurrency(e.currency, e.budget)} */}
                                                {e.budget}&nbsp;
                                                {e.currency}
                                            </span>
                                        }
                                        </p>
                                    </div>
                                </div>
                                {/* TODO: 修改Task ==> resolution */}
                                {/* <Button onClick={() => }>修改</Button> */}
                                <div className="li-num">
                                    <p>{e.apply_count}</p>
                                    <p>{t("task.applynum")}</p>
                                </div>
                                {
                                    address && 
                                    <div className="btns">
                                        <Button onClick={() => applySwitch(e.task_id,e.apply_switch)}>{e.apply_switch === 0 ? t("userproject.btn-open") : t("userproject.btn-close")}</Button>
                                        {/* <Button onClick={() => delTask(e.task_id) }>Cancel</Button> */}
                                        <Button loading={isLoading} onClick={() => checkItem(e.task_id)}>{t("userproject.btn-edit")}</Button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                )
            case 'apply':       //  TODO ==>
                return taskList.map((e,i) => 
                    <div className="item" key={i}>
                        <div className="li">
                            <div className="li-title" onClick={() => router.push(`/task/${e.task_id}`)}>
                                <p className="text-ellipsis">{e.title}</p>
                            </div>
                            <div className="li-content">
                                <div className="li-info">
                                    <p className="role info-title">{t("task.skill")}{t("mao")}  &nbsp;
                                        {
                                            deform_Skills(e.role, skill).map(e => 
                                                <span key={e.index}>
                                                    {
                                                        location.pathname.indexOf("/zh") === -1 ? e.en : e.zh
                                                    }
                                                </span>
                                            )
                                        }
                                    </p>
                                    <div className="detail">
                                        <p className="info-content info-title">{t("task.period")}{t("mao")} &nbsp;<span>{e.period / 60 / 60 / 24}</span><span>&nbsp;{t("task.day")}</span></p>
                                        
                                        <p className="info-content info-title">{t("task.amount")}{t("mao")} &nbsp;
                                        {
                                            e.budget == 0 ? 
                                            <span>{t("task.quotation")}</span>
                                            :
                                            <span>
                                                {/* {taskCurrency(e.currency, e.budget)} */}
                                                {e.budget}&nbsp;
                                                {e.currency}
                                            </span>
                                        }
                                        </p>
                                    </div>
                                </div>
                                {
                                    e.status !== 2 &&
                                    <div className="btns">
                                        <Link href={`/task/${e.task_id}`}>
                                            <Button>{t("btn-modify")}</Button>
                                        </Link>
                                        <Button onClick={() => cancel(e)}>{t("btn-cancel")}</Button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                )
            case 'developping':
                return taskList.map((e,i) => 
                    <div className="item" key={i}>
                        <div className="li">
                        <div className="li-title">
                                <p className="text-ellipsis">{e.task.title}</p>
                            </div>
                            <div className="li-content">
                                <div className="li-info">
                                    <p className="role info-title">{t("task.skill")}{t("mao")} &nbsp;
                                        {
                                            deform_Skills(e.task.role, skill).map(e => 
                                                <span key={e.index}>
                                                    {
                                                        location.pathname.indexOf("/zh") === -1 ? e.en : e.zh
                                                    }
                                                </span>
                                            )
                                        }
                                    </p>
                                    <div className="detail">
                                        <p className="info-content info-title">{t("task.period")}{t("mao")} &nbsp;<span>{e.task.period / 60 / 60 / 24}</span><span>&nbsp;{t("task.day")}</span></p>
                                        
                                        <p className="info-content info-title">{t("task.amount")}{t("mao")} &nbsp;
                                        {
                                            e.budget == 0 ? 
                                            <span>{t("task.quotation")}</span>
                                            :
                                            <span>{ConvertToken(e.currency, e.amount)}&nbsp;{ConvertTokenAddress(e.currency)}</span>
                                        }
                                        </p>
                                        <div className="info-title info-content flex">
                                            {
                                                address === e.issuer ? t("worker") : t("issuer")
                                            }{t("mao")} &nbsp;
                                            <div className="avatar">
                                                {
                                                   address === e.issuer ? 
                                                        <img src={getAvatar(e.worker_info.avatar, e.worker)} alt="" />
                                                        :    
                                                        <img src={getAvatar(e.issuer_info.avatar, e.issuer)} alt="" />
                                                }
                                            </div>
                                            <span className="ml55">
                                                {
                                                    address === e.issuer ? 
                                                        getUsername(e.worker_info.username, e.worker)
                                                        :
                                                        getUsername(e.issuer_info.username, e.issuer)
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {
                                    address && 
                                    <div className="btns">
                                        <Button  onClick={() => router.push(`/order?w=${who}&order_id=${e.order_id}`)}>{t("btn-view")}</Button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                )
            default:
                return taskList.map((e,i) => 
                    <div className="item" key={i}>
                        <div className="li">
                        <div className="li-title">
                                <p className="text-ellipsis">{e.task.title}</p>
                            </div>
                            <div className="li-content">
                                <div className="li-info">
                                    <p className="role info-title">{t("task.skill")}{t("mao")} &nbsp;
                                        {
                                            deform_Skills(e.task.role, skill).map(e => 
                                                <span key={e.index}>
                                                    {
                                                        location.pathname.indexOf("/zh") === -1 ? e.en : e.zh
                                                    }
                                                </span>
                                            )
                                        }
                                    </p>
                                    <div className="detail">
                                        <p className="info-content info-title">{t("task.period")}{t("mao")} &nbsp;<span>{e.task.period / 60 / 60 / 24}</span><span>&nbsp;{t("task.day")}</span></p>
                                        
                                        <p className="info-content info-title">{t("task.amount")}{t("mao")} &nbsp;
                                        {
                                            e.budget == 0 ? 
                                            <span>{t("task.quotation")}</span>
                                            :
                                            <span>{ConvertToken(e.currency, e.amount)}&nbsp;{ConvertTokenAddress(e.currency)}</span>
                                        }
                                        </p>
                                        <div className="info-title info-content flex">
                                            {
                                                address === e.issuer ? t("worker") : t("issuer")
                                            }{t("mao")} &nbsp;
                                            <div className="avatar">
                                                {
                                                   address === e.issuer ? 
                                                        <img src={getAvatar(e.worker_info.avatar, e.worker)} alt="" />
                                                        :    
                                                        <img src={getAvatar(e.issuer_info.avatar, e.issuer)} alt="" />
                                                }
                                            </div>
                                            <span className="ml55">
                                                {
                                                    address === e.issuer ? 
                                                        getUsername(e.worker_info.username, e.worker)
                                                        :
                                                        getUsername(e.issuer_info.username, e.issuer)
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* 
                                {
                                    address && 
                                        // TODO ==> 套用任务模版 ==> 新建Task
                                    <div className="btns">
                                        <Button>{t("userproject.btn-edit")}</Button>
                                    </div>
                                }
                                */}
                            </div>
                        </div>
                    </div>
                )
        }
    }

    return <>
        {
            skeletonHash && skeletonHash.hash && select === skeletonHash.bar &&    
            <div className="item" >
                <div className="li">
                    <Skeleton active  paragraph={{ rows: 2, }} />
                </div>
            </div>
        }
        {
            taskList.length > 0 ?
                print()
                :
                <Empty />
        }
    </>
}