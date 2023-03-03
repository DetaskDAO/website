import { useEffect, useState } from "react"
import { Button, Modal, Upload, message, Form, Spin } from 'antd';
import { useAccount, useContractWrite, useSigner, useWaitForTransaction } from 'wagmi';
import { useRouter } from 'next/router'
import { ethers } from "ethers";
// 自定义部分
import { ConfigTask } from '../controller/index';
import { BitOperation } from '../utils/BitOperation';
import { uploadProps } from "../components/upload/config";
import ConnectModal from "../components/CustomModal/ConnectModal";
import ComfirmTaskModal from "../components/CustomModal/ComfirmTaskModal";
import { omit } from 'lodash';
import { createTask, getSillTreeMap, updateTask } from "../http/_api/task";
import { getJwt } from "../utils/GetJwt";
import { GetSignature } from "../utils/GetSignature";
import SkillsCard from "../components/CustomCard/SkillsCard";
import { UploadOutlined } from '@ant-design/icons';
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import CustomInner from "../components/CustomInner";
import { getHash, searchTaskDetail } from "../http/_api/public";
import { taskCurrency, taskCurrencyNameV } from "../utils/Currency";

export default function Publish() {
    
    const { t } = useTranslation("task");
    const router = useRouter();
    const { data: signer } = useSigner();
    const { address } = useAccount();
    const { write: Task, data: TaskData, isLoading: createLoading } = useContractWrite({
        ...ConfigTask("createTask"),
        onSuccess(data) {
            writeSuccess(data.hash)
        },
        onError(err) {
            console.log(err);
        }
    })
    const waitForCreate = useWaitForTransaction({
        hash: TaskData?.hash,
        onSuccess(data) {
            transactionSuccess(TaskData?.hash)
        },
        onError(err) {
            writeError()
        }
    })

    const { write: TaskModify, data: TaskModifyData, isLoading: modifyLoading } = useContractWrite({
        ...ConfigTask("modifyTask"),
        onSuccess(data) {
            writeSuccess(data.hash, true)
        },
        onError(err) {
            console.log(err);
        }
    })
    const waitForModify = useWaitForTransaction({
        hash: TaskModifyData?.hash,
        onSuccess(data) {
            transactionSuccess(TaskModifyData?.hash)
        },
        onError(err) {
            writeError()
        }
    })
    
    // 遮罩层显示
    let [showSpin,setShowSpin] = useState(false)

    const inner = [
        {title: t("task.name"), type: 'input', desc: '项目名称', name: 'title'},
        {title: t("task.desc"), type: 'textarea', desc: '项目描述', name: 'desc'},
        {type: "upload", desc: '项目附件', name: 'attachment'},
        {title: t("task.skill"), type: 'ul', desc: '项目要求', name: 'role'},
        {title: t("task.amount"), type: 'inputNumber', desc: '预计金额', name: 'budget'},
        {title: t("task.period"), type: 'select', desc: '预计周期', name: 'period'},
        // {title: 'LOGO（Optional）', type: 'select', desc: '', name: ''},
    ]
    const [form] = Form.useForm();
    let [modifyInfo, setModifyInfo] = useState();
    let [isTask, setIsTask] = useState();

    let [params, setParams] = useState({});
    let [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisibleC, setIsModalVisibleC] = useState(false);
    let [fileList, setFileList] = useState([]);
    let [isPost,setIsPost] = useState(true);
    let [skill,setSkill] = useState([]);
    let [skills,setSkills] = useState({
        title: '技能要求',
        subtitle: '你擅长的技能*(最多4个)',
        list: []
    })

    const form0 = () => {
        form.setFieldsValue({
            budget: 0
        });
    }

    const handleChange = (info, list) => {
        params.suffix = info.file.name;
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
            setParams({...params})
        }
        setFileList([...fileList])
    }

    const comfirm = async() => {
        var obj = _.omit(params,'role');
        let arr = [];
        skills.list.map(e => {
            arr.push(e.index);
        })
        delete obj.desc;
        obj.skills = BitOperation(arr)
        obj.period = obj.period * 24 * 60 * 60;
        if (obj.budget !== 0) {
            // 主
            if (obj.currency === 4) {
                console.log(obj.budget);
                obj.budget = ethers.utils.parseEther(`${obj.budget}`);
            }
            // usd
            else if (obj.currency === 1) {
                obj.budget = Number(obj.budget) * Math.pow(10,6);
            }
        }
        if (!obj.currency) {
            obj.currency = 4
        }
        obj.timestamp = 0;
        obj.disabled = false;
        let fee = { value: ethers.utils.parseEther("0") };

        // 上传ipfs
        let data = new FormData();
        let flag = true;
        data.append('json',JSON.stringify({
            title: params.title,
            desc: params.desc,
            attachment: params.attachment ? params.attachment : '',
            suffix: params.suffix ? params.suffix : ''
        }))

        await getHash(data)
        .then(res => {
            if(res.code === 0){
                obj.attachment = res.data.hash;
            }else{
                message.warning(res.msg);
                flag = false;
            }
        })

        if (!flag) return
        setIsModalVisibleC(false); 
        modifyInfo ? 
        TaskModify({
            recklesslySetUnpreparedArgs: [modifyInfo.task_id, obj, fee]
        })
        :
        Task({
            recklesslySetUnpreparedArgs: [address, obj, fee]
        })
    }

    const writeSuccess = (hash, modify) => {
        if (modify) {
            updateTask({hash: hash})
            .then(res => {
                if (res.code === 0) {
                    setShowSpin(true)
                }
            })
        }else{
            createTask({hash: hash})
            .then(res => {
                if (res.code === 0) {
                    setShowSpin(true)
                } else {
                    message.error(res.msg);
                }
            })
        }
    }

    const transactionSuccess = (hash) => {
        // message.success('交易成功');
        setTimeout(() => {
            router.push(`/user/projects?w=issuer&bar=tasks&hash=${hash}`)    //  跳转链接
        }, 500);
    }

    const writeError = () => {
        // message.error('交易失败')
    }

    const onFinish = (values) => {
        // 判断是否登陆 && 是否签名 && token有效期
        const token = localStorage.getItem(`session.${address?.toLowerCase()}`);
        if (!address) {
            setIsModalVisible(true)
            return
        }else if(!token || !getJwt(token)){
            // 获取签名
            GetSignature({address:address,signer:signer});
            return  
        }
        if (skills.list.length === 0) {
            message.warning(t("task.tips-skill"))
            return
        }

        if (params.budget === undefined) {
            params.budget = 0;
        }
        params = {...values, attachment: params.attachment, suffix: params.suffix}
        setParams({...params});
        if (modifyInfo) {
            comfirm()
            return
        }
        setIsModalVisibleC(true)
    };

    const isSubmit = (e) => {
        for (const i in e) {
            if (i !== 'budget' && !e[i]) {
                return false
            }
        }
        isPost = false;
        setIsPost(isPost);
    }

    useEffect(() => {
        if (location.search) {
            const id = location.search.split("?")[1];
            searchTaskDetail({issuer: address, task_id: id})
            .then(res => {
                if (res.code === 0 && res.data.list && res.data.list.length > 0) {
                    modifyInfo = res.data.list[0];
                    modifyInfo.currency = modifyInfo.currency === 'USD' ? 'USDT' : modifyInfo.currency;
                    modifyInfo.budget = taskCurrency(modifyInfo.currency, modifyInfo.budget);
                    modifyInfo.attachment = JSON.parse(modifyInfo.attachment);
                    params.attachment = modifyInfo.attachment.attachment;
                    params.suffix = modifyInfo.attachment.suffix;
                    setParams({...params});
                    setModifyInfo({...modifyInfo});
                    setIsTask(true);
                    if (params.suffix) {
                        fileList[0] = {
                            uid: '-1',
                            name: params.suffix,
                            status: 'done',
                            url: '',
                        };
                        setFileList([...fileList]);
                    }
                }else{
                    setIsTask(true);
                }
            })
        }else{
            setIsTask(true);
        }
        // 获取技能树
        getSillTreeMap()
        .then(res => {
            if (res.code === 0) {
                skill = res.data;
                setSkill([...skill]);
            }
        })
    },[])

    return <div className="Publish">
        <Spin spinning={showSpin}>
        <div className="banner">
            <div className="banner-content">
                <p className="title">{t("title")}</p>
                <p className="subtitle">{t("subtitle")}</p>
            </div>
        </div>
        <div className="content">
            <div className="content-panel">
                {
                    isTask &&
                    <Form
                        name="complex-form"
                        form={form}
                        onFinish={onFinish}
                        onValuesChange={ (nv,v) => isSubmit(v)}
                        initialValues={
                            modifyInfo ? 
                            {
                                title: modifyInfo.title,
                                desc: modifyInfo.attachment.desc,
                                currency: modifyInfo.currency,
                                budget: modifyInfo.budget,
                                period: modifyInfo.period / 60 / 60 / 24,
                                currency: taskCurrencyNameV(modifyInfo.currency)
                            }
                            :
                            {
                                currency: 4,
                                budget: 0
                            }
                        }
                    >
                        {
                            inner.map((e,i) => {
                                if (e.type == "upload") {
                                    return (
                                        <div className="item" key={i}>
                                            <Upload
                                                listType="picture"
                                                onChange={handleChange}
                                                onSuccess={uploadSuccess}
                                                className="item-upload"
                                                {...uploadProps}
                                                beforeUpload={
                                                    (file) => {
                                                        if (!address) {
                                                            isModalVisible = true;
                                                            setIsModalVisible(isModalVisible)
                                                            return false
                                                        }
                                                        const isLt2M = file.size / 1024 / 1024 < 20
                                                        if(!isLt2M){
                                                            message.error('Must smaller than 20MB!')
                                                            return false || Upload.LIST_IGNORE
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
                                                <Button>
                                                    <div className="img" >
                                                    <UploadOutlined />
                                                    </div>
                                                    <div className="p">{t("task.upload")}</div>
                                                </Button>
                                            </Upload>
                                        </div>
                                    )
                                }
                                if (e.type == "ul") {
                                    return (
                                        <div className="item" key={i}>
                                            <div className="item-nav">
                                                <p className="item-title">{e.title}</p>
                                            </div>
                                            <SkillsCard
                                                defaultValue={modifyInfo?.role}
                                                key={i}
                                                stree={skill} 
                                                value={skills} 
                                                setValue={setSkills} 
                                            />
                                        </div>
                                    )
                                }
                                return  (
                                    <CustomInner 
                                        key={i}
                                        type={e.type} 
                                        label={e.title}
                                        name={e.name}
                                        form={form0}
                                    />
                                )
                            })
                        }
                        <div className="item">
                            <Form.Item>
                                <Button type="primary" htmlType="submit" disabled={isPost} className={`panel- ${!isPost ? 'panel-btn' : ''}`} loading={createLoading || modifyLoading} >
                                    {
                                        modifyInfo ? 
                                        t("btnmodify")
                                        :
                                        t("btn")
                                    }
                                </Button>
                            </Form.Item>
                        </div>
                    </Form>
                }
            </div>
        </div>
        </Spin>
        {
            isModalVisible && 
            <ConnectModal 
                setStatus={setIsModalVisible} 
                status={isModalVisible} 
            />
        }
        <Modal
            className="Submit_item" 
            footer={null} 
            closable={false}
            open={isModalVisibleC} 
            onCancel={() => setIsModalVisibleC(false)}
        >
            <ComfirmTaskModal inner={params} skills={skills} comfirm={() => comfirm()} setStatus={setIsModalVisibleC} />
        </Modal>
    </div>
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}