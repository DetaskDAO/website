import { useEffect, useState } from "react";
import { Modal } from "antd";
import { useAccount } from 'wagmi'
import qs from 'querystring';
import { getOrderDetail, getOrderMsg, readOrderMsg } from "@/request/_api/order";
import TaskDetail from "../components/CustomItem/TaskDetail";
import UserDetail from "../components/CustomItem/UserDetail";
import OrderSetStage from "../components/CustomItem/OrderSetStage";
import OrderStageList from "../components/CustomItem/OrderStageList";
import { useRead } from "../src/controller";
import { BigNumberRandom, NonceBitmap, Permit2Nonce } from "@/utils/Permit2Nonce";
import { ConvertToken, ConvertTokenAddress } from "@/utils/Currency";
import { useTranslation } from "react-i18next";
import OrderNav from "@/components/Order/OrderNav";
import CustomStep from "@/components/CustomStep";

export default function Order(props) {
    
    const { t } = useTranslation("task");
    const { address } = useAccount();
    let [search, setSearch] = useState({        // 地址栏参数
        who: '', order_id: ''
    });
    let [task, setTask] = useState();           // task详情
    let [order, setOrder] = useState();         // order详情
    let [stages, setStages] = useState();       // 阶段详情
    let [progress, setProgress] = useState(0);       // 阶段详情

    // permit2 Nonce
    let [nonce, setNonce] = useState(0);
    let [nonceBitmap, setNonceBitmap] = useState(0);
    let [isUse, setIsUse] = useState(true);
    const { usePermit2Read: permit2Nonce } = useRead('nonceBitmap', [address, nonceBitmap])

    useEffect(() => {
        if (permit2Nonce.data && nonce != 0) {
            isUse = Permit2Nonce(nonce, permit2Nonce.data.toString())
            setIsUse(isUse);
            if (!isUse) {
                nonceInit()
            }
        }
    },[permit2Nonce])

    const statusTips = () => {
        switch (order?.status) {
            case "WaitWorkerStage":
                if (address === order.issuer) {
                    return <div className="tipbox">
                        {t("tips.WaitWorkerStage")}
                    </div>
                }
                break;
        
            default:
                break;
        }
        return 
    }
    
    const switchStages = () => {
        switch (order.progress) {
            case 0:
                return <OrderSetStage 
                    search={search} 
                    order={order} 
                    task={task} 
                    amount={task.budget}
                    dataStages={stages}
                    permit2Nonce={nonce}
                 />     //   设置阶段
            default:
                return <OrderStageList 
                    order={order} 
                    dataStages={stages} 
                    task={task} 
                    permit2Nonce={nonce}
                    />     //   阶段开始
        }
    }

    const init = () => {
        const { w, order_id } = qs.parse(location.search.slice(1));
        search.who = w;
        search.order_id = order_id;
        setSearch({...search});
        // 获取任务详情

        let obj = {};
        if (w === 'issuer') {
            obj.issuer = address;
        }else{
            obj.worker = address;
        }
        if (!address) {
            return
        }

        getOrderDetail({order_id: order_id, ...obj})
        .then(res => {
            if (res.code === 0 && res.data.list && res.data.list.length !== 0) {
                order = res.data.list[0];
                task = res.data.list[0].task;
                // task.role = deform_Skills(task.role);
                task.budget = ConvertToken(order.currency, order.amount);
                task.currency = ConvertTokenAddress(order.currency);

                delete res.data.list[0].task;
                if (order.stage_json) {
                    // 如果有last_stage_json ==>
                    // 如果有last_stages ==>
                    let arr = []
                    if (order.status === 'WaitProlongAgree') {
                        let cache = order.stages;
                        order.stages = order.last_stages;
                        order.last_stages = JSON.parse(cache);
                    }

                    if (order.status === "WaitAppendAgree") {
                        order.last_stages = JSON.parse(order.last_stages);
                        order.last_stage_json = JSON.parse(order.last_stage_json);
                    }

                    order.stage_json = JSON.parse(order?.stage_json);
                    order.stages = JSON.parse(order.stages);
                    if (order.status === 'WaitProlongAgree') {
                        order.stages.deadline = order.last_stages.deadline;
                    }

                    order.stages.amount.map((e,i) => {
                        arr.push({
                            amount: e,
                            period: order.stages.period[i],
                            name: order.stage_json.stages[i].milestone.title,
                            desc: order.stage_json.stages[i].milestone.content
                        })
                    })
                    stages = arr;
                    setStages([...stages]);
                }
                setTask({...task});
                setOrder({...order});
                console.log("order ==>", order);
                if (order.progress !== 0 && order.progress !== 1) {
                    progress = order.progress === 2 ? 1 : 2;
                    setProgress(progress);
                }
            }
        })
    }

    const nonceInit = () => {
        nonce = BigNumberRandom();
        setNonce(nonce);
    
        nonceBitmap = NonceBitmap(nonce);
        setNonceBitmap(nonceBitmap);
    }

    useEffect(() => {
        init();
        nonceInit()
    },[])

    useEffect(() => {
        if (order?.order_id) {
            getOrderMsg({order_id: order.order_id})
            .then(res => {
                // 对方修改了
                if (res.code === 0 && res.data.list?.length > 0) {
                    setTimeout(() => {
                        Modal.warning({
                            title: '',
                            okText: t("order.modal-modify.ok"),
                            content: <div className="" dangerouslySetInnerHTML={{__html: res.data.list[0].message}} />,
                            onOk() {
                                readOrderMsg({order_id: order.order_id});
                            }
                          });
                    }, 1000);
                }
            })
        }
    },[order?.order_id])

    return <div className="WorkerProject">
                <OrderNav task={task} />
                {
                    order &&
                    <>
                        <div className="worker-steps">
                            <CustomStep
                                current={order.progress === 2 ? 3+progress : 2+progress}
                                status="process"
                                size="small"
                                list={[
                                    t("step1"), t("step2"), t("step3"), t("step4"), t("step5"), t("step6")
                                ]}
                            />
                        </div>      
                        {/* 对方详情 */}
                        <UserDetail address={search.who === 'issuer' ? order.worker : order.issuer} who={search.who} />
                        {/* 根据阶段打印 */}
                        {statusTips()}
                        {switchStages()}
                    </>
                }
                
                {
                    task &&
                    <TaskDetail task={task} />
                }
    </div>
}