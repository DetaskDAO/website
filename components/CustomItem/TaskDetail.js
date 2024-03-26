import { FilePdfOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getSillTreeMap } from "@/request/_api/task";
import { deform_Skills } from "@/utils/Deform";
import { download } from "@/utils/download";
import { useTranslation } from "react-i18next";
import i18n from 'i18next';

export default function TaskDetail(params) {
    
    const { task } = params;
    const { t } = useTranslation("task");
    let [skill, setSkill] = useState();

    useEffect(() => {
        // 获取技能树
        if (task.role) {
            getSillTreeMap()
            .then(res => {
                if (res.code === 0) {
                    skill = res.data;
                    setSkill([...skill]);
                }
            })
        }
    },[task])

    return (
        <div className="content-container">
                <p className='task-details'>{t("detail-title")}</p>
                <div className='task-detail-list'>
                    <p className='task-cost task-li'>
                        <span className='task-cost-title title'>{t("task.amount")}{t("mao")}&nbsp;</span>
                        {
                            task.budget == 0 ? 
                            <span className="title-cost-price content">{t("task.quotation")}</span>
                            :
                            <span className='task-cost-price content'>{task.budget}&nbsp;{task.currency}</span>
                        }
                    </p>
                    <p className='task-date task-li'>
                        <span className='task-date-title title'>{t("task.period")}{t("mao")}&nbsp;</span>
                        <span className='task-date-time content'>{task.period / 86400}&nbsp;{t("task.day")}</span>
                    </p>
                </div>
                <div className="content-li">
                    <p className="li-title">{t("task.desc")}{t("mao")}&nbsp;</p>
                    <div className="li-box">
                        <p className="detail content">
                            {JSON.parse(task.attachment).desc}
                        </p>
                    </div>
                </div>
                <div className="content-li">
                    <p className="li-title">{t("task.file")}{t("mao")}&nbsp;</p>
                    <div className="li-box">
                        <div className="upload">
                            <p className="upload-title File" onClick={() => download(`${process.env.NEXT_PUBLIC_DEVELOPMENT_FILE}/${JSON.parse(task.attachment).attachment}`,JSON.parse(task.attachment).suffix)}>
                                {JSON.parse(task.attachment).suffix}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="content-li">
                    <p className="li-title">{t("task.skill")}{t("mao")}&nbsp;</p>
                    <div className="li-box boxs">
                        {
                            skill?.length > 0 &&
                            deform_Skills(task.role, skill).map(e => 
                                <div className="box" key={e.index}>
                                    {
                                        i18n.language === 'en' ? e.en : e.zh
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
    )
}