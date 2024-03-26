import { useSetState } from "ahooks";
import { Button, Checkbox, Divider, InputNumber, message, Modal, Radio, Spin, Tabs } from "antd";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useAccount, useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { ConfigOrder, multicallWrite, muticallEncode, useContracts, useRead, useSignAppendData, useSignPermit2Data } from "../../src/controller";
import { startOrder, updatedStage } from "@/request/_api/order";
import OutputStageCard from "../CustomCard/OutputStageCard";
import AppendStage from "./AppendStage";
import { BigNumber } from '@ethersproject/bignumber'
import { Sysmbol } from "@/utils/Sysmbol";
import { ConvertToken, ConvertTokenAddress, Currency } from "@/utils/Currency";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { getDate } from "@/utils/GetDate";


export default function OrderStageList(params) {
    
    const { order, dataStages, task, permit2Nonce } = params;
    const { t } = useTranslation("task");
    const { address } = useAccount();
    const router = useRouter();
    const { chain } = useNetwork();
    let [data, setData] = useState([]);
    let [stageIndex, setStageIndex] = useState(0);
    let [pending, setPending] = useState(0);
    
    let [isLoading, setIsLoading] = useState(false);
    let [deadline, setDeadline] = useState();
    let [isAppend, setIsAppend] = useState(false);
    let [appendObj, setAppendObj] = useState({name: '', period: '', amount: '', desc: ''});  //  新增
    let [appendParams, setAppendParams] = useState({});
    let [appendReady, setAppendReady] = useState(false);
    const { useSign: appendSign, obj: appendConfig } = useSignAppendData(appendParams);  //  延长签名

    const { useStageRead: chainStages } = useRead('getStages',order.order_id);
    const { useStageRead: chainOngoing, test } = useRead('ongoingStage',Number(order.order_id));
    const { useStageRead: pendingWithdraw } = useRead('pendingWithdraw',Number(order.order_id));
    const { useDeOrderVerifierRead: nonces } = useRead('nonces', [address, Number(order.order_id)]);
    // 领钱
    // const { useOrderContractWrite: getWithdraw } = useContracts('withdraw');
    const { write: getWithdraw, data: withdrawHash, isLoading: withdrawloading } = useContractWrite({
        ...ConfigOrder("withdraw"),
        onSuccess(data) {
            withdrawSuccess(data.hash)
        },
        onError(err) {
            console.log(err);
        }
    })
    const { isLoading: withdrawingloading } = useWaitForTransaction({
        hash: withdrawHash?.hash,
        onSuccess(data) {
            // pending = 0;
            // setPending(pending);
            setTimeout(() => {
                history.go(0);
            }, 500);
        },
        onError(err) {
            writeError()
        }
    })

    // permit2
    let [signature,setSignature] = useState();
    let [permit2Ready, setPermit2Ready] = useState(false);
    let [permit2, setPermit2] = useState({});  //  permit2
    let [permitDeadline, setPermitDeadline] = useState();
    const { useSign: permit2Sign, obj: permit2Obj } = useSignPermit2Data(permit2);  //  permit2
    let [muticallHash, setMuticallHash] = useState();
    let [showSpin, setShowSpin] = useState(false);
    const waitForCreate = useWaitForTransaction({
        hash: muticallHash,
        onSuccess(data) {
            setTimeout(() => {
                history.go(0)
            }, 1000);
        },
        onError(err) {
            setShowSpin(false)
            console.log('=====>',err);
        }
    })

    // 领钱
    const withdraw = () => {
        getWithdraw({
            recklesslySetUnpreparedArgs: [Number(order.order_id), address]
        })
    }

    const getPending = () => {
        pending = ConvertToken(order.currency, pendingWithdraw.data.pending.toString());
        setPending(pending);
    }

    const withdrawSuccess = (hash) => {
        updatedStage({
            hash: hash
        })
        .then(res => {
            console.log(res.msg);
        })
    }

    const available = () => {
      Modal.confirm({
        title: t("order.modal-withdraw.title"),
        okText: t("order.modal-withdraw.btn"),
        width: 528,
        closable: true,
        content: <div>
            <p className="price">
                {ConvertToken(order.currency, pendingWithdraw.data.pending.toString())}
                &nbsp;
                {ConvertTokenAddress(order.currency)}
            </p>
            <Divider />
        </div>,
        icon: <img src="/img/order-pay.png" alt="" />,
        className: "confirmModal",
        cancelButtonProps: {
            style: {display: "none"}
        },
        onOk() {
            withdraw();
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    }

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
            }, 500);
            setIsLoading(false)
        }
    }

    // 判断nonce是否为最新 || signature 是否过期
    const inspection = () => {
        const now = parseInt(new Date().getTime()/1000);
        if (order.stages.deadline < now) {
            updatedStage({order_id: order.order_id, status: 'InvalidSign'})
            .then(res => {
                if (res.code === 0) {
                    message.warning(res.msg)

                    setTimeout(() => {
                        history.go(0)
                    }, 500);
                }
            })
            return false
        }else{
            return true
        }
    }

    // 发起新增
    const updateAppend = () => {
        if (order.status === 'WaitProlongAgree') {
            // message.warning('请先确认「延期申请」')
            return
        }
        if (order.progress != 2 ) {
            history.go(0)
            return
        }
        setIsLoading(true);

        let now = parseInt(new Date().getTime()/1000);
        let setTime = 24 * 60 * 60;
        deadline = now+setTime;
        setDeadline(deadline);
        appendParams = {
            chainId: chain.id,  //  id
            orderId: order.order_id,
            amount: Currency(order.currency, appendObj.amount),
            period: appendObj.period * 24 * 60 * 60,
            nonce: Number(nonces.data.toString()),    //  id nonce form sql? or chain
            deadline: `${deadline}`,
        }
        setAppendParams({...appendParams});

        setAppendReady(true);
    }
    // 乙方同意新增
    const agreeAppend = () => {
        let cache = dataStages[dataStages.length-1];
        setIsLoading(true);

        let now = parseInt(new Date().getTime()/1000);
        let setTime = 24 * 60 * 60;
        deadline = now+setTime;
        setDeadline(deadline);
        appendParams = {
            chainId: chain.id,  //  id
            orderId: order.order_id,
            amount: Currency(order.currency, cache.amount),
            period: cache.period * 24 * 60 * 60,
            nonce: Number(nonces.data.toString()),    //  id nonce form sql? or chain
            deadline: `${deadline}`,
        }
        setAppendParams({...appendParams});

        setAppendReady(true);
    }

    // 甲方同意新增
    const payAppend = () => {
        if (!inspection()) {
            return
        }
        if (order.currency !== ethers.constants.AddressZero && !signature) {
            // 发起permit2签名
            permit2Get()
            return
        }
        let data = dataStages[dataStages.length-1];
        let amount = Currency(order.currency, data.amount);
        let arr = [];
        if (order.currency !== ethers.constants.AddressZero) {
            arr.push({
                functionName: 'payOrderWithPermit2',
                params: [
                    order.order_id, 
                    amount, 
                    {
                        permitted: {
                            token: order.currency,        //  dUSDT
                            amount: amount
                        },
                        nonce: permit2Nonce.toString(),
                        deadline: `${permitDeadline}`
                    },
                    signature
                ]
            })
        }else{
            arr.push({
                functionName: 'payOrder',
                params: [order.order_id, amount]
            })
        }
        arr.push({
            functionName: 'appendStage',
            params: [
                order.order_id, 
                amount,
                (data.period * 24 * 60 * 60), 
                order.sign_nonce, 
                order.stages.deadline,
                '0x' + order.signature.substring(2).substring(128, 130),
                '0x' + order.signature.substring(2).substring(0, 64),
                '0x' + order.signature.substring(2).substring(64, 128)
            ]
        })
        console.log(arr);
        if (order.currency !== ethers.constants.AddressZero) {
            amount = 0
        }
        multicallWrite(muticallEncode(arr),address,amount)
        .then(res => {
            if (res) {
                muticallHash = res;
                setMuticallHash(muticallHash);
                //  更新数据库状态
                updatedStage({
                    order_id: order.order_id,
                    hash: res,
                    status: 'AgreeAppend'
                })
                .then(res => {
                    if (res.code === 0) {
                        setShowSpin(true)
                    }else{
                        setIsLoading(false);
                    }
                })
            }
        })
    }

    const permit2Get = () => {
        let data = dataStages[dataStages.length-1];
        let amount = Currency(order.currency, data.amount);
        let now = parseInt(new Date().getTime()/1000);
        let setTime = 24 * 60 * 60;
        permitDeadline = now+setTime;
        setPermitDeadline(permitDeadline);
        permit2 = {
            chainId: chain.id,
            token: order.currency,        //  dUSDT
            amount: amount,
            spender: Sysmbol().DeOrder,
            nonce: permit2Nonce.toString(),
            deadline: `${permitDeadline}`
        }
        setPermit2({...permit2});
        setPermit2Ready(true);
    }

    // 更新阶段
    const update = (signature,status) => {
        // stages添加阶段
        let json = order.stage_json;
        let arr = {
            amount: [],period: [],deadline: ''
        };
        if (appendObj.name) {
            json.stages.push({
                milestone: {
                    type: 'raw',
                    content: appendObj.desc,
                    title: appendObj.name
                },
                delivery: {
                    attachment: '',
                    fileType: '',
                    content: ''
                }
            })
        }
        arr.deadline = deadline;
        dataStages.map((e,i) => {
            arr.amount.push(e.amount);
            arr.period.push(e.period);
        })
        if (appendObj.name) {
            arr.amount.push(appendObj.amount);
            arr.period.push(appendObj.period);
        }

        updatedStage({
            signature: signature,
            sign_address: address,
            sign_nonce: Number(nonces.data.toString()),
            obj: JSON.stringify(json),
            order_id: order.order_id,
            stages: JSON.stringify(arr),
            status: status
        })
        .then(res => {
            handelRes(res)
        })
    }

    // 发起permit2签名
    useEffect(() => {
        if (permit2.chainId && permit2Ready) {
            permit2Sign.signTypedDataAsync()
            .then(res => {
                signature = res;
                setSignature(signature);
                if (res) {
                    payAppend();
                }
            })
            .catch(err => {
                // setIsLoading(false)
            })
        }
    },[permit2])

    useEffect(() => {
        if (chainStages.data) {
            console.log('chainStages ==>',chainStages.data, new Date().getTime());

            let deliveryDate = 0;
            dataStages.map((e,i) => {
                deliveryDate += Number(e.period);
                e.deliveryDate = deliveryDate;
            })
            data = dataStages;
            chainStages.data.map((e,i) => {
                data[i].amount = ConvertToken(order.currency,e.amount.toString());
                data[i].period = e.period.toString() / (24 * 60 * 60);
                data[i].status = e.status;
            })
            setData([...data]);
        }
    },[chainStages.data])

    useEffect(() => {
        if (chainOngoing.data) {
            let going = chainOngoing.data;
            stageIndex = Number(going.stageIndex.toString());
            setStageIndex(stageIndex);
            console.log('成功获取ongoing ==>', going.stageIndex.toString());
        }
    },[chainOngoing])

    useEffect(() => {
        if (chainOngoing.error && pendingWithdraw.data) {
            console.log("chainOngoing.error ==>", chainOngoing.error);
            stageIndex = pendingWithdraw.data.nextStage.toString()
            setStageIndex(stageIndex)
            console.log('成功获取pendingWithdraw ==>', pendingWithdraw.data.nextStage.toString());   
        }
    },[chainOngoing, pendingWithdraw])

    useEffect(() => {
        if (pendingWithdraw.data) {
            console.log('pendingWithdraw data ===>',pendingWithdraw.data.pending.toString());
            getPending()
        }
    },[pendingWithdraw])

    // 发起签名
    useEffect(() => {
        if (appendConfig.chainId && appendReady) {
            appendSign.signTypedDataAsync()
            .then(res => {
                update(res, 'WaitAppendAgree')
                // 修改data ==> 上传后端更新
            })
            .catch(err => {
                setIsLoading(false)
            })
        }
    },[appendParams])

    return (
        <Spin spinning={showSpin}>
            <div className="stageCard">
                <div className="payType">
                    <p className="subtitle">{t("order.model.title")}</p>
                    {/* <Radio.Group value={order.pay_type.toString()} disabled >
                        <Radio.Button value="1">{t("order.model.model1")}</Radio.Button>
                        <Radio.Button value="2">{t("order.model.model2")}</Radio.Button>
                    </Radio.Group> */}
                    <Divider />
                    <p className="mode">{order.pay_type == 1 ? t("order.model.model1") : t("order.model.model2")}</p>
                </div>
                <div className="card">
                    <p className="title">{t("order.title")}</p>
                    {
                        // 预付款
                    order.worker === address && order.stages.period[0] === 0 &&

                    <div className="payModel">
                            <Checkbox checked disabled>
                                Increase advance payment
                            </Checkbox>

                            <div className="flex">
                                <div className="prepay">
                                    {dataStages[0].amount}  
                                </div> 
                            </div>
                        </div>
                    }
                    {
                        order.worker === address &&
                        <Button loading={withdrawloading||withdrawingloading} disabled={pending == 0} className={`withdraw ${pending == 0 ? 'none':''}`} onClick={() => available()}>
                            {
                                pending == 0 ?
                                t("order.btn-withdrawal")
                                :
                                t("order.btn-withdraw")
                            }
                        </Button>
                    }

                    <div className="stageList">
                        <OutputStageCard 
                            isEdit="none" 
                            data={data} 
                            stageIndex={stageIndex} 
                            who={order.issuer === address ? 'issuer' : 'worker'} 
                            oid={order.order_id}
                            task={task}
                            order={order}
                            agreeAppend={agreeAppend}
                            payAppend={payAppend}
                            inspection={inspection}
                            chainStages={chainStages?.data}
                        />
                        {
                            isAppend ? 
                            <div className="tabs new-tabs">
                                <p className="tabs-title">P{dataStages[0].period === 0 ? dataStages.length : dataStages.length + 1}</p>
                                <AppendStage 
                                    setInner={setAppendObj} 
                                    inner={appendObj}
                                    cancel={setIsAppend}
                                    updateAppend={updateAppend}
                                    isLoading={isLoading}
                                    order={order}
                                />
                            </div>
                            :
                            order.progress === 2 && order.status !== 'WaitAppendAgree' && 
                            <Button className="btn-add mb60" onClick={() => setIsAppend(true)}>{t("order.btn-add")}</Button>
                        }

                    </div>
                </div>
            </div>
        </Spin>
    )
}