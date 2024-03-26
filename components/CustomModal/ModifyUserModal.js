import { CameraFilled, CameraOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal, Upload } from "antd";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getSillTreeMap } from "@/request/_api/task";
import { updateUserInfo } from "@/request/_api/user";
import { HashAvatar } from "@/utils/HashAvatar";
import SkillsCard from "../CustomCard/SkillsCard";
import { uploadImageProps } from "../upload/avatar";



export default function ModifyUserModal(params) {
    
    const { status, setStatus, info } = params;
    const { address } = useAccount();
    const { t } = useTranslation("task");
    
    let [skill,setSkill] = useState([]);
    let [skills,setSkills] = useState({
        title: '技能要求',
        subtitle: '你擅长的技能*(最多4个)',
        list: []
    })
    let [userInfo, setUserInfo] = useState();
    let [fileList, setFileList] = useState([
        {
            uid: '-1',
            name: 'avatar.png',
            status: 'done',
            url: '',
        }
    ]);

    const handleCancel = () => {
        setStatus(false);
    }

    const handleChange = (info, list) => {
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
            userInfo.avatar = res.data.url;
        }
        setFileList([...fileList])
    }

    const changeUserInfo = (name,value) => {
        userInfo[name] = value;
        setUserInfo({...userInfo});
    }

    const saveHanler = ()=>{
        let arr = [];
        skills.list.map(e => {
            arr.push(e.index);
        })
        userInfo.role = arr;
        console.log('userInfo ==> ', userInfo);
        console.log(skills);
        if(info){
            updateUserInfo(userInfo)
            .then(res => {
                message.success(res.msg)
                setTimeout(() => {
                    history.go(0)
                }, 500);
            })
        }else{
            // createUserInfo(userinfo)
            // .then(res=>{
            //     message.success(res.msg)
            //     setTimeout(() => {
            //         history.go(0)
            //     },500)
            // })
        }
    }

    useEffect(() => {
        
    },[info.avatar])

    useEffect(() => {
        if (info) {
            userInfo = info;
            setUserInfo({...userInfo});
            if (info.avatar) {
                fileList[0].url = process.env.NEXT_PUBLIC_DEVELOPMENT_API + "/" + info.avatar;
            }else{
                fileList[0].url = HashAvatar(userInfo?.address)
            }
            setFileList([...fileList]);
        }
    },[info])

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
    
    return  <Modal 
        title={t("user.modal.title")}
        className="Modify_personal_information" 
        footer={null} 
        open={status} 
        onCancel={handleCancel}
        // closeIcon= {<Button>Save</Button>}
        closable={false}
        maskClosable
    >
        <div className="avatar">
            <div className="img"></div>
            <Upload
                listType='picture-card'
                onChange={handleChange}
                onSuccess={uploadSuccess}
                className="item-upload"
                {...uploadImageProps}
                beforeUpload= {
                    (info) => {
                        const formatArr = ["image/jpeg","image/png","image/svg+xml","image/gif"]
                        let isImage = false
                        formatArr.map((e)=>{
                            if ( info.type === e ) {
                            isImage = true
                            }
                        })
                        if (!isImage) {
                            message.error("You can only upload JPG/PNG file!");
                            return false
                        }
                        const isLt100M = info.size / 1024 / 1024 < 4;
                        if (!isLt100M) {
                            message.error("Image must smaller than 4MB!");
                        }
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
                <div className="upload-rule">
                    <p>{t("user.modal.avatar1")}</p>
                    <p>{t("user.modal.avatar2")}</p>
                </div>
                <Button type="primary" icon={<CameraFilled />}>
                    <span className="ml20">{t("user.modal.upload")}</span>
                </Button>
            </Upload>
        </div>
        <div className="box">
            <p className="title">{t("user.modal.name")}</p>
            <div className="inners">
                <div className="inner name">
                    <Input
                        type="text" 
                        maxLength={40}
                        placeholder={t("user.modal.name-t")}
                        defaultValue={info.username}
                        onChange={(e)=> changeUserInfo('username',e.target.value)} 
                    />
                </div>
            </div>
        </div>
        <div className="box">
            <p className="title">{t("user.modal.bio")}</p>
            <div className="inners">
                <div className="inner desc">
                    <Input
                        type="text" 
                        placeholder={t("user.modal.bio-t")}
                        defaultValue={info.description}
                        onChange={(e)=> changeUserInfo('description',e.target.value)} 
                    />
                </div>
            </div>
        </div>
        <div className="box">
            <p className="title">{t("user.modal.social")}&nbsp;&nbsp;<span>&#40;{t("user.modal.social-t")}&#41;</span></p>
            <div className="inners social">
                <div className="inner">
                    <img src="/icon/telegram.png" alt="" />
                    <Input 
                        type="text" 
                        placeholder={t("user.modal.social-i",{name: "Telegram"})} 
                        defaultValue={info.telegram}
                        onChange={(e) => changeUserInfo('telegram',e.target.value)}
                    />
                </div>
                <div className="inner">
                    <img src="/icon/wechat.png" alt="" />
                    <Input 
                        type="text" 
                        placeholder={t("user.modal.social-i",{name: "Wechat"})} 
                        defaultValue={info.wechat}
                        onChange={(e) => changeUserInfo('wechat',e.target.value)}
                    />
                </div>
                
                <div className="inner">
                    <img src="/icon/skype.png" alt="" />
                    <Input 
                        type="text" 
                        placeholder={t("user.modal.social-i",{name: "Skype"})} 
                        defaultValue={info.skype}
                        onChange={(e) => changeUserInfo('skype',e.target.value)}
                    />
                </div>

                <div className="inner">
                    <img src="/icon/discord.png" alt="" />
                    <Input 
                        type="text" 
                        placeholder={t("user.modal.social-i",{name: "Discord"})} 
                        defaultValue={info.discord}
                        onChange={(e) => changeUserInfo('discord',e.target.value)}
                    />
                </div>

                <div className="inner">
                    <img src="/icon/whatsapp.png" alt="" />
                    <Input 
                        type="text" 
                        placeholder={t("user.modal.social-i",{name: "Phone"})} 
                        defaultValue={info.phone}
                        onChange={(e) => changeUserInfo('phone',e.target.value)}
                    />
                </div>
            </div>
        </div>
        <div className="box">
            <p className="title">{t("applylist.skill")}*</p>
                {
                    skill.length > 0 && 
                    <SkillsCard
                        defaultValue={info?.role}
                        stree={skill} 
                        value={skills} 
                        setValue={setSkills}
                    />
                }
        </div>
        <Button className="btn" onClick={() => saveHanler()}>{t("user.modal.save")}</Button>
    </Modal>
}