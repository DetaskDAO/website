import { Input, Select, Button, Checkbox, Col, Row, InputNumber, Modal } from "antd"
import { useEffect, useState } from "react";
import Computing_time from "../Computing_time";
import Image from "next/image"
import { useTranslation } from "react-i18next";
import { taskCurrency } from "@/utils/Currency";

const {TextArea} = Input
const { Option } = Select;
function ApplyTaskModal (props) {
   
    const { open, onCancel, submit, project, userContact, setUserContact, applyInfo, applyLoading } = props;
    const { t } = useTranslation("task");

    let [icons, setIcons] = useState([
        { title: 'telegram', value: '', icon: "/icon/telegram.png" },
        { title: 'wechat', value: '', icon: "/icon/wechat.png" },
        { title: 'skype', value: '', icon: "/icon/skype.png" },
        { title: 'discord', value: '', icon: "/icon/discord.png" },
        { title: 'phone', value: '', icon: "/icon/whatsapp.png" }
    ])

    let [inner,setInner] = useState({
        desc: '', valuation: ''
    });

    const onchange = (e,type) => {
        inner[type] = e;
        setInner({...inner});
        console.log(inner);
    }

    const changeContact = (i,value) => {
        icons[i].value = value;
        setIcons([...icons]);

        // 赋值 返回params
        let obj = {};
        icons.map(e => {
            obj[e.title] = e.value;
        })
        userContact = obj;
        setUserContact({...userContact});
    }

    useEffect(() => {
        for (const i in userContact) {
            icons.map(e => {
                if (i === e.title) {
                    e.value = userContact[i]
                }
            })
        }
        setIcons([...icons]);
    },[])

    useEffect(()=>{
        if (applyInfo?.ID) {
            inner.desc = applyInfo.desc;
            inner.valuation = applyInfo.price / Math.pow(10,18)
            setInner({...inner})
        }else{
            inner.desc = ' '
            setInner({...inner})
        }
    },[])


    return <Modal
            footer={null}
            open={open}
            onCancel={onCancel}
            className="modal-apply-task"
        >
            <div className="apply-task">
        <p className="apply-task-top">
            <span className="apply-task-top-text">{t("modal-apply.title")}</span>
        </p>
        <div className="apply-detail">
            <div className="detail-img"></div>
            <div className="detail-info">
                <p className="info-title">{project.title}</p>
                <div className="info-content">
                    <div className="bte">
                        <i className="iconfont time-icon">&#xe6c2;</i>
                        <Computing_time create_time={project.created_at} />
                    </div>
                    <p>
                    {t("task.period")}{t("mao")} {project.period / 24 / 60 / 60}&nbsp;{t("task.day")}
                    </p>
                </div>
                <p className="info-role">
                    {t("task.skill")}{t("mao")} {
                        project.role.map((e,i) => <span key={i}>
                            {
                                location.pathname.indexOf('/zh') === -1 ? 
                                e.en:e.zh
                            }
                        </span> )
                    }
                </p>
            </div>  
            <p className="cost">{t("task.amount")}{t("mao")} <span>
                {
                    project.budget == 0 ? 
                    t("task.quotation")
                    :
                    <>
                    {project.budget}&nbsp;{project.currency}
                    </>
                }
                </span></p>
        </div>
        <div className="apply-task-applyInfo">
            <p className="apply-task-applyInfo-title">{t("modal-apply.subtitle")}</p>
            <div className="apply-task-applyInfo-priceAndtime">
                <div className="apply-task-applyInfo-price">
                    <p>{t("modal-apply.amount")}</p>
                    <InputNumber 
                        stringMode 
                        className="applyPrice" 
                        max={Math.pow(2,52)} 
                        min={0.0001}
                        precision={4}
                        controls={false} 
                        onChange={e => onchange(e, 'valuation')} 
                        value={inner.valuation} 
                        keyboard={false} 
                    />
                    <Select className="applyCurrency" defaultValue={project.currency} disabled >
                        <Option value={project.currency}>{project.currency}</Option>
                    </Select>
                </div>
            </div>
            <div className="apply-task-applyInfo-contact">
                <p>{t("modal-apply.social")}<span>{t("modal-apply.social-tip")}</span></p>
                <div className="icons">
                    {
                        icons.map((e,i) => 
                            <div className="item" key={i}>
                                <div className="icon">
                                    <Image src={e.icon} width={38} height={38} />
                                </div>
                                <Input
                                    value={e.value}
                                    onChange={e => changeContact(i,e.target.value)}
                                />
                            </div>
                        )
                    }
                </div>
            </div>
            <div className="apply-task-applyInfo-self">
                <p>{t("modal-apply.tj")}</p>
                {
                    inner.desc &&
                    <TextArea className="apply-task-applyInfo-text" rows={4} maxLength={4000} onChange={e => onchange(e.target.value, 'desc')} defaultValue={applyInfo.desc} />
                }
            </div>
            <div className="box">
                <Button loading={applyLoading} className="apply-task-btn" onClick={() => submit(inner)}>
                    {
                        applyInfo?.ID ? 
                        t("btn-update")
                        :
                        t("btn-apply")
                    }
                </Button>
            </div>
        </div>
    </div>
    
    </Modal>
}
export default ApplyTaskModal;
