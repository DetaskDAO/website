import { Button } from 'antd';
import { CloseOutlined,FilePdfOutlined } from "@ant-design/icons"
import { useState,useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { taskCurrencyName } from '../../utils/Currency';
import { download } from '../../utils/download';

export default function ComfirmTaskModal(params) {
    
    const { t } = useTranslation("task");
    const { comfirm, inner, skills, setStatus } = params

    let [needSkills,setNeedSkills] = useState([]);
    
    useEffect(()=>{
        let nedSkills = []
        skills.list.map(ele=>{
            nedSkills.push(location.pathname.indexOf("/zh") === -1 ? ele.en : ele.zh)
        })
        needSkills = nedSkills
        setNeedSkills([...needSkills])
    },[params])


    return <div className='comfirm-task'>
        <p className="modal-title"> {t("modal.title")} <CloseOutlined className='modal-title' onClick={() => setStatus(false)} /></p>
            <div className="modal-info">
                <div className="info-full">
                    <p className="title">{t("task.name")}</p>
                    <div className="content">{inner.title}</div>
                </div>
                {/* <div className="info-full">
                    <p className="title">项目类型</p>
                    <div className="content">区块链</div>
                </div> */}
                <div className="info-full info-half">
                    <div>
                        <p className="title">{t("task.amount")}</p>
                        {
                            inner.budget == 0 ? 
                            <div className="content">{t("task.quotation")}</div>
                            :
                            <div className="content">{inner.budget} {taskCurrencyName(inner.currency)}</div>
                        }
                    </div>
                    <div>
                        <p className="title">{t("task.period")}</p>
                        <div className="content">{inner.period}  {t("task.day")}</div>
                    </div>
                </div>
                <div className="info-full">
                    <p className="title">{t("task.desc")}</p>
                    <div className="content">{inner.desc}</div>
                </div>
                {
                    inner.suffix &&
                    <div className="info-full">
                        <p className="title">{t("task.file")}</p>
                        <div className="content">
                            <p className='info-document File'  onClick={() => download(`${process.env.NEXT_PUBLIC_DEVELOPMENT_FILE}/${inner.attachment}`,inner.suffix)}>
                                <FilePdfOutlined className='icon' />
                                <span className='document-name'>{inner.suffix}</span>
                            </p>
                        </div>
                    </div>
                }
                <div className="info-full">
                    <p className="title">{t("task.skill")}</p>
                    <div className="content">
                        {
                            needSkills.map((e,i)=>{
                                return <span className='info-skill' key={i}>{e}</span>
                            })
                        }
                    </div>
                </div>
                <Button className="btn" type="primary" onClick={() => comfirm()}>{t("modal.btn")}</Button>
            </div>
    </div>
}