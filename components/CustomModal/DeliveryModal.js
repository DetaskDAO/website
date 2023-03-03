import { FolderAddOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal, Upload } from "antd";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useEffect, useState } from "react";
import { uploadProps } from "../upload/config";
const { TextArea } = Input;

export default function DeliveryModal({close, updateDelivery, loading, stageIndex}) {

    const { t } = useTranslation("task");
    let [fileList, setFileList] = useState([]);
    let [params, setParams] = useState({
        content: '', attachment: '', fileType: ''
    })

    const changeDesc = (e) => {
        params.content = e;
        setParams({...params});
    }

    const handleChange = (info, list) => {
        params.fileType = info.file.name;
        setParams({...params});
        fileList = info.fileList;
        setFileList([...fileList]);
    }

    const uploadSuccess = (res, file) => {
        if (res.code === 0) {
            message.success(res.msg);
            fileList[0].status = "success";
        } else {
            message.error(res.msg);
            fileList[0].status = "error";
        }
        if (res.code !== 7) {
            params.attachment = res.data.hash;
            setParams({...params});
        }
    }

    return  <Modal
        open
        footer={null}
        onCancel={() => close(false)}
        className="modal-order-receiver prolongModal deliveryModal"
        closeIcon={<img src="/closeIcon.png" />}
    >
        <div className="img">
            <Image src="/img/tipIcon.png" layout="fill" quality={100} />
        </div>
        <p className="title">{t("ongoing.modal.upload.title")}</p> 
        <div className="inner">
            <p className="inner-title">{t("ongoing.modal.upload.subtitle")}</p>
            <TextArea maxLength={4000} value={params.content} onChange={e => changeDesc(e.target.value)} />
        </div>

        <Upload
            listType="picture"
            onChange={handleChange}
            onSuccess={uploadSuccess}
            className="item-upload"
            {...uploadProps}
            beforeUpload= {
                (info) => {
                    const isLt20M = info.size / 1024 / 1024 < 20
                    if(!isLt20M){
                        message.error('Must smaller than 20MB!')
                        return false
                    }
                    return true
                }
            }
            fileList={fileList}
            progress={{
                strokeColor: {
                  '0%': '#108ee9',
                  '100%': '#87d068',
                },
                strokeWidth: 3,
                format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
            }}
        >
            <Button><FolderAddOutlined className="img" /><div><p>{t("ongoing.modal.upload.tips")}</p></div></Button>
        </Upload>

        <div className="btns">
            <Button onClick={() => close(false)} disabled={loading}>{t("ongoing.modal.upload.btn-cancel")}</Button>
            <Button onClick={() => updateDelivery(params)} loading={loading}>{t("ongoing.modal.upload.btn-submit")}</Button>
        </div>
    </Modal>
}