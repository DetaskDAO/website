import { Button, Divider, Modal } from "antd";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { ConvertToken, ConvertTokenAddress, Currency } from "../../utils/Currency";
import { download } from "../../utils/download";
import { getDate } from "../../utils/GetDate";


export default function StageOutput(params) {
    
    const { data, chainStages, chainStartDate, index, edit, remove, isEdit, ongoing, stageIndex, who, updateDelivery, confirmDelivery, updateProlong, confirmProlong, rejectProlong, confirmAppend, rejectAppend, setActiveIndex, status, sign_address, address, Order, loading, withdraw, abort, token } = params;
    const { t } = useTranslation("task");
    let [isOpen, setIsOpen] = useState(false);
    let [detail, setDetail] = useState();
    let [last, setLast] = useState(false);

    let [delevery, setDelevery] = useState();
    // 延长
    const checkProlong = () => {
        setActiveIndex(index);
        updateProlong(true);
    }

    // 交付
    const checkDelivery = () => {
        setActiveIndex(index);
        updateDelivery(true);
    }

    const getAbortAmount = () => {
        let amount = 0;
        if (Order.pay_type === 1 || address === Order.worker) {
            // 验收模式
            chainStages.map((e,i) => {
                if (i >= stageIndex) {
                    amount += e.amount;
                }
            })
        }else{
            // 按期模式
            let ongoingAmount = Currency(Order.currency, chainStages[stageIndex].amount).toString();
            let amountString;
            const timestamp = parseInt(new Date().getTime()/1000);
            const period = chainStages[stageIndex].period * 24 * 60 * 60;
            amountString = ongoingAmount * (chainStartDate + period - timestamp) / period
            amount += ConvertToken(Order.currency, amountString);

            for (let i = stageIndex + 1; i < chainStages.length; i++) {
                amount += chainStages[i].amount;
            }

            if (amount > Math.pow(10, -9)) {
                amount = amount.toFixed(9);
            }else{
                amount = "小于 G位"
            }
        }
        return amount
    }

    const printAmount = (e,i) => {
        if (e.deliveryDate !== 0 && e.status === 0) {
            return (
                <li key={i}>
                    <p>P{i}:</p>
                    <p>{e.amount}&nbsp;{ConvertTokenAddress(Order.currency)}</p>
                </li>
            )
        }
    }

    const isAbout = () => {
        
        Modal.confirm({
            title: t("order.modal-abort.title"),
            okText: t("order.modal-abort.btn-confirm"),
            cancelText: t("order.modal-abort.btn-cancel"),
            width: 528,
            closable: true,
            className: "confirmAbortModal",
            content: <div>
                {
                    Order.issuer === address ?
                    <p className="subtitle">{t("order.modal-abort.issuer.title")}</p>
                    :
                    <p className="subtitle">{t("order.modal-abort.worker.title")}</p>
                }
                <ul>
                    <p>{t("order.modal-abort.subtitle")}:</p>
                    {/* <h4>stageIndex:{stageIndex}</h4> */}
                    {
                        chainStages.map((e,i) => 
                            {
                                if (i >= stageIndex) {
                                    return printAmount(e,chainStages[0].deliveryDate === 0 ? i : i+1)
                                }
                            }
                        )
                    }
                </ul>
                <div className="l">
                    { 
                        Order.issuer === address ? 
                        <p>{t("order.modal-abort.issuer.l")}<span>&nbsp;{getAbortAmount()}&nbsp;{ConvertTokenAddress(Order.currency)}</span></p>
                        : 
                        <>
                            <p>{t("order.modal-abort.worker.l1")}<span>&nbsp;{getAbortAmount()}&nbsp;{ConvertTokenAddress(Order.currency)}</span></p>
                            <p>{t("order.modal-abort.worker.l2")}</p>
                        </>
                    }
                </div>
                <Divider />
            </div>,
            icon: <img src="/img/modal-redlight.png" alt="" />,
            onOk() {
                abort();
            },
            onCancel() {
              console.log('Cancel');
            },
          });
    }

    const switchStatus = () => {
        if (stageIndex === index && data.status === 0) {
            // 正在进行的阶段
            return <div className="status ongoing">{t("order.status2")}</div>
        }else if(stageIndex > index || data.status === 1 || data.status === 3) {
            // 已经完成的阶段 
            return <div className="status completed">{t("order.status3")}</div>
        }else if(data.status === 2){
            // 已经完成的阶段 
            return <div className="status abort">{t("order.status4")}</div>
        }else{
            // 待开始
            return <div className="status wait">{t("order.status1")}</div>
        }
    }

    const handle = (who) => {
        const day = Order.last_stages.period[stageIndex] - Order.stages.period[stageIndex];
        const date = getDate(
            new Date().getTime() + (Order.last_stages.period[stageIndex] * 24 * 60 * 60 * 1000), 'd'
        )
        const datee = getDate(
                new Date().getTime() + (Order.stages.period[stageIndex] * 24 * 60 * 60 * 1000), 'd'
            )
        return <>
            <div className="content">
                <div className="handle">
                    {t("ongoing.tips.delay-b.p1",{
                        who: who, 
                        day: day,
                        date: date
                    })}
                </div>
            </div>
            <div className="btns">
                <Button disabled={loading} className="abort" onClick={() => rejectProlong()}>
                    {t("ongoing.modal.delay.btn-refuse")}
                </Button>
                <Button loading={loading} className="permit" onClick={() => confirmProlong()}>
                    {t("ongoing.modal.delay.btn-agree")}
                </Button>
            </div>
        </>
    }

    // issuer判断
    const isEventIssuer = () => {
        if (status === "WaitProlongAgree") {
            return <div className="event">
                {/* 是否是本人发的申请 */}
                {
                    sign_address === address ? 
                    <>
                    {content}
                    <div className="btns">
                        <Button className="permit" onClick={() => rejectProlong()}>
                            {t("ongoing.modal.delay.btn-cancel")}
                        </Button>
                    </div>
                    </>
                    :
                    handle(sign_address === Order.issuer ? t("issuer"):t("worker"))
                }
            </div>
        }else{
            return <div className="btns">
                {
                    Order.pay_type == 2 &&
                    <Button className="delay" onClick={() => checkProlong()}>{t("ongoing.request.delay")}</Button>
                }
                <Button className="abort" onClick={() => isAbout()}>{t("ongoing.request.abort")}</Button>
                <Button className="permit" loading={loading} onClick={() => confirmDelivery()}>{t("ongoing.request.accept")}</Button>
            </div>
        }
    }

    const content = (
        stageIndex && 
        Order.last_stages.period &&
        <div className="handle">
            <p>
                {t("ongoing.tips.delay.p1")}{Order.last_stages.period[stageIndex] - Order.stages.period[stageIndex]}{t("ongoing.tips.delay.p2")}
                <span className="old">
                {
                    getDate(
                        new Date().getTime() + (Order.stages.period[stageIndex] * 24 * 60 * 60 * 1000), 'd'
                    )
                }
                </span>
                &nbsp;~&nbsp;
                <span className="new">
                {
                    getDate(
                        new Date().getTime() + (Order.last_stages.period[stageIndex] * 24 * 60 * 60 * 1000), 'd'
                    )
                }
                </span>
                {t("ongoing.tips.delay.p3",{who: sign_address === Order.issuer ? t("worker"): t("issuer")})}
            </p>
        </div>
    )

    const isEventWorker = () => {
        if (status === "WaitProlongAgree") {
            return <div className="event">
                {/* 是否是本人发的申请 */}
                {
                    sign_address === address ? 
                    <>
                    {content}
                    <div className="btns">
                        <Button className="permit" onClick={() => rejectProlong()}>
                            {t("ongoing.modal.delay.btn-cancel")}
                        </Button>
                    </div>
                    </>
                    :
                    handle(sign_address === Order.issuer ? t("issuer"):t("worker"))
                }
            </div>
        }else{
            return <div className="btns">
                {
                    Order.pay_type == 2 &&
                    <Button className="delay" onClick={() => checkProlong()}>{t("ongoing.request.delay")}</Button>
                }
                <Button className="abort" onClick={() => isAbout()}>{t("ongoing.request.abort")}</Button>
                <Button className="permit" onClick={() => checkDelivery()}>
                    {
                        Order.stage_json.stages[index].delivery.attachment ? t("order.btn-redelivery") : t("order.btn-delivery")
                    }
                </Button>
            </div>
        }
    }

    const switchBtns = () => {
            if (who === "issuer") {
                // 甲方
                return isEventIssuer()
            }else{
                // 乙方
                return isEventWorker()
            }
    }

    const switchAppendBtns = () => {
        if (address === Order.sign_address) {
            return <div className="event">
                    <div className="content">
                        {/* <div className="icon"></div> */}
                        {/* <p className="wait">You submitted the Application for Extension and waited for Party Bs consent.</p> */}
                    </div>
            </div>
        }else{
            // 同意阶段新增
            return <div className="event">
                    <div className="content">
                        {/* <p className="wait">You submitted the Application for Extension and waited for Party Bs consent.</p> */}
                    </div>
                    <div className="btns">
                        <Button disabled={loading} className="abort" onClick={() => rejectAppend()}>{t("order.cancel")}</Button>
                        <Button loading={loading} className="permit" onClick={() => confirmAppend()}>{t("order.confirm")}</Button>
                    </div>
            </div>
        }
    }

    const printIndex = () => {
        if ( Order && Order.stages.period[0] === 0) {
            return index
        }else{
            return index+1
        }
    }

    useEffect(() => {
        if (ongoing && (index === stageIndex)) {
            // 正在进行中
            setIsOpen(true)
        }
    },[ongoing])

    useEffect(() => {
        if (data && !detail) {
            detail = data;
            setDetail({...detail});
        }
    },[data])

    useEffect(() => {
        // 新增阶段
        if (index === Order?.last_stage_json?.stages?.length) {
            setIsOpen(true);
            setLast(true);
        }
        // 初始化交付数据 || 已完成
        if (Order?.stage_json.stages[index].delivery.content || Order?.stage_json.stages[index].delivery.attachment) {
            // 乙方交付过当前阶段
            delevery = Order.stage_json.stages[index].delivery;
            setDelevery({...delevery})
        }
    },[])

    return <div className="itemCard">
        <div className="itemCard-nav">
            {
                !last ? 
                <p className="nav-index">P{printIndex()}</p>
                :
                <p className="new-nav-index">P{printIndex()}</p>
            }
            
            <p className="nav-title">{detail?.name}</p>
            {
                // 项目正在进行中 ==>
                ongoing && !last && switchStatus()
            }
            {
                (!isEdit || isEdit === "block") &&
                    <div className="operate">
                        <div className="edit" onClick={() => edit(`item-${index+1}`)}>
                            <img src="/icon/modify.png" alt="" />
                        </div>
                        <div className="remove" onClick={() => remove(`item-${index+1}`)}>
                            <img src="/icon/delete.png" alt="" />
                        </div>
                    </div>
            }
        </div>
        <div className={`itemCard-content ${isOpen ? 'open' : ''}`}>
            <p className="container">
                <span>{t("order.delivery-length")}:</span>
                {detail?.period}&nbsp;{t("task.day")}
            </p>
            <p className="container">
                <span>{t("order.delivery-date")}:</span>
                {
                    getDate(
                        new Date().getTime() + (detail?.deliveryDate * 24 * 60 * 60 * 1000), 'd'
                    )
                }
            </p>
            <p className="container">
                <span>{t("order.cost")}:</span>

                {detail?.amount}&nbsp;{ConvertTokenAddress(token ? token : Order?.currency)}
            </p>
            <div className="container">
                <span>{t("order.delivery-note")}:</span>
                <p>{detail?.desc}</p>
            </div>
            <div className={`arrow ${isOpen ? "open" : "hide"}`} onClick={() => setIsOpen(!isOpen)}>
                <img src="/icon/arrow.png" alt="" />
            </div>
            {
                // 是否交付过
                delevery && 
                <div className="delivery">
                    <p className="delivery-title">
                        {t("order.delivery-title")}
                    </p>
                    <div className="delivery-content">
                        {/* 是否上传了文件 */}
                        {
                            delevery.attachment && 
                            <div className="item">
                                <span>{t("order.file")}:&nbsp;</span>
                                <p className="File" onClick={() => download(`${process.env.NEXT_PUBLIC_DEVELOPMENT_FILE}/${delevery.attachment}`,delevery.fileType)}>
                                    {delevery.fileType}
                                </p>
                            </div>
                        }
                        <div className="item">
                            <span>{t("order.desc")}:&nbsp;</span>
                            <div className="content">
                                {delevery.content}
                            </div>
                        </div>
                    </div>
                </div>
            }
            {   
                //  项目可选按钮
                ongoing && index === stageIndex && data.status === 0 && switchBtns()
            }
            {
                // 同意、拒绝 新增
                last &&
                switchAppendBtns()
            }
        </div>
    </div>
}