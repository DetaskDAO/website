import { useEffect, useState } from "react"
import qs from 'querystring';
import { getApply, getSillTreeMap, updatedApplySort } from "@/request/_api/task";
import { searchTaskDetail } from "@/request/_api/public";
import { deform_Count, deform_Skills } from "@/utils/Deform";
import { getDate } from "@/utils/GetDate";
import Computing_time from "../components/Computing_time";
import { useAccount, useContract, useContractWrite, useProvider, useWaitForTransaction } from "wagmi";
import { message, Spin } from "antd";
import InviteModal from "../components/CustomModal/InviteModal";

import { ConfigOrder, useContracts } from "../src/controller";
import { ethers } from "ethers";
import { createOrder } from "@/request/_api/order";
import { useRouter } from "next/router";
import { Currency, taskCurrency } from "@/utils/Currency";
import { HashAvatar } from "@/utils/HashAvatar";
import UserSocialMedia from "../components/CustomItem/UserSocialMedia";
import i18n from 'i18next';
import { useTranslation } from "react-i18next";
import CustomStep from "@/components/CustomStep";

export default function ApplyList(params) {

    const { t } = useTranslation("task");
    const router = useRouter();
    const { address } = useAccount();

    let [showSpin,setShowSpin] = useState(false)
    const { write, data: createData, isLoading: loading } = useContractWrite({
        ...ConfigOrder("createOrder"),
        onSuccess(data) {
            writeSuccess(data.hash);
        },
        onError(err) {
            console.log(err);
        }
    })

    const waitForTransaction = useWaitForTransaction({
        hash: createData?.hash,
        onSuccess(data) {
            transactionSuccess(createData?.hash)
        },
        onError(err) {
            writeError()
        }
    })
    
    let [data, setData] = useState([]);     //  报名列表
    let [detail, setDetail] = useState({});     //  需求详情

    const [isModalOpen, setIsModalOpen] = useState(false);      //  邀请弹窗
    let [contractParams, setContractParams] = useState({});
    

    let [skill, setSkill] = useState();

    // approve ==> allowance
    // dUSDT
    const provider = useProvider();
    const abi = require(`@/deployments/abi/dUSDT.json`);
    const contract = useContract({
        addressOrName: process.env.NEXT_PUBLIC_CONTRACT_USDC,
        contractInterface: abi.abi,
        signerOrProvider: provider,
    
  })
    const { usedUSDTContractWrite: dUSDTapprove } = useContracts('approve');


    // 更改排序
    const updateData = (e) => {
        updatedApplySort({
            apply_addr: e.apply_addr, task_id: e.task_id
        })
        .then(res => {
            if (res.code === 0) {
                message.success(res.msg);
                init();
            }else{
                message.error(res.msg);
            }
        })
    }

    // 甲方邀请乙方弹窗
    const invite = (add) => {
        contractParams.worker = add;
        setContractParams({...contractParams});
        setIsModalOpen(true);
    }

    const tokenIsApprove = async(approve) => {
        await approve.writeAsync({
            recklesslySetUnpreparedArgs: [
                process.env.NEXT_PUBLIC_CONTRACT_PERMIT2, (Math.pow(2,32)-1).toString()
            ]
        })
    }

    const invitation = async(amount,token) => {
        let allowance = await contract.allowance(address, process.env.NEXT_PUBLIC_CONTRACT_PERMIT2);
        // 判断是否为ERC20
        if (token != ethers.constants.AddressZero) {
            // 判断当前币种是否approve ==> 发起approve
            switch (token) {
                case process.env.NEXT_PUBLIC_CONTRACT_USDC:
                    if (allowance.toString() == 0) {
                        await tokenIsApprove(dUSDTapprove)
                    }
                    break;
            
                default:
                    break;
            }
        }

        contractParams.amount = Currency(token,amount)
        write({
            recklesslySetUnpreparedArgs: [
                contractParams.task_id,
                address,
                contractParams.worker,
                token,
                contractParams.amount
            ]
        })
    }

    const writeSuccess = async(hash) => {
        await createOrder({hash: hash})
        .then(res => {
            if (res.code === 0) {
                setIsModalOpen(false)
                setShowSpin(true)
            }
            console.log(res.msg);
        })
    }

    const transactionSuccess = (hash) => {
        setTimeout(() => {
            router.push(`/user/projects?w=issuer&bar=developping&hash=${hash}`)    //  跳转链接
        }, 500);
    }

    const init = async() => {
        const { task_id } = qs.parse(location.search.slice(1));
        contractParams = {
            task_id: task_id,
            address: address,
            token: ethers.constants.AddressZero
        }
        setContractParams({...contractParams});

        await getApply({task_id: task_id})
        .then(res => {
            if (res.code === 0) {
                data = res.data.list;
                setData([...data]);
            }
        })
        await searchTaskDetail({task_id: task_id})
        .then(res => {
            if (res.code === 0 && res.data.list) {
                
                detail = res.data.list[0];
                detail.currency = detail.currency === 'USD' ? 'USDC' : detail.currency;
                detail.budget = deform_Count(detail.budget,detail.currency);
                setDetail(detail);

            }
        })
    }   

    useEffect(() => {
        init();
    },[])

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
    
    return (
        <Spin spinning={showSpin}>

        <div className="Applylist">
            {/* 用户详情弹窗 */}
            {/* <UserInfoModal show={isUserInfo} setShow={setIsUserInfo} userInfo={userInfo} /> */}
            {/* 邀请乙方弹窗 */}
            {
                isModalOpen && <InviteModal close={setIsModalOpen} invitation={invitation} loading={loading} />
            }
            {
                detail &&
                    <div className="task-info">
                        <div className="task-demand">
                            <p className="task-title">{detail.title}</p>
                            <p className="task-skill">
                                <i className="skill-tip">{t("task.skill")}{t("mao")}</i>
                                {
                                    skill?.length > 0 && detail.role &&
                                    deform_Skills(detail.role, skill).map(e => 
                                        <span key={e.index}>
                                            {
                                                i18n.language === 'en' ? e.en : e.zh
                                            }
                                        </span>
                                    )
                                }
                            </p>
                            <p className="task-cycle">{t("task.period")}{t("mao")}
                                <span>{parseInt(detail.period/86400)}&nbsp;{t("task.day")}</span>
                                {t("task.amount")}{t("mao")}
                                {
                                    detail.budget == 0 ? 
                                    <span>{t("task.quotation")}</span>
                                    :
                                    <span>
                                        {detail.budget}&nbsp;
                                        {detail.currency}
                                    </span>
                                }
                            </p>
                        </div>
                        {/* <div className="task-changeInfo" onClick={showModifyModal}>修改信息</div> */}
                        {/* <div className="task-delete" onClick={deleteTask}>删除任务</div> */}
                        {/* <div className="task-apply-switch" onClick={applyHandler}>{allInfo.apply_switch?"关闭报名":"开启报名"}</div> */}
                        <div className="apply-number">
                            <p className="a-number">{detail.apply_count}</p>
                            <p className="a-tip">{t("task.applynum")}</p>
                        </div>
                    </div>
            }

            <CustomStep
                current={1}
                status="process"
                size="small"
                list={[
                    t("step1"), t("step2"), t("step3"), t("step4"), t("step5"), t("step6")
                ]}
            />
            <div className="task-list">
                <h4>{t("applylist.title")}</h4>
                {/* <p className="task-list-subtitle">{t("applylist.subtitle")}</p> */}
                <div className="product-list" style={{marginTop: "50px"}}>
                    <ul>
                        {
                            data.map((e,i) => <li key={i} className={getDate(e.sort_time,'y') != '1-' ? 'sort':''} >
                                <div className="product-list-item">
                                    <div className="product-list-info">
                                        <div className="product-img" onClick={() => router.push({pathname: "/myInfo", search: e.user.address})}>
                                            {
                                                process &&
                                                <img 
                                                    src={ e.user.avatar ? 
                                                    process.env.NEXT_PUBLIC_DEVELOPMENT_API + "/" + e.user.avatar 
                                                    :
                                                    HashAvatar(e.apply_addr)} 
                                                />
                                            }
                                        </div>
                                        <div className="product-info">
                                            <p className="applicant-name" >{e.user.username ? e.user.username : e.apply_addr.substring(0,5)+"..."+e.apply_addr.substring(38,42)}
                                                {/* <span onClick={()=>showUserInfo(e.user)}>View personal information</span> */}
                                            </p>
                                            <p className="applicant-skill">
                                                <i className="good-skill">{t("applylist.skill")}{t("mao")} </i>
                                                {
                                                    skill?.length > 0 &&
                                                    deform_Skills(e.user.role, skill).map(e => 
                                                        <span key={e.index}>
                                                            {
                                                                i18n.language === 'en' ? e.en : e.zh
                                                            }
                                                        </span>
                                                    )
                                                }
                                            </p>
                                            <div className="applicant-mess">
                                                <UserSocialMedia userInfo={e.user} />
                                            </div>
                                        </div>
                                        <div className="product-apply">
                                            <p className="amount">
                                                {t("applylist.amount")}{t("mao")}
                                                <span>{taskCurrency(detail.currency, e.price)}&nbsp;{detail.currency}</span>
                                            </p>
                                            <div className="product-apply-time">
                                                <span className="product-apply-time-icon"><img src="/clock.jpg" /></span>
                                                <Computing_time create_time={e.created_at} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="product-apply-desc">
                                        <span></span>
                                        <div className="product-apply-desc-text">
                                            <p>{e.desc}</p>
                                        </div>
                                    </div>
                                </div>
                                    {
                                        address && 
                                        <div className="product-collaborate">
                                            {
                                                e.status === 2 && <button className="product-collaborate-no">{t("applylist.btn-invited")}</button>
                                            }
                                            {
                                                e.status === 1 && <button onClick={() => invite(e.apply_addr)}>{t("applylist.btn-invite")}</button>
                                            }
                                            <button 
                                                onClick={() => updateData(e)} 
                                                className="product-collaborate-no"
                                                disabled={getDate(e.sort_time,'y') != '1-'}
                                            >
                                                {t("applylist.btn-refuse")}
                                            </button>
                                        </div>
                                    }
                            </li> )
                        }
                    </ul>
                </div>
            </div>
        </div>
        </Spin>
    )
}

