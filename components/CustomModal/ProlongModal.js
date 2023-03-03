import { Button, InputNumber, message, Modal, Select } from "antd";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useState } from "react";
import { CurrencyMin } from "../../utils/Currency";
export default function ProlongModal(params) {
    
    const { close, prolong, loading, currency, who, issuer } = params;
    const { t } = useTranslation("task");
    let [period, setPeriod] = useState()
    const changePeriod = () => {
        if (!period) {
            // message.error('请输入延长时间')
            return
        }
        prolong(period)
    }

    return <Modal
        open
        footer={null} 
        onCancel={() => close(false)}
        className="modal-order-receiver prolongModal"
        closeIcon={<img src="/closeIcon.png" />}
    >
        <div className="img">
            <Image src="/img/modal-redlight.png" layout="fill" quality={100} />
        </div>
        <p className="title">{t("ongoing.request.delay")}</p>
        <div className="inner">
            <p className="inner-title">{t("ongoing.modal.delay.title")}</p>
            <div className="flex">
                <InputNumber 
                    stringMode 
                    min={1} 
                    precision={0} 
                    className="input" 
                    controls={false} 
                    value={period} 
                    onChange={e => setPeriod(e)} 
                />
                <p>{t("task.day")}</p>
            </div>
        </div>
        <p className="tips">{t("ongoing.modal.delay.tips",{who: who === issuer ? t("worker"): t("issuer")})}</p>
        <div className="btns">
            <Button onClick={() => close(false)}>{t("order.cancel")}</Button>
            <Button onClick={() => changePeriod()} loading={loading}>{t("ongoing.modal.delay.btn")}</Button>
        </div>
    </Modal>
}