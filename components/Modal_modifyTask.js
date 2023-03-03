import { useState,useEffect } from "react"
import { Button, Input,Select,Upload, Checkbox,message, Modal } from "antd"
import {FolderAddOutlined} from "@ant-design/icons"
import { useContracts } from "../controller";
import { useAccount, useProvider } from "wagmi";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useUpdateEffect } from "ahooks";
import { BitOperation } from "../utils/BitOperation";
import { updateTask } from "../http/_api/task";
import { getJwt } from "../utils/GetJwt";
import { getHash } from "../http/_api/public";


export  function Modal_ModifyTask (params) {
    const { showModifyTaskModal, setShowModal, taskInfo, setTaskInfo, setIsLoading } = params
    const _data = require("../data/data.json")

    const { TextArea }  = Input
    const { Dragger } = Upload;
    const {Option} = Select;
    const router = useRouter()
    const provider = useProvider();


    // const {allInfo,taskId} = params
    const {address,isConnected } = useAccount()

    const { useTaskContractWrite: Task } = useContracts("modifyTask")

    let [account,setAccount] = useState()
    let [skillIndex,setSkillIndex] = useState([])

    let [formData,setFormData] = useState()
    let [suffix,setSuffix] = useState()

    let [modifyInfo,setModifInfo] = useState({})
    
    let [skillss,setSkillss] = useState([])

    const beforeUpload = (info) => {
        const isLt2M = info.file.size / 1024 / 1024 < 20
        if(!isLt2M){
            message.error('Must smaller than 20MB!')
            return false
        }
        return true
    }


    const upload = async (info)=>{
        var form_Data = new FormData()
        form_Data.append('files',info.file)
        formData = form_Data
        setFormData(formData)
        return await new Promise((resolve,reject)=>{
            resolve(beforeUpload(info))
        })
        .then((res)=>{
            res?info.onSuccess(): info.onError()
        })
    }

    const uploadChange = (info)=>{
        suffix = info.file.name;
        setSuffix(suffix)
        if(info.file.status === 'done'){
            message.success(`${info.file.name} file uploaded successfully.`)
        }else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`)
        }
    }

    // 初始化技能列表
    const initSkills = () => {
        let arr = []
        _data.skills.map((e,i)=>{
            if (i > 0) {
                arr.push({title: e.name, status: false, value: e.value})
            }
        })
        skillss = arr
        setSkillss([...skillss])
    }

    const checkSkill = (e,i)=>{

        let arr = []
        skillss.map(ele => {
            if(ele.status){
                arr.push(ele)
            }
        })
        if(arr.length < 6){
            e.status = !e.status
            setSkillss([...skillss])
        }else{
            e.status = false
            setSkillss([...skillss])
        }
    }

    // 修改任务信息
    const changeInfo = (type,value) => {
        if ( type == 'period' ) {
            value = value * (24*3600)
        }
        taskInfo[type] = value
        setTaskInfo({...taskInfo})
    }

    const modifyHandler = async ()=>{
        let arr = [];
        let newArr = []
        skillss.map((e,i)=>{
            if (e.status) {
                arr.push(e.value)
                newArr.push(i + 1)
            }
        })
        skillIndex = newArr
        setSkillIndex([...skillIndex])
        modifyInfo = {
            task_id: taskInfo.task_id,
            currency: taskInfo.currency === 'ETH' ? 1 : 1,
            attachment: taskInfo.attachment,
            budget: taskInfo.budget,
            desc: taskInfo.desc,
            period: taskInfo.period,
            role: [...arr],
            title: taskInfo.title,
            suffix: taskInfo.suffix,
            hash: '',
            issuer: taskInfo.issuer
        }
        if(formData){
            await getHash(formData)
            .then((res)=>{
                modifyInfo.attachment = res
            })
            .catch(error => {
                console.log(error);
                return error
            })
        }
        setModifInfo({...modifyInfo})
        let params = {
            title: modifyInfo.title,
            desc: modifyInfo.desc,
            attachment: modifyInfo.attachment,
            currency:modifyInfo.currency,
            budget: ethers.utils.parseEther((modifyInfo.budget).toString()),
            period: modifyInfo.period,
            skills: BitOperation([...skillIndex]),
            disabled: false,
            timestamp: 0
        }
        const token = localStorage.getItem(`session.${address.toLowerCase()}`);
        let status = getJwt(token);
        if (!status) {
            await getToken();
        }
        setIsLoading(true)
        setShowModal(false)
        let taskId = taskInfo.task_id
        Task.write({
            recklesslySetUnpreparedArgs: [
                taskId,
                params,
                {
                    value: ethers.utils.parseEther("0")
                }
            ]
        })
    }

    const writeSuccess = async () => {
        modifyInfo.hash = Task.data.hash
        setModifInfo({...modifyInfo})
        await updateTask(modifyInfo)
        .then(res => {
            if(res.code == 0) {
                setIsLoading(false)
            }else{
                message.error(res.msg);
            }
        })
        await provider.getTransaction(Task.data.hash)
        .then(res => {
            setIsLoading(true)
            message.success(res.msg);
            setTimeout(() => {
                history.go(0)    
            }, 500);
        })
        .catch(err => {
            message.error(res.msg);
        })
    }

    const writeError = () => {
        setIsLoading(false)
    }

    useEffect(()=>{
        if (isConnected) {
            account = address;
            setAccount(account)
        }
    },[isConnected])


    useEffect(()=>{
        Task.data?.hash ? writeSuccess() : ""
    },[Task.data?.hash])

    useEffect(()=>{
        Task.error ? writeError() : ""
    },[Task.error])

    useUpdateEffect(()=>{
        initSkills()
        taskInfo?.role.map((ele)=>{
            skillss.map((e)=>{
                if ( e.title == ele ) {
                    e.status = true
                }
            })
        })
        setSkillss([...skillss])
    },[taskInfo])


    return <Modal
                footer={null}
                open={showModifyTaskModal}
                onCancel={()=>setShowModal(false)}
            >
        <div className="Modal_modifyTask">
            <p className="project-title">项目名称</p>
            <Input value={taskInfo?.title} onChange={(e)=>changeInfo('title',e.target.value)} />
            <p style={{marginTop:20}}>项目描述</p>
            <TextArea
                value={taskInfo?.desc}
                onChange={(e)=>changeInfo('desc',e.target.value)}
            ></TextArea>


            <Upload
                listType="picture"
                maxCount={1}
                name="file"
                onChange={uploadChange}
                customRequest={upload}
                
            >
                <Button style={{width: 472,height:50,marginTop:20}} icon={<FolderAddOutlined />}>上传项目需求文档（Word、Excel、PPT、PDF，20MB以内）</Button>
                <span>{taskInfo?.suffix}</span>
            </Upload>

            <p style={{marginTop:20}}>技能要求(最多六个)</p>
            {
                skillss.map((e,i)=>
                    <Button 
                        style={{marginBottom:10,marginRight:10}}
                        type={e.status ? 'primary':'text'} 
                        key={i}
                        onClick={()=>checkSkill(e,i)}
                    >
                        {e.title}
                    </Button>

                )
            }
            <p style={{marginTop:20}}>项目预算</p>
            <input 
                value={taskInfo?.budget} 
                onChange={(e)=>changeInfo('budget',e.target.value)}
                style={{width:350}} />
            <Select 
                style={{width:100}}
                value={taskInfo?.currency}
                onChange={(e)=>changeInfo('currency',e.target.value)}
                defaultValue={taskInfo?.currency}>
                <Option value={1}>ETH</Option>
                <Option value={2}>BTC</Option>
                <Option value={3}>USD</Option>
            </Select>
            <p style={{marginTop:20}}>项目周期</p>
            <Select 
                style={{width:450}}
                value={(taskInfo?.period/24/60/60).toString()}
                onChange={(e)=>changeInfo('period',e)}
                // defaultValue={(period/24/60/60).toString()}
                defaultValue={3}
            >
                <Option value="0">预计周期</Option>
                <Option value="3">3天</Option>
                <Option value="7">1周</Option>
                <Option value="21">3周</Option>
                <Option value="30">1个月</Option>
                <Option value="60">2个月</Option>
            </Select>
            <Button 
            type="primary" 
            style={{
                width:450,
                height:50,
                marginTop:20,
                fontSize:18
            }}
            onClick={modifyHandler}
            >
                确认修改
            </Button>
        </div>
    </Modal>
}



