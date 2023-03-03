import { Input, Empty, Button,Pagination } from 'antd';
import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi';
import Computing_time from '../components/Computing_time';

import { deform_Skills } from '../utils/Deform'
import { searchTask } from '../http/_api/public';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getSillTreeMap } from '../http/_api/task';
import { taskCurrency } from '../utils/Currency';

export default function Projects() {

    const { t } = useTranslation("task");
    const { address } = useAccount()
    const router = useRouter();

    let [skill, setSkill] = useState([]);
    let [skillItem1, setSkillItem1] = useState([]);
    let [skillItem2, setSkillItem2] = useState([]);
    let [item2Title, setItem2Title] = useState({});
    let [item1Title, setItem1Title] = useState({});
    let [select, setSelect] = useState([]);
    let [lang, setLang] = useState('en');

    let [projects,setProjects] = useState([]);
    let [title,setTitle] = useState();
    let [pageConfig,setPageConfig] = useState({
        page: 1, pageSize: 10, total: 1
    })

    // 跳转
    const goProject = (id) => {
        let flag = false;
        projects.map(e=>{
            if(e.task_id === id && e.issuer === address) {
                router.push(`/applylist?task_id=${id}`)
                flag = true;
            }
        })
        if (flag) {
            return
        }
        router.push(`/task/${id}`)
    }

    // 获取Tasklist
    const getTask = () => {
        let str = "";
        if (select.length > 0) {            
            select.map(e => {
                str+= "&role="+e.index
            })
        }
        searchTask({
            ...pageConfig,
            role: str,
            title: title,
            status: 102  // 新建成功
        })
        .then(res => {
            if (res.code === 0) {
                let data = res.data.list
                console.log('init ==>',res.data);
                if(data){
                    data.map(e => {
                        console.log(e);
                        e.currency = e.currency === 'USD' ? 'USDT' : e.currency;
                        e.budget = taskCurrency(e.currency, e.budget);
                        e.role = deform_Skills(e.role, skill);
                        
                    })
                    projects = data;
                }else{
                    projects = [];
                }
                console.log(projects);
                setProjects([...projects]);
                pageConfig.total = res.data.total;
                setPageConfig({...pageConfig});
            }
        })
    }

    const getTaskTitle = (e) => {
        title = e;
        setTitle(title);
    }

    // 防抖
    const { run } = useRequest(getTaskTitle, {
        debounceWait: 300,
        manual: true
    });

    const checkItem = (e) => {
        // 去重
        for (let i = 0; i < select.length; i++) {
            if (select[i].id === e.id) {
                select.splice(i,1)
                setSelect([...select]);
                return
            }
        }
        select.push(e);
        setSelect([...select]);
    }

    const getSkill1 = (e) => {
        checkItem(e);
        skillItem1 = e.children ? e.children : [];
        setSkillItem1([...skillItem1]);
        item1Title = e;
        setItem1Title({...item1Title});

        setSkillItem2([]);

        e.status = !e.status;
        setSkill([...skill]);
    }

    const getSkill2 = (e) => {
        checkItem(e);
        skillItem2 = e.children ? e.children : [];
        setSkillItem2([...skillItem2]);
        item2Title = e;
        setItem2Title({...item2Title});

        e.status = !e.status;
        setSkillItem1([...skillItem1]);
    }

    const checkItem2 = (e) => {
        checkItem(e);
        e.status = !e.status;
        setSkillItem2([...skillItem2]);
    }

    const removeItem = (e) => {
        select.map((ele,index) => {
            if (ele.id === e.id) {
                select.splice(index,1)
                setSelect([...select]);
            }
        })

        skill.map(item1 => {
            if (e.id === item1.id) {
                item1.status = !item1.status;
            }
            // 第二层
            item1.children && item1.children.map(item2 => {
                if (e.id === item2.id) {
                    item2.status = !item2.status;
                }
                // 第三层
                item2.children && item2.children.map(item3 => {
                    if (e.id === item3.id) {
                        item3.status = !item3.status;
                    }
                })
            })
        })
        setSkill([...skill]);
        // setSelect([...select])
    }

    const removeAll = () => {
        select = [];
        setSelect([...select]);

        skill.map(item1 => {
            item1.status = false;
            // 第二层
            item1.children && item1.children.map(item2 => {
                item2.status = false;
                // 第三层
                item2.children && item2.children.map(item3 => {
                    item3.status = false;
                })
            })
        })
        setSkill([...skill]);
    }

    const panel = <>
        <div className="tags-list">
            <div 
                className={`tags-li ${select.length === 0 ? "tags-li-active" : ""}`}
                onClick={() => removeAll()}
            >
                {t("all")}
            </div>
            {
                skill.map((e,i) => 
                    <div 
                        key={i} 
                        className={`tags-li ${e.status ? "tags-li-active" : ""}`}
                        onClick={() => getSkill1(e)}
                    >
                        {
                            lang === "en" ? 
                            e.en
                            :
                            e.zh
                        }
                    </div>
                )
            }
        </div>
        {
            skillItem1.length > 0 &&
            <div className="tags-pro">
                <p className="title">
                    {
                        lang === "en" ? 
                        item1Title.en
                        :
                        item1Title.zh
                    }
                </p>
                <div className="tags-list">
                    {
                        skillItem1.map((e,i) => 
                            <div 
                                key={i} 
                                className={`tags-li ${e.status ? "tags-li-active" : ""}`}
                                onClick={() => getSkill2(e)}
                            >
                                {
                                    lang === "en" ? 
                                    e.en
                                    :
                                    e.zh
                                }
                            </div>
                        )
                    }
                </div>
            </div>
        }
        {
            skillItem2.length > 0 &&
            <div className="tags-pro">
                <p className="title">
                    {
                        lang === "en" ? 
                        item2Title.en
                        :
                        item2Title.zh
                    }
                </p>
                <div className="tags-list">
                    {
                        skillItem2.map((e,i) => 
                            <div 
                                key={i} 
                                className={`tags-li ${e.status ? "tags-li-active" : ""}`}
                                onClick={() => checkItem2(e)}
                            >
                                {
                                    lang === "en" ? 
                                    e.en
                                    :
                                    e.zh
                                }
                            </div>
                        )
                    }
                </div>
            </div>
        }
    </>

    const init = async() => {
        // 获取技能树
        await getSillTreeMap()
        .then(res => {
            if (res.code === 0) {
                skill = res.data;
                setSkill([...skill]);
            }
        })

        lang = location.pathname.indexOf("/zh") === -1 ? "en" : "zh";
        setLang(lang);
        getTask()
    }

    useEffect(() => {
        getTask()
    },[select, title, pageConfig.page])
    
    useEffect(() => {
        init()
    },[])

    return <div className="Projects">
        <div className='banner'>
            <div className='banner-content'>
            </div>
        </div>
        <div className="content">
        <div className='task-content'>
            <div className="search">
                <Input placeholder={t("search")} onChange={(e)=>run(e.target.value)} />
                {/* <SearchOutlined className="search-btn" onClick={() => searchData()} /> */}
                <div className="tags">
                    <div className='tags-keyword'>{t("filter")}</div>
                    <div className="tags-select">
                        {
                            select.map((e,i) => 
                                <div className='item' key={i} onClick={() => removeItem(e)}>
                                    {
                                        lang === "en" ? 
                                        e.en
                                        :
                                        e.zh
                                    }
                                    <div className="close">
                                        <img src="/icon/remove.png" alt="" />
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    {panel}
                </div>
            </div>
            <div className="items">
                {
                    projects.map((e,i) => 
                        <div key={i} className="item" onClick={() => goProject(e.task_id)}>
                            <div className="info">
                                <div className="info-img">
                                    
                                </div>
                                <div className="info-detail">
                                    <p className="title">{e.title}</p>
                                    <div className='time'>
                                        <div className='time-about'>
                                            <img className='time-icon' src='/clock.jpg' />
                                            <Computing_time create_time={e.created_at} />
                                        </div>
                                        <span className="date">{t("task.period")}: &nbsp;{e.period / 60 / 60 / 24}&nbsp;day</span>
                                    </div>
                                    {
                                        skill.length > 0 &&
                                        <div className="tags">
                                            <p className='tags-title'>{t("task.skill")}: </p>
                                            {
                                                e.role.map((ele,index) => 
                                                    <span className='tags-li' key={index}>
                                                        {
                                                            location.pathname.indexOf("/zh") === -1 ? 
                                                            ele.en
                                                            :
                                                            ele.zh
                                                        }
                                                    </span>
                                                )
                                            }
                                        </div>
                                    }
                                </div>
                                <div className="price">
                                    <p>
                                        {
                                            e.budget == 0 ? 
                                            <span className='price-cost' style={{fontSize: "12px"}}>{t("task.quotation")}</span>
                                            :
                                            <>
                                            <span className='price-cost'>{t("task.amount")}:</span> 
                                            <span className='price-num'>{e.budget}&nbsp;{e.currency}</span>
                                            </>
                                        }
                                    </p>
                                </div>
                                <div className='item-btn'>
                                    <Button className='btn'>{t("btn-view")}</Button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {
                    projects.length === 0 ? 
                    <Empty />
                    :
                    ''
                }
                <Pagination 
                    className='item-pagination' 
                    pageSize={pageConfig.pageSize} 
                    current={pageConfig.page}
                    total={pageConfig.total}
                    onChange={(e) => {pageConfig.page = e, setPageConfig({...pageConfig})}}
                />
            </div>
        </div>
        </div>
    </div>
}

export async function getStaticProps({ locale }) {
    return {
      props: {
        ...(await serverSideTranslations(locale)),
      },
    };
}