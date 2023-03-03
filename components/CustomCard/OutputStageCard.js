import { message, Spin } from "antd";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { useAccount, useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { ConfigOrder, useContracts, useRead, useSignProData } from "../../controller";
import { startOrder, updatedStage } from "../../http/_api/order";
import StageOutput from "../CustomItem/StageOutput";
import DeliveryModal from "../CustomModal/DeliveryModal";
import ProlongModal from "../CustomModal/ProlongModal";



export default function OutputStageCard(params) {
    
    const { edit, remove, cache, isEdit, data, stageIndex, who, oid, task, order, agreeAppend, payAppend, inspection, token, chainStages } = params;
    const { chain } = useNetwork();
    const { address } = useAccount();

    let [list, setList] = useState([]);
    const { t } = useTranslation("task");
    
    let [isDelivery, setIsDelivery] = useState(false);  //  交付弹窗
    let [deliveryObj, setDeliveryObj] = useState({});

    let [isProlong, setIsProlong] = useState(false);
    let [prolongObj,setProlongObj] = useState({});  //  延长签名
    let [prolongReady, setProlongReady] = useState(false);
    const { useSign: prolongSign, obj: prolongConfig } = useSignProData(prolongObj);  //  延长签名

    let [isLoading, setIsLoading] = useState(false);
    let [activeIndex, setActiveIndex] = useState();
    let [deadline, setDeadline] = useState();

    let [chainStartDate, setChainStartDate] = useState('');

    const { useDeOrderVerifierRead: nonces } = useRead('nonces', [address, Number(oid)]);

    const { useDeOrderVerifierRead: getOrder } = useRead('getOrder', [Number(oid)]);

    let [showSpin,setShowSpin] = useState(false)

    // 交付
    const { write: updateAttachment, data: updateStageData } = useContractWrite({
        ...ConfigOrder("updateAttachment"),
        onSuccess(data) {
            order.stage_json.stages[stageIndex].delivery = deliveryObj;
            updatedStage({
                obj: JSON.stringify(order.stage_json),
                order_id: oid,
                hash: data.hash
            })
            .then(res => {
                if (res.code === 0) {
                    setShowSpin(true)
                }
            })
        },
        onError(err) {
            console.log(err);
            setIsLoading(false);
        }
    })
    const waitForUpdate = useWaitForTransaction({
        hash: updateStageData?.hash,
        onSuccess(data) {
            reload()
        },
        onError(err) {
            console.log("Update error ==>",err);
        }
    })
    // 确认交付
    const { write: confirmAttachment, data: confirmStageData } = useContractWrite({
        ...ConfigOrder("confirmDelivery"),
        onSuccess(data) {
            updatedStage({
                order_id: oid,
                hash: data.hash,
                status: "IssuerAgreeStage"
            })
            .then(res => {
                if (res.code === 0) {
                    setShowSpin(true)
                }
            })
        },
        onError(err) {
            console.log(err);
            setIsLoading(false);
        }
    })
    const waitForConfirm = useWaitForTransaction({
        hash: confirmStageData?.hash,
        onSuccess(data) {
            reload()
        },
        onError(err) {
            console.log("confirm error ==>",err);
        }
    })
    // 延期
    const { write: prolongStage, data: prolongStageData } = useContractWrite({
        ...ConfigOrder("prolongStage"),
        onSuccess(data) {
            updatedStage({
                hash: data.hash,
                status: 'AgreeProlong'
            })
            .then(res => {
                if (res.code === 0) {
                    setShowSpin(true)
                }
            })
        },
        onError(err) {
            console.log(err);
            setIsLoading(false);
        }
    })
    const waitForProlong = useWaitForTransaction({
        hash: prolongStageData?.hash,
        onSuccess(data) {
            reload()
        },
        onError(err) {
            console.log("prolong error ==>",err);
        }
    })
    // 领钱
    const { write: getWithdraw, data: withdrawData } = useContractWrite({
        ...ConfigOrder("withdraw"),
        onSuccess(data) {
            startOrder({
                order_id: order.order_id
            })
            .then(res => {
                handelRes(res)
            })
        },
        onError(err) {
            console.log(err);
            setIsLoading(false);
        }
    })
    const waitForWithdraw = useWaitForTransaction({
        hash: withdrawData?.hash,
        onSuccess(data) {
            reload()
        },
        onError(err) {
            console.log("withdraw error ==>",err);
        }
    })
    // 终止
    const { write: abortOrder, data: abortData } = useContractWrite({
        ...ConfigOrder("abortOrder"),
        onSuccess(data) {
            updatedStage({
                hash: data.hash
            })
            .then(res => {
                if (res.code === 0) {
                    setShowSpin(true)
                }
            })
        },
        onError(err) {
            console.log(err);
            setIsLoading(false);
        }
    })
    const waitForAbort = useWaitForTransaction({
        hash: abortData?.hash,
        onSuccess(data) {
            reload()
        },
        onError(err) {
            console.log("abortData error ==>",err);
        }
    })
    
    
    // 请求返回处理
    const handelRes = (res) => {
        if (res.code === 0) {
            message.success(res.msg)
            setTimeout(() => {
                history.go(0)
            }, 500);
        }else{
            setTimeout(() => {
                history.go(0)
            }, 5000);
            setIsLoading(false)
            // setGoing(false)  
        }
    }

    const reload = () => {
        setTimeout(() => {
            history.go(0)
        }, 2500);
    }

    // 领钱
    const withdraw = () => {
        setIsLoading(true);
        getWithdraw({
            recklesslySetUnpreparedArgs: [Number(oid), address]
        })
    }

    // 终止
    const abort = () => {
        setIsLoading(true);
        abortOrder({
            recklesslySetUnpreparedArgs: [Number(oid)]
        })
    }

    // 提交阶段交付
    const updateDelivery = (e) => {
        setIsLoading(true);
        deliveryObj = e;
        setDeliveryObj({...deliveryObj})

        // 上链 ==> 更新数据库
        updateAttachment({
            recklesslySetUnpreparedArgs: [Number(oid), e.attachment]
        })
    }

    // 确认阶段交付
    const confirmDelivery = () => {
        // 上链 ==> 更新数据库
        // console.log(Number(oid), Number(stageIndex));
        let arr = [];
        for (let i = 0; i <= Number(stageIndex); i++) {
            if (chainStages[i].status == 0) {
                arr.push(i);
            }
        }
        setIsLoading(true);
        confirmAttachment({
            recklesslySetUnpreparedArgs: [Number(oid), arr]
        })
    }

    // 发起阶段延长
    const updateProlong = (period) => {
        if (order.status === 'WaitAppendAgree') {
            // message.warning('请先确认「新增申请」')
            return
        }
        setIsLoading(true);

        let now = parseInt(new Date().getTime()/1000);
        // TODO:Deadline
        let setTime = 5 * 60;
        deadline = now+setTime;
        setDeadline(deadline);
        prolongObj = {
            chainId: chain?.id,
            orderId: oid,
            stageIndex: activeIndex,
            period: `${period * 24 * 60 * 60}`,
            nonce: Number(nonces.data.toString()),
            deadline: deadline,
        }
        setProlongObj({...prolongObj});
        setProlongReady(true);
    }

    // 确认阶段延长
    const confirmProlong = () => {
        if (!inspection()) {
            return
        }
        setIsLoading(true)
        const prolongValue = (order.last_stages.period[stageIndex] - order.stages.period[stageIndex]) * 24 * 60 * 60
        const r = '0x' + order.signature.substring(2).substring(0, 64);
        const s = '0x' + order.signature.substring(2).substring(64, 128);
        const v = '0x' + order.signature.substring(2).substring(128, 130);
        prolongStage({
            recklesslySetUnpreparedArgs: [oid, stageIndex, prolongValue, order.sign_nonce, order.last_stages.deadline, v, r, s]
        })
    }

    // 拒绝阶段延长
    const rejectProlong = () => {
        updatedStage({
            order_id: oid,
            status: 'DisagreeProlong'
        })
        .then(res => {
            handelRes(res)
        })
    }

    // 确认新增阶段
    const confirmAppend = async() => {
        setIsLoading(true);
        // 判断是谁
        if (who === 'issuer') {
            // 直接付款
            await payAppend()
        }else{
            // 签名
            await agreeAppend()
        }
        setIsLoading(false);
    }

    // 拒绝阶段新增
    const rejectAppend = () => {
        updatedStage({
            order_id: oid,
            status: 'DisagreeAppend'
        })
        .then(res => {
            handelRes(res)
        })
    }

    // 更新阶段
    const update = (obj,signature,status) => {
        // 判断数据库stagejson.stages ? obj 长度是否一致
        if (order.stage_json.stages.length !== obj.length) {
            // stages添加阶段
            order.stage_json.stages.push({
                milestone: {
                    type: 'raw',
                    content: obj[obj.length-1].desc,
                    title: obj[obj.length-1].name
                },
                delivery: {
                    attachment: '',
                    fileType: '',
                    content: ''
                }
            })
        }

        order.stages.amount = [];
        order.stages.period = [];
        order.stages.deadline = deadline;
        obj.map(e => {
            order.stages.amount.push(e.amount);
            order.stages.period.push(e.period);
        })
        
        updatedStage({
            signature: signature,
            sign_address: address,
            sign_nonce: Number(nonces.data.toString()),
            obj: JSON.stringify(order.stage_json),
            order_id: oid,
            stages: JSON.stringify(order.stages),
            status: status
        })
        .then(res => {
            handelRes(res)
        })
    }

    useEffect(() => {
        if (getOrder.data) {
            chainStartDate = getOrder.data.startDate;
            setChainStartDate(chainStartDate);
        }
    },[getOrder])

    useEffect(() => {
        if (cache) {
            let arr = [];
            let deliveryDate = 0;
            for (const i in cache) {
                let obj = cache[i];
                deliveryDate += Number(obj.period);
                arr.push({
                    name: obj.name,
                    desc: obj.desc,
                    amount: obj.amount,
                    period: obj.period,
                    deliveryDate: deliveryDate
                })
            }
            list = arr;
            setList([...list]);
            console.log('list ===>',list);
        }
    },[cache])

    useEffect(() => {
        if (data && list.length === 0) {
            list = data;
            setList([...list]); 
            console.log('list ===>',list);
        }
    },[data])

    // 发起签名
    useEffect(() => {
        if (prolongConfig.chainId && prolongReady) {
            prolongSign.signTypedDataAsync()
            .then(res => {
                let obj = data;
                obj[prolongObj.stageIndex].period += prolongObj.period / (24 * 60 * 60)
                update(obj, res, 'WaitProlongAgree')
                // 修改data ==> 上传后端更新
            })
            .catch(err => {
                setIsLoading(false)
            })
        }
    },[prolongObj])


    return <>
    <Spin spinning={showSpin} className="spin">
    {
        isDelivery && <DeliveryModal close={setIsDelivery} updateDelivery={updateDelivery} loading={isLoading} stageIndex={stageIndex} />
    }
    {
        isProlong && <ProlongModal close={setIsProlong} prolong={updateProlong} loading={isLoading} currency={order.currency} who={address} issuer={order.issuer} />
    }
    <div className="items">
        {
            list.map((e,i) => 
            e.period !== 0 &&
                <div className="stageItem" key={i}>
                    <StageOutput 
                        data={e} 
                        chainStages={data}
                        index={i} 
                        edit={edit} 
                        remove={remove} 
                        isEdit={isEdit} 
                        ongoing={data ? true : false} 
                        stageIndex={stageIndex} 
                        who={who}
                        status={order?.status}
                        sign_address={order?.sign_address}
                        address={address}

                        setActiveIndex={setActiveIndex}
                        updateDelivery={setIsDelivery}
                        confirmDelivery={confirmDelivery}

                        updateProlong={setIsProlong}
                        confirmProlong={confirmProlong}
                        rejectProlong={rejectProlong}

                        rejectAppend={rejectAppend}
                        confirmAppend={confirmAppend}

                        withdraw={withdraw}

                        abort={abort}

                        Order={order}
                        loading={isLoading}

                        token={token}
                        chainStartDate={chainStartDate}
                    />
                </div>
            )
        }
    </div>
    </Spin>
    </>
}