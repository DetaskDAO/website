import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import { Button, Checkbox, InputNumber, message, Modal, Radio, Spin } from "antd";
import BigNumber from "bignumber.js";
import { ethers, logger } from "ethers";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { useEffect, useState } from "react"
import { useAccount, useNetwork, useWaitForTransaction } from "wagmi";
import { multicallWrite, muticallEncode, useRead, useSignData, useSignPermit2Data } from "../../src/controller";
import { deleteOrder, getOrderMsg, updatedStage } from "@/request/_api/order";
import { ConvertTokenAddress, Currency } from "@/utils/Currency";
import { floatAdd } from "@/utils/Float";
import { getDate } from "@/utils/GetDate";
import { Sysmbol } from "@/utils/Sysmbol";
import InnerStageCard from "../CustomCard/InnerStageCard";

export default function OrderSetStage(params) {
    
    const { search, order, amount, task, dataStages, permit2Nonce } = params;
    const { confirm } = Modal;
    const { t } = useTranslation("task");
    let [progressSet, setProgressSet] = useState();
    let [stage, setStage] = useSetState({
        orderModel: false,      //  预付款模式
        value: ''
    });

    let [stages, setStages] = useState({
        amount: [], period: [], deadline: ''
    })
    let [inner, setInner] = useState();     //  阶段划分
    const { chain } = useNetwork();
    const { address } = useAccount();

    // 链上数据
    const { useDeOrderVerifierRead: nonces } = useRead('nonces', [address, Number(order.order_id)]);

    // 状态
    let [status, setStatus] = useState('WaitWorkerStage');
    let [payType, setPayType] = useState(0);    //  0: 初始化  1: 按期  2: 验收

    // 签名部分
    let [signObj,setSignObj] = useState({});    //  签名信息
    const { useSign, obj } = useSignData(signObj);
    let [isSigner,setIsSigner] = useState(false);

    let [isChange,setIsChange] = useState(false);   //  是否修改了阶段划分

    // 设置阶段按钮
    let [btnDisabled,setBtnDisabled] = useState(true);
    let [isLoading,setIsLoading] = useState(false);

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
            console.log('muticall error =====>',err);
        }
    })

    const showConfirm = () => {
        confirm({
          title: 'Do you Want to delete these items?',
          icon: <ExclamationCircleOutlined />,
          onOk() {
            abort();
          }
        });
      };
      
    // 终止
    const abort = () => {
        deleteOrder({
            order_id: order.order_id
        }).then(res => {
            if (res.code === 0) {
                message.success(res.msg)
                setTimeout(() => {
                    history.go(-1)
                }, 500);
            }else{
                setTimeout(() => {
                    history.go(0)
                }, 500);
            }
        })
    }

    //  切换order模式 ==> 预付款
    const toggleModel = (e) => {
        setStage({orderModel: e.target.checked});
        setIsChange(true);
    }

    //  获取阶段划分
    const getInner = (obj) => {
        inner = obj;
        setInner({...inner});

        // 参数空指针判断
        let flag = true;
        for (const i in inner) {
            for (const j in inner[i]) {
                if (!inner[i][j]) {
                    flag = false
                }
            }
        }
        if (flag) {
            setBtnDisabled(false);
        }else{
            setBtnDisabled(true);
        }
    }

    //  设置阶段 ==> 处理签名信息
    const sendSignature = () => {
        let now = parseInt(new Date().getTime()/1000);
        let setTime = 24 * 60 * 60;
        stages.deadline = now+setTime;
        setStages({...stages});

        let _amount = [];
        let _period = [];
        let arr = [];
        // 是否有预付款
        if (stage.orderModel) {
            var amount = Currency(order.currency, stage.value)
            _amount.push(amount);
            _period.push(`${0 * 24 * 60 * 60}`)
        }
        for (const i in inner) {
            arr.push(inner[i]);
        }
        arr.map(e => {
            var amount = Currency(order.currency, e.amount)
            _amount.push(amount);
            _period.push(`${parseInt(e.period * 24 * 60 * 60)}`)
        })
        console.log('nonce ==>',nonces);
        signObj = {
            amounts: _amount,
            periods: _period,
            chainId: chain.id,
            address: address,
            oid: search.order_id,
            payType: payType,
            nonce: Number(nonces.data.toString()),
            deadline: stages.deadline
        }
        setSignObj({...signObj})
        setIsSigner(true)
        console.log(signObj);
    }

    // 签名成功 ==>
    const signSuccess = () => {
        setIsSigner(false);
        let stageDetail = {
            orderId: search.order_id,
            stages: [],
            task: {
                id: task.task_id,
                title: task.title,
                desc: task.desc,
                attachment: task.attachment,
            },
            // last: stagejson, //  jsonhash
            last: '', //  jsonhash
            version: '1.0'
        };
        let arr = [];
        let _amount = [];
        let _period = [];
        for (const i in inner) {
            arr.push(inner[i]);
        }
        if (stage.orderModel) {
            _amount.push(stage.value);
            _period.push(0);
            stageDetail.stages.push({
                milestone: {
                    type: 'raw',
                    content: '',
                    title: ''
                },
                delivery: {
                    attachment: '',
                    fileType: '',
                    content: ''
                }
            })
        }
        arr.map(e => {
            _amount.push(e.amount);
            _period.push(e.period);
            stageDetail.stages.push({
                milestone: {
                    type: 'raw',
                    content: e.desc,
                    title: e.name
                },
                delivery: {
                    attachment: '',
                    fileType: '',
                    content: ''
                }
            })
        })
        stages.amount = _amount;
        stages.period = _period;
        
        updatedStage({
            signature: useSign.data,
            sign_address: address,
            sign_nonce: Number(nonces.data.toString()),
            obj: JSON.stringify(stageDetail),
            order_id: order.order_id,
            stages: JSON.stringify(stages),
            status: status,
            pay_type: payType
        })
        .then(res => {
            if (res.code === 0) {
                message.success(res.msg)
                setTimeout(() => {
                    history.go(0);
                }, 500);
            }else{
                message.error(res.msg)
                setTimeout(() => {
                    history.go(0);
                }, 500);
            }
        })
    }

    // 同意阶段划分 
    const permitStage = async() => {
        // 乙方同意
        if (order.worker === address) {
            sendSignature()
            return
        }
        // 判断nonce是否为最新 || signature 是否过期
        const now = parseInt(new Date().getTime()/1000);
        console.log('签名是否过期 ====>',order.stages.deadline, now);
        if (order.stages.deadline < now) {
            updatedStage({order_id: order.order_id, status: 'InvalidSign'})
            .then(res => {
                if (res.code === 0) {
                    message.warning(res.msg)
                    setTimeout(() => {
                        history.go(0)
                    }, 1000);
                }
            })
            return
        }

        setIsLoading(true);
        let sum = 0;
        dataStages.map(e => {
            sum = floatAdd(sum, e.amount)
        })
        if (sum > Currency(order.currency,order.amount)) {
            confirm({
                title: '你确认支付这笔订单吗?',
                icon: <ExclamationCircleOutlined />,
                content: '当前总金额超出预期金额!',
                onOk() {
                  permit(sum);
                },
                onCancel() {},
              });
        }else{
            permit(sum)
        }
    }
    
    const permit = (sum) => {
        let r = '0x' + order.signature.substring(2).substring(0, 64);
        let s = '0x' + order.signature.substring(2).substring(64, 128);
        let v = '0x' + order.signature.substring(2).substring(128, 130);
        let value = Currency(order.currency, sum);
        
        let _amount = [];
        let _period = [];
        let funcList = [];

        dataStages.map((e,i) => {
            var amount = Currency(order.currency, e.amount)
            _amount.push(amount);
            _period.push(parseInt(e.period * 24 * 60 * 60));
        })
        funcList.push({
            functionName: 'permitStage',
            params: [order.order_id, _amount, _period, payType, order.sign_nonce, order.stages.deadline, v, r, s]
        })
        if (order.currency !== ethers.constants.AddressZero) {
            funcList.push({
                functionName: 'payOrderWithPermit2',
                params: [
                    order.order_id, 
                    value, 
                    {
                        permitted: {
                            token: order.currency,        //  dUSDT
                            amount: value
                        },
                        nonce: permit2Nonce.toString(),
                        deadline: `${permitDeadline}`
                    },
                    signature
                ]
            })           
        }else{
            funcList.push({
                functionName: 'payOrder',
                params: [order.order_id, value]
            })
        }
        if (Currency(order.currency,order.amount) !== sum) {
            funcList.push({
                functionName: 'modifyOrder',
                params: [order.order_id, order.currency, value]
            })
        }
        funcList.push({
            functionName: 'startOrder',
            params: [order.order_id]
        })
        if (order.currency !== ethers.constants.AddressZero) {
            value = 0
        }
        console.log(funcList);
        multicallWrite(muticallEncode(funcList),address,value)
        .then(res => {
            if (res) {
                muticallHash = res;
                setMuticallHash(muticallHash);
                // 发送后端请求 ==> 开始任务
                updatedStage({
                    order_id: order.order_id,
                    hash: res,
                    signature: order.signature
                })
                .then(res => {
                    if (res.code === 0) {
                        setShowSpin(true)
                    }else{
                        setIsLoading(false);
                    }
                })  
            }else{
                // 交易失败
                setIsLoading(false);
                // message.warning('交易已终止')
                console.log('res ==>',res);
            }
        })
        .catch(err => {
            console.log(err);
            setIsLoading(false);
        })
    }

    // 总计各阶段
    const printStageTotal = () => {
        let arr = [];
        for (const i in inner) {
            if (inner[i].amount) {
                arr.push(inner[i]);
            }
        }
        return arr.map((e,i) => 
            <p key={i}>P{i+1} {t("order.cost")}: <span>{e.amount}</span></p>
        )
        
    }

    // 总计金额
    const printTotal = () => {
        // let sum = new BigNumber(0);
        let sum = 0;
        if (stage.orderModel) {
            sum = floatAdd(sum, stage.value)
        }
        for (const i in inner) {
            sum = floatAdd(sum, inner[i].amount)
        }
        return <p className="totalText">{t("order.total")}: <span>{sum}&nbsp;{ConvertTokenAddress(order.currency)}</span></p>
    }

    // 总计周期
    const printTotalPeriod = () => {
        let sum = 0;
        for (const i in inner) {
            sum+= Number(inner[i].period);
        }
        let now = new Date().getTime();
        let end = new Date().getTime() + (sum * 24 * 60 * 60 * 1000);
        let nowTime = getDate(now,'d');
        let endTime = getDate(end,'d');
        return <div className="poa">
            <p>{t("order.delivery-length")}: {sum}&nbsp;{t("task.day")}</p>
            <p>{t("order.delivery-date")}: {nowTime}~{endTime}</p>
        </div>
    }

    // 修改状态
    const modifyStatus = () => {
        if (address === order.worker) {
            // 乙方修改阶段划分
            setStatus('WaitIssuerAgree')
        }else{
            // 甲方修改阶段划分
            setStatus('WaitWorkerConfirmStage')
        }
        sendSignature()
    }

    const initStatus = () => {
        if (payType == 0) {
            // message.warning('请选择收款方式!');
            return
        }
        console.log('xxx');
        // 等待甲方确认阶段划分
        setStatus('WaitIssuerAgree')
        sendSignature()
    }

    const permitStatus = () => {
        if (order.sign_address === order.worker) {
            getOrderMsg({order_id: order.order_id})
            .then(res => {
                // 对方修改了
                if (res.code === 0 && res.data.list?.length > 0) {
                    history.go(0)
                }
            })
            // 甲方同意阶段划分
            setStatus('IssuerAgreeStage')
        }else{
            // 乙方同意阶段划分
            setStatus('WorkerAgreeStage')
        }
        if (address != order.worker && order.currency != ethers.constants.AddressZero) {
            let sum = 0;
            dataStages.map(e => {
                sum = floatAdd(sum, e.amount)
            })
            let now = parseInt(new Date().getTime()/1000);
            let setTime = 24 * 60 * 60;
            permitDeadline = now+setTime;
            setPermitDeadline(permitDeadline);
            permit2 = {
                chainId: chain.id,
                token: order.currency,        //  dUSDT
                amount: Currency(order.currency, sum),
                spender: Sysmbol().DeOrder,
                // nonce: ethers.utils.parseEther(`${permit2Nonce}`),
                nonce: permit2Nonce.toString(),
                deadline: `${permitDeadline}`
            }
            setPermit2({...permit2});
            setPermit2Ready(true);
        }else{
            permitStage()
        }
    }

    const changeAdvance = (e) => {
        stage.value = e;
        setStage({...stage});
        setIsChange(true);
    }

    const changePayType = (e) => {
        payType = Number(e);
        setPayType(payType);
        setIsChange(true);
    }

    const handelIsChange = () => {
        isChange = true;
        setIsChange(isChange);
    }

    const totalPanel = <>
        {printStageTotal()}
        {printTotal()}
        {printTotalPeriod()}
    </>

    const editing = <>
        <div className="payType">
            <p className="subtitle">{t("order.model.title")}</p>
            <Radio.Group defaultValue={payType} onChange={(e) => changePayType(e.target.value)}>
                <Radio.Button value="1">{t("order.model.model1")}</Radio.Button>
                <Radio.Button value="2">{t("order.model.model2")}</Radio.Button>
            </Radio.Group>
        </div>
        <div className="card">
            <p className="title">{t("order.title")}</p>
            <div className="payModel">
                <Checkbox 
                    defaultChecked={ dataStages && dataStages[0].period === 0 ? true : false}
                    onChange={toggleModel}
                >
                    {t("order.payment")}
                </Checkbox>
                { 
                    dataStages && (dataStages[0].period === 0 || stage.orderModel) &&
                    <div className="prepay">
                        
                        <InputNumber
                            stringMode
                            precision={4}
                            min={0.0001}
                            defaultValue={ dataStages[0].period === 0 ? dataStages[0].amount : null}
                            onChange={ e => changeAdvance(e)}
                        />
                        {ConvertTokenAddress(order.currency)}
                    </div> 
                }
            </div>
            <InnerStageCard defaultAmount={amount} currency={order.currency} token={order.currency} getInner={getInner} dataStages={dataStages} edit="block" setIsChange={setIsChange} order={order} />
            <div className="total">
                {
                    ((dataStages && dataStages[0].period === 0) && stage.orderModel) && 
                    <p>{t("order.payment")}{t("mao")} <span>{stage.value}</span></p>
                }
                {totalPanel}
            </div>
        </div>
    </>

    const unEdit = <>
        <div className="payType">
            <p className="subtitle">{t("order.model.title")}</p>
            <Radio.Group defaultValue={payType} disabled onChange={(e) => changePayType(e.target.value)}>
                <Radio.Button value="1">{t("order.model.model1")}</Radio.Button>
                <Radio.Button value="2">{t("order.model.model2")}</Radio.Button>
            </Radio.Group>
        </div>
        <div className="card">
            <p className="title">{t("order.title")}</p>
            <div className="payModel">
                <Checkbox checked={dataStages && dataStages[0].period === 0 ? true : false} disabled>
                    {t("order.payment")}
                </Checkbox>
                { 
                    dataStages &&
                    dataStages[0].period === 0 && 
                    <div className="prepay">
                        {dataStages[0].amount}
                        {ConvertTokenAddress(order.currency)}
                    </div> 
                }
            </div>
            <InnerStageCard defaultAmount={amount} currency={order.currency} getInner={getInner} dataStages={dataStages} edit="none"/>
            <div className="total">
                {
                    // 总计
                    dataStages &&
                    dataStages[0].period === 0 && 
                    <p>{t("order.payment")}{t("mao")} <span>{stage.value}</span></p>
                }
                {totalPanel}
            </div> 
        </div>
        
    </>

    const switchSetStageCard = () => {

        switch (progressSet) {
            case 0:
                return <>
                    <div className="card" style={{marginTop: "0px"}}>
                    <p className="title">{t("order.title")}</p>
                    <div className="img_p0 mb60">
                        <Image src='/img/img-order-p0.png' layout="fill" />
                    </div>
                    </div>
                </>
            case 1:
                return <>
                <div className="payType">
                    <p className="subtitle">{t("order.model.title")}</p>
                    <Radio.Group defaultValue=""onChange={(e) => changePayType(e.target.value)}>
                        <Radio.Button value="1">{t("order.model.model1")}</Radio.Button>
                        <Radio.Button value="2">{t("order.model.model2")}</Radio.Button>
                    </Radio.Group>
                </div>
                <div className="card">
                    <p className="title">{t("order.title")}</p>
                    <div className="payModel">
                        <Checkbox checked={stage.orderModel} onChange={toggleModel}>
                            {t("order.payment")}
                        </Checkbox>
                        { 
                            stage.orderModel && 
                            <div className="prepay">
                                <InputNumber
                                    stringMode
                                    precision={4}
                                    min={0.0001}
                                    value={stage.value} 
                                    onChange={ e => changeAdvance(e)}
                                />
                                {ConvertTokenAddress(order.currency)}
                            </div> 
                        }
                    </div>
                    <InnerStageCard defaultAmount={amount} currency={order.currency} getInner={getInner} token={order.currency} />
                    
                    {
                        JSON.stringify(inner) !== '{}' && <>
                            {/* 总计 */}
                            <div className="total">
                                {
                                    stage.orderModel && 
                                    <p>{t("order.payment")}: <span>{stage.value}</span></p>
                                }
                                {totalPanel}
                            </div>
                            <Button className={`submit ${btnDisabled ? 'hidden' : 'show'}`} onClick={() => initStatus()} disabled={btnDisabled}>
                                {t("order.btn-submit")}
                            </Button>
                        </>
                    }
                </div>
            </>
            case 2:
                // 判断是自己设置的还是对方设置的
                if (order.issuer === address || order.worker === address) {     
                    if (order.sign_address === address) {       //  修改了这部分
                        // 是你的
                        return <>
                            {
                                isChange ? 
                                editing
                                :
                                unEdit
                            }
                            {
                                !isChange ? 
                                <Button 
                                    className="submit show"
                                    onClick={() =>  handelIsChange()} 
                                 >{t("order.btn-resubmit")}</Button>
                                :
                                <Button 
                                    className={`submit ${btnDisabled ? 'hidden' : 'show'}`} 
                                    onClick={() => modifyStatus()} 
                                    disabled={btnDisabled}
                                 >{t("order.btn-change")}</Button> 
                            }
                        </>
                    }else{
                        // 不是 你的
                        return <>{editing}
                        {
                            !isChange ? 
                            <Button 
                                className="submit show"
                                onClick={() => permitStatus()} 
                                loading={isLoading}
                             >{t("order.btn-agree")}</Button>
                            :
                            <Button 
                                className={`submit ${btnDisabled ? 'hidden' : 'show'}`} 
                                onClick={() => modifyStatus()} 
                                disabled={btnDisabled}
                             >{t("order.btn-change")}</Button> 
                        }
                        </>
                    }
                }else{
                    return <h1>404</h1>
                }
            default:
                break;
        }
    }

    useEffect(() => {
        // 判断是否设置过
        if (!order.signature) {
            progressSet = search.who === 'issuer' ? 0 : 1;  //  设置阶段初始化: 0:甲方的初始化 1:乙方的初始化
        }else {
            if (search.who === 'issuer' && order.status === "WaitWorkerStage") {
                progressSet = 0
            }else{
                progressSet = 2;    //  2:已经有一方设置了阶段 => 双方显示一样的
            }
        }
        setProgressSet(progressSet);

        if (dataStages && dataStages[0].period === 0) {
            stage.orderModel = true;
            stage.value = dataStages[0].amount;
            setStage({...stage});
        }
        if (order.pay_type) {
            payType = (order.pay_type).toString();
            setPayType(payType);
        }
    },[])

    // 发起permit2签名
    useEffect(() => {
        if (permit2.chainId && permit2Ready) {
            permit2Sign.signTypedDataAsync()
            .then(res => {
                signature = res;
                setSignature(signature);
                if (res) {
                    permitStage();
                }
            })
            .catch(err => {
                // setIsLoading(false)
            })
        }
    },[permit2])

    // 发起签名
    useEffect(() => {
        if (obj.chainId && isSigner) {
            useSign.signTypedData();
        }
    },[signObj])

    // 签名成功返回
    useEffect(() => {
        useSign.data && signObj && signSuccess()
    },[useSign.data])
    return  (
        <>
        <Spin spinning={showSpin}>
            {/* {mode} */}
            <div className="stageCard">
                { switchSetStageCard() }
                <div className="cancelOrder" onClick={() => showConfirm()}>{t("order.btn-cancel")}</div>
            </div>
        </Spin>
        </>
    )
}