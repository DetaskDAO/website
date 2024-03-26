import { Button, InputNumber, message, Modal, Select } from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CurrencyMin } from "@/utils/Currency";
const { Option } = Select;
export default function InviteModal(params) {
    
    const { t } = useTranslation("task");
    const { close, invitation, loading } = params;

    let [amount, setAmount] = useState();
    let [token, setToken] = useState("0x0000000000000000000000000000000000000000");

    const selectAfter = (
        <Select
          defaultValue="MATIC"
          onChange={e => changeToken(e)}
        >
          <Option key="1" value="0x0000000000000000000000000000000000000000">MATIC</Option>
          <Option key="2" value={process.env.NEXT_PUBLIC_CONTRACT_USDC}>USDC</Option>
        </Select>
    );

    const changeToken = (e) => {
        token = e;
        setToken(token);
        amount = null;
        setAmount(amount);
    }

    const handel = () => {
        if (!amount) {
            // message.warning("请输入")
            return
        }
        invitation(amount,token)
    }

    const changeAmount = (e) => {
        amount = e;
        setAmount(amount);
    }

    useEffect(() => {
        console.log(amount);
    },[amount])

    return <Modal
        open
        footer={null} 
        onCancel={() => close(false)}
        className="modal-order-receiver"
        closeIcon={<img src="/closeIcon.png" />}
    >
        <div className="order-receiver-icon">
            <Image src="/img/tipIcon.png" width={87} height={79} quality={100} />
        </div>
        <p className="order-receiver-title">{t("applylist.modal.title")}</p>
        <InputNumber min={0.0001} precision={4} className="order-receiver-price" controls={false} addonAfter={selectAfter} value={amount} onChange={e => changeAmount(e)} />
        <p className="order-receiver-inviteTip">{t("applylist.modal.subtitle")}</p>
        <Button className="btn" onClick={() => handel()} loading={loading}>{t("applylist.modal.btn")}</Button>
    </Modal>
}