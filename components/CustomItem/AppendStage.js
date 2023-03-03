import { Button, Input, InputNumber, message } from "antd";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { ConvertToken, ConvertTokenAddress, CurrencyMin } from "../../utils/Currency";
const { TextArea } = Input;


export default function AppendStage(params) {
    
    const { setInner, inner, cancel, updateAppend, isLoading, order } = params;

    const { t } = useTranslation("task");
    const [percent, setPercent] = useState([
        {title: '10%', value: 0.1, active: false},
        {title: '25%', value: 0.25, active: false},
        {title: '50%', value: 0.5, active: false},
        {title: '75%', value: 0.75, active: false},
        {title: '100%', value: 1, active: false}
    ])
    let [amount,setAmount] = useState();

    const changePercent = (i) => {
        percent.map(e => {
            e.active = false;
        })
        percent[i].active = true;
        setPercent([...percent]);

        // 百分比
        if (order.amount !== 0) {
            const _amount = ConvertToken(order.currency, order.amount)

            inner.amount = _amount * percent[i].value;
            setInner({...inner})
            amount = inner.amount;
            setAmount(amount);
        }
    }

    const onChange = (key, value) => {
        inner[key] = value;
        setInner({...inner})
    }

    const hidden = () => {
        setInner({
            name: '', period: '', amount: '', desc: ''
        });
        cancel(false);
    }

    const confirm = () => {
        // 判断是否有空指针
        let flag = true;
        for (const i in inner) {
            if (!inner[i]) {
                flag = false;
            }
        }
        if (!flag) {
            // message.error('请填写完成')
            return
        }
        // 发起签名
        updateAppend()
    }

    return <div className="stageInner">
        <div className="inner">
            <p className="inner-title">{t("order.name")}</p>
            <Input maxLength={16} className="name" onChange={(e) => onChange('name', e.target.value)} />
        </div>
        <div className="inner">
            <p className="inner-title">{t("order.delivery-length")}</p>
            <div className="flex">
                <InputNumber stringMode min={1} precision={0} className="period" onChange={(e) => onChange('period', e)} /> 
                <p>{t("task.day")}</p>
            </div>
        </div>
        <div className="inner">
            <p className="inner-title">{t("order.cost")}</p>
            <div className="percent">
                <div className="percent-list">
                    {
                        percent.map((e,i) => 
                            <div 
                                className={`percent-item ${e.active ? 'percent-item-active' : ''}`} 
                                key={i}
                                onClick={() => changePercent(i)}
                            >
                                {e.title}
                            </div>
                        )
                    }
                </div>
                <div className="flex">
                    <InputNumber stringMode min={0.0001} precision={4} value={amount} className="amount" onChange={(e) => onChange('amount', e)} /> <p>{ConvertTokenAddress(order.currency)}</p>
                </div>
            </div>
        </div>
        <div className="inner">
            <p className="inner-title">{t("order.delivery-note")}</p>
            <TextArea maxLength={500} onChange={(e) => onChange('desc', e.target.value)} />
        </div>
        <div className="btns">
        <Button disabled={isLoading} className="confirm" onClick={() => hidden()}>{t("order.cancel")}</Button>
        <Button loading={isLoading} className="confirm" onClick={() => confirm()}>{t("order.confirm")}</Button>
        </div>
    </div>
}