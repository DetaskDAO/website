import { useState, useEffect } from "react";
import { ClockCircleOutlined } from '@ant-design/icons'
import { useTranslation } from "next-i18next";

export default function Computing_time (params) {
    const { create_time } = params
    const {t} = useTranslation("task");
    const timeBlock = () => {
        let now = new Date(Date()).getTime() / 1000
        let create = (new Date(create_time).getTime()) / 1000
        let day = ( now - create ) / 86400
        let hour = (now - create ) / 3600
        let minute = (now - create ) / 60
        let second = (now - create )
        if (day > 1) {
            let days = Math.floor(day)
            return (
                    <div className="time-text">
                        <p>{t("task.ago.created")}{days} <span>{t("task.ago.d")}</span></p>
                    </div>
            )
        }else if ( day < 1 && hour > 1 ) {
            let hours = Math.floor(hour);
            return (
                <div className="time-text">
                    <p>{t("task.ago.created")}{hours} <span>{t("task.ago.h")}</span></p>
                </div>
            )
        }else if ( day < 1 && hour < 1 && minute > 1 ) {
            let minutes = Math.floor(minute)
            return (
                <div className="time-text">
                    <p>{t("task.ago.created")}{minutes} <span>{t("task.ago.m")}</span></p>
                </div>
            )
        }else {
            let seconds = Math.floor(second)
            return (
                <div className="time-text">
                    <p>{t("task.ago.created")}{seconds} <span>{t("task.ago.s")}</span></p>
                </div>
            )
        }
    } 

    return (
        timeBlock()
    )
}


