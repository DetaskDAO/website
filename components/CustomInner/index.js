import { Input, Select, InputNumber, Form, Checkbox } from 'antd';
import { ethers } from 'ethers';
import { useTranslation } from "react-i18next";

import { useState } from 'react';
const { Option } = Select;
const { TextArea } = Input;


function CustomInner(props) {
    
    const { type, label, name, form } = props;
    const { t } = useTranslation("task");
    let [quotation, setQuotation] = useState();
    

    const selectAfter = (
        <Form.Item name="currency" noStyle>
            <Select>
              <Option value={4}>MATIC</Option>
              <Option value={1}>USDC</Option>
            </Select>
        </Form.Item>
    );

    const handelQuo = (value) => {
        form()
        quotation = value;
        setQuotation(quotation);
    }

    const typePrint = () => {
        switch (type) {
            case 'input':
                return (
                    <Form.Item name={name} 
                        rules={[{
                            required: true,
                            message: t("task.tips.name"),
                        }]}
                    >
                        <Input className="item-input" maxLength={30} />
                    </Form.Item>
                )
            case 'textarea':
                return (
                    <Form.Item name={name} 
                        rules={[{
                            required: true,
                            message: t("task.tips.desc"),
                        }]}
                    >
                        <TextArea className="item-text" maxLength={4000} />
                    </Form.Item>
                )
            case 'inputNumber':
                return (
                    <Form.Item name={name} 
                        rules={[{
                            required: true,
                            message: t("task.tips.amount"),
                        }]}
                    >
                        {
                            !quotation &&
                                <InputNumber 
                                    className="item-num"
                                    stringMode
                                    max={Math.pow(2,52)} 
                                    min={0.0001}
                                    precision={4}
                                    controls={false} 
                                    addonAfter={selectAfter}
                                />
                        }
                    </Form.Item>
                )
            case 'select': 
                return (
                    <Form.Item name={name} 
                        rules={[{
                            required: true,
                            message: t("task.tips.period"),
                        }]}
                    >
                        <Select className='item-select'>
                            <Option value={3}>3 {t("task.day")}</Option>
                            <Option value={7}>7 {t("task.day")}</Option>
                            <Option value={21}>21 {t("task.day")}</Option>
                            <Option value={30}>30 {t("task.day")}</Option>
                            <Option value={60}>60 {t("task.day")}</Option>
                        </Select>
                    </Form.Item>
                )
            default:
                break;
        }  
    }

    return (
        <div className="item">
            <div className="item-nav">
                <p className="item-title">{label}</p>
                {
                    type === "inputNumber" && 
                    <Form.Item style={{marginBottom: "10px", marginLeft: "10px"}}>
                        <Checkbox checked={quotation} onChange={(e) => handelQuo(e.target.checked)}>
                            {t("task.quotation")}
                        </Checkbox>
                    </Form.Item>
                }
            </div>
            {typePrint()}
        </div>
    )
}

export default CustomInner;