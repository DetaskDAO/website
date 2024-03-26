import { useEffect, useState } from "react";
// request
import { getSillTreeMap } from "@/request/_api/task";
// utils
import { deform_Skills } from "@/utils/Deform";
// Internationalization
import i18n from 'i18next';
import { useTranslation } from "react-i18next";


export default function OrderNav(props) {

    const { task } = props;
    const { t } = useTranslation("task");
    let [skill, setSkill] = useState();

    useEffect(() => {
        // 获取技能树
        getSillTreeMap()
        .then(res => {
            if (res.code === 0) {
                skill = res.data;
                setSkill([...skill]);
            }
        })
    },[])

    return (
        task &&
        <div className="worker-title">
            <div className="title-info">
                <strong className="title-info-head">{task.title}</strong>
                <p className="title-info-role">{t("task.skill")}{t("mao")}&nbsp;

                    {
                        skill?.length > 0 &&
                        deform_Skills(task.role, skill).map(e => 
                            <span className="title-info-role-li" key={e.index}>
                                {
                                    i18n.language === 'en' ? e.en : e.zh
                                }
                            </span>
                        )
                    }
                </p>
                <div>
                    <p className="title-info-cycle">{t("task.period")}{t("mao")}&nbsp;<span className="title-info-cycle-date">{task.period / 24 / 60 / 60}&nbsp;{t("task.day")}</span> </p>
                </div>
            </div>
            <div className="title-cost">
                <p className="title-cost-line">{t("task.amount")}{t("mao")}&nbsp;
                {
                    task.budget == 0 ? 
                    <span className="title-cost-price">{t("task.quotation")}</span>
                    :
                    <span className="title-cost-price">{task.budget}&nbsp;{task.currency}</span>
                }
                </p>
            </div>
        </div>
    )
}