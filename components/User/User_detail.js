import { useAccount } from 'wagmi';
import axios from "axios";
import { useEffect, useState } from 'react';
import { 
    Button,
    Modal,
    Input,
    message,
    Upload,
    Image
 } from 'antd';
import {
    WechatOutlined,
    SkypeOutlined,
    GithubOutlined,
    CameraOutlined
  } from '@ant-design/icons';
// import { useSetState } from 'ahooks';
import Identicon, { IdenticonOptions } from "identicon.js";

import { getUserInfo, createUserInfo, updateUserInfo } from '../../http/_api/user.js'
import { HashAvatar } from '../../utils/HashAvatar.js';

export default function User_detail () {
    const _data = require("../../data/data.json")

    let [hasInfo,setHasInfo] = useState(false)
    let [info,setInfo] = useState({})

    let [skills,setSkills] = useState([])
    let [wagmi,setWagmi] = useState({});
    let [avatar,setAvatar] = useState();
    let [activeLabel,setActiveLabel] = useState('allNFTs');

    const [isModalVisible, setIsModalVisible] = useState(false);

    const { address, isConnected } = useAccount()

    const showModal = () => {
      setIsModalVisible(true);
    };
  
    const handleCancel = () => {
      setIsModalVisible(false);
    };

    const checkSkill = (e,i)=>{
        e.status = !e.status
        skills.map((ele,index)=>{
            if (!info.role) {
                info.role = []
                if(index === i){
                    ele = e
                    if(e.status && info.role.length < 4){
                        info.role.push(Number(e.value))
                    }else{
                        info.role = info.role.filter(item => item != e.value)
                        e.status = false
                    }
                }
            }else{
                if(index === i){
                    ele = e
                    if(e.status && info.role.length < 4){
                        info.role.push(Number(e.value))
                    }else{
                        info.role = info.role.filter(item => item != e.value)
                        e.status = false
                    }
                }
            }
        })
        setSkills([...skills])
        setInfo({...info,role:[...info.role]})
    }

    const saveHanler = ()=>{
        let userinfo = {
            username:info.username,
            telegram:info.telegram,
            wechat:info.wechat,
            skype:info.skype,
            discord: info.discord,
            phone: info.phone,
            address,
            role:info.role ? info.role : [],
            avatar: info.avatar
        }
        console.log(userinfo);
        if(hasInfo){
            updateUserInfo(userinfo)
            .then(res => {
                message.success(res.msg)

                setTimeout(() => {
                    history.go(0)
                }, 500);
            })
        }else{
            createUserInfo(userinfo)
            .then(res=>{
                message.success(res.msg)
                setTimeout(() => {
                    history.go(0)
                },500)
            })
        }
        
    }

    const changeAvatar = () => {
        console.log('更换头像');
    }

    const getInfo = async () => {
        await getUserInfo({address: address})
        .then((res)=>{
            console.log('个人信息====>',res);
            if (res.data) {
                let obj = res.data
                info = obj;
                setInfo({...info});
                if(res.code === 0){
                    setHasInfo(true)
                }
            }
        })
    }

    // 初始化技能列表
    const initSkills = () => {
        let arr = []
        _data.skills.map((e,i)=>{
            if (i > 0) {
                arr.push({title: e.name, status: false, value: e.value})
            }
        })
        skills = arr
        setSkills([...skills])
    }

    // 上传头像
    const avatarChange = (files) => {
        let res = files.file.response
        if (res?.code == 0) {
            info.avatar = res.data.url
            setInfo({...info})
        }
    }

    const checkLabel = (ele) => {
        activeLabel = ele;
        setActiveLabel(activeLabel);
    }


    useEffect(()=>{
        initSkills()
        getInfo()
    },[])

    useEffect(()=>{
        if(info.role){
            info.role.map((e,i)=>{
                skills.map((ele,index)=>{
                    if(e == ele.value){
                        ele.status = true
                    }
                })
            })
        }
        setSkills([...skills])
    },[info.role])

    useEffect(()=>{
        if(isConnected){
            wagmi = {
                isActive: isConnected
            }
        }else{
            wagmi = {
                isActive: isConnected
            }
        }
        setWagmi({...wagmi})

    },[isConnected])

    //用户设置了头像时更新头像路径
    useEffect(()=>{
        if (info.avatar) {
            avatar = `http://192.168.1.10:8086/${info.avatar}`
            setAvatar(avatar)
        }
    },[info])

    return <div className="MyInfo">
    <div className='myInfo-data'>
        <div className="myInfo-top">
            <div className="top">
                <div className="img">
                    {
                        wagmi.isActive && address ? 
                        <img src={avatar?avatar:HashAvatar(address)} alt="" />
                        :
                        ""
                    }
                </div>
                <div className="info">
                    <p>{info.username?info.username:"未设置用户昵称"}</p>
                    <div className="li">
                        {info.telegram ? <img src='/icon/telegram.png' width={20} height={20} /> : ''}
                        {info.skype ? <img src='/icon/skype.png' width={20} height={20} /> : ''}
                        {info.wechat ? <img src='/icon/wechat.png' width={20} height={20} /> : ''}
                        {info.discord ? <img src='icon/discord.png' width={20} height={20} /> : ''}
                        {info.phone ? <img src='icon/phone.png' width={20} height={20} /> : ''}
                    </div>
                </div>
            </div>
        </div>
        <div className="myInfo-bottom">
            <p className="bg">擅长技能</p>
            {
                skills.map((e,i)=>(
                    e.status ? <span className='role-list' key={i}>{e.title}</span> : ''
                ))
            }
            <Button className="btn" onClick={showModal}>编辑个人资料</Button>
        </div>
        <div className='myInfo-NFTs'>
            <div className={`myInfo-NFTs-all ${activeLabel === 'allNFTs' ? 'active' : ''}`} onClick={()=>checkLabel('allNFTs')}>
                <div className='allNFTs-title'> 
                    <div className='allNFTs-icon'></div>
                    <span className='NFTs-all-text NFTs-text'>ALL NFTs</span>
                </div>
            </div>
            <div className='myInfo-NFTs-detask'>
                <p className='NFTs-detask-title NFTs-title'>Detask NFT</p>
                <div className='NFTs-detask-list'>
                    <div className={`NFTs-detask ${activeLabel == 'YugaLabs' ? 'active' : ''}`} onClick={()=>checkLabel('YugaLabs')}>
                        <div className='detask-icon'>

                        </div>
                        <span className='detask-text NFTs-text'>YugaLabs</span>

                    </div>
                </div>
            </div>
            <div className='NFTs-collections'>
                <p className='NFTs-collections-title NFTs-title'>My Collections</p>
                <div className='NFTs-collections-list'>
                    <div className={`collections-item ${activeLabel == 'collectionsYu' ? 'active' : ''}`} onClick={()=>checkLabel('collectionsYu')}>
                        <div className='item-icon'>

                        </div>
                        <span className='item-text NFTs-text'>YugaLabs</span>
                    </div>
                    <div className={`collections-item ${activeLabel == 'collectionsLooki' ? 'active' : ''}`} onClick={()=>checkLabel('collectionsLooki')}>
                        <div className='item-icon'>

                        </div>
                        <span className='item-text NFTs-text'>Looki</span>
                    </div>
                    <div className={`collections-item ${activeLabel == 'collectionsENS' ? 'active' : ''}`} onClick={()=>checkLabel('collectionsENS')}>
                        <div className='item-icon'>

                        </div>
                        <span className='item-text NFTs-text'>ENS：Ethereum N…</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Modal title="修改资料" className="Modify_personal_information" footer={null} open={isModalVisible} onCancel={handleCancel}>
        <div className="avatar" onClick={changeAvatar}>
            <Upload
                name='file'
                listType='picture-card'
                showUploadList='false'
                onChange={avatarChange}
                action='http://192.168.1.10:8086/common/uploadImage'
                >
                <span>更换头像</span>

                <CameraOutlined className='camera' />
            </Upload>
        </div>
        <div className="box">
            <p className="title">姓名*</p>
            <div className="inners">
                <div className="inner">
                    <Input 
                        type="text" 
                        placeholder="name"
                        defaultValue={info.username}
                        onChange={(e)=>setInfo({...info,username:e.target.value})} 
                    />
                </div>
            </div>
        </div>
        <div className="box">
            <p className="title"> 社交账号(至少一个)*</p>
            <div className="inners">
                <div className="inner">
                    <Input 
                        type="text" 
                        placeholder='Telegram'
                        defaultValue={info.telegram}
                        onChange={(e)=>setInfo({...info,telegram:e.target.value})}
                    />
                </div>
                <div className="inner">
                    <Input 
                        type="text" 
                        placeholder='WeChat' 
                        defaultValue={info.wechat}
                        onChange={(e)=>setInfo({...info,wechat:e.target.value})}
                    />
                </div>
                
                <div className="inner">
                    <Input 
                        type="text" 
                        placeholder='Skype' 
                        defaultValue={info.skype}
                        onChange={(e)=>setInfo({...info,skype:e.target.value})}
                    />
                </div>

                <div className="inner">
                    <Input 
                        type="text" 
                        placeholder='discord' 
                        defaultValue={info.discord}
                        onChange={(e)=>setInfo({...info,discord:e.target.value})}
                    />
                </div>

                <div className="inner">
                    <Input 
                        type="text" 
                        placeholder='phone' 
                        defaultValue={info.phone}
                        onChange={(e)=>setInfo({...info,phone:e.target.value})}
                    />
                </div>
            </div>
        </div>
        <div className="box">
            <p className="title">你擅长的技能*</p>
            <div className="list">
                {
                    skills.map((e,i) => 
                        <div 
                            key={i} 
                            className={`li ${e.status ? 'active':''}`}
                            onClick={()=>checkSkill(e,i)}
                        >
                            {e.title}
                        </div>
                    )
                }
            </div>
        </div>
        <Button className="btn" onClick={() => saveHanler()}>保存</Button>
    </Modal>
</div>
}

