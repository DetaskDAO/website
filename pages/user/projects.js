import { message, Pagination } from "antd";
import { useEffect, useRef, useState } from "react";
import { useAccount, useContractWrite } from 'wagmi'
import { useRouter } from 'next/router'
import { ConfigTask } from "../../src/controller";
import TaskItem from "../../components/CustomItem/TaskItem";

import qs from 'querystring';
import { hashPending, searchTask } from "@/request/_api/public";
import { deleteApply, getApplyList } from "@/request/_api/task";
import { getOrderFinish, getOrderList } from "@/request/_api/order";
import i18n from 'i18next';
import { useTranslation } from "react-i18next";
import { taskCurrency } from "@/utils/Currency";

export default function Userprojects() {

    const { t } = useTranslation("task");
    
    let [who,setWho] = useState();
    let [selectData,setSelectData] = useState([])
    let [selectBar,setSelectBar] = useState('')
    let [pageConfig,setPageConfig] = useState({
        page: 1, pageSize: 3, total: 1
    })
    let [isLoading,setIsLoading] = useState(false);
    let [skeletonHash, setSkeletonHash] = useState({});

    const { write: cancelWrite } = useContractWrite({
        ...ConfigTask("cancelApply"),
        onSuccess(data) {
            deleteApply({hash: data.hash})
            .then((res) => {
                if ( res.code == 0 ) {
                    message.success(res.msg)
                    history.go(0)
                }else{
                    message.error(res.msg)
                }
            })
            .catch(err => {
                console.log(err);
            })
        },
        onError(err) {
            console.log(err);
        }
    })

    const sidbar = {
        issuer: [
            {title: t("userproject.posted"), value: 'tasks'},
            {title: t("userproject.ongoing"), value: 'developping'},
            {title: t("userproject.closed"), value: 'developend'},
        ],
        worker: [
            {title: t("userproject.apply"), value: 'apply'},
            {title: t("userproject.ongoing"), value: 'developping'},
            {title: t("userproject.closed"), value: 'developend'},
        ] 
    };
    

    let [changeTaskInfo,setChangeTaskInfo] = useState()
    
    const router = useRouter()
    const { address } = useAccount();

    // 轮询
    let polling = useRef();

    const awaitRun = async() => {
        polling.current = setInterval(() => {
            hashPending({hash: skeletonHash?.hash})
            .then(res => {
                if (res.code === 0 && res.data === 2) {
                    // 解析成功
                    clearInterval(polling.current);
                    let arr = router.asPath.split('&');
                    let href = arr[0] + "&" + arr[1];
                    router.push(href);
                }
            })
        }, 1000);
    }

    const changeItem = value => {
        router.push(`/user/projects?w=${who}&bar=${value}`)
    }

    const init = () => {
        if (!address) {
            return
        }
        const { w, bar, hash } = qs.parse(location.search.slice(1));

        // 骨架屏显示位置 ==> bar 
        skeletonHash = {hash: hash, bar: bar};
        setSkeletonHash({...skeletonHash});
        if (w) {
            who = w;
            setWho(who);
                
            if (selectBar !== bar){
                selectData = [];
                setSelectData([...selectData]);
            }
            selectBar = bar ? bar : sidbar[who][0].value;
            setSelectBar(selectBar)
    
            pageConfig.page = 1;
            setPageConfig({...pageConfig});
        }
    }

    // 获取发布的需求
    const getTasks = () => {
        searchTask({...pageConfig, issuer: address})
        .then(res => {
            if (res.code === 0) {
                pageConfig.total = res.data.total;
                setPageConfig({...pageConfig});
                selectData = res.data.list ? res.data.list : [];
                selectData.map(e => {
                    e.currency = e.currency === 'USD' ? 'USDC' : e.currency;
                    e.budget = taskCurrency(e.currency, e.budget);
                })
                setSelectData([...selectData]);
            }
        })
    }

    // 获取报名的需求
    const getApplys = () => {
        getApplyList({
            ...pageConfig,
            apply_addr: address
        })
        .then(res => {
            const data = res.data.list;
            let arr = [];
            pageConfig.total = res.data.total;
            setPageConfig({...pageConfig});
            data.map(e => {
                e.task.currency = e.task.currency === 'USD' ? 'USDC' : e.task.currency;
                e.task.budget = taskCurrency(e.task.currency, e.task.budget);

                arr.push({...e.task, status: e.status});
            })
            selectData = arr;
            setSelectData([...selectData]);
        })
    }

    // 获取甲方正在进行中的任务
    const getDevelopping = (who) => {
        let obj = {...pageConfig, state: 0};
        obj[who] = address;
        getOrderList(obj)
        .then(res => {
            if (res.code === 0) {
                pageConfig.total = res.data.total;
                setPageConfig({...pageConfig});
                selectData = res.data.list ? res.data.list : [];
                setSelectData([...selectData]);
            }
        })
    }

    // 获取结束的任务
    const getDevelopend = (who) => {
        let obj = {...pageConfig};
        obj[who] = address;
        getOrderFinish(obj)
        .then(res => {
            if (res.code === 0) {
                pageConfig.total = res.data.total;
                setPageConfig({...pageConfig});
                selectData = res.data.list ? res.data.list : [];
                setSelectData([...selectData]);
            }
        })
    }

    const getData = () => {
        const { w } = qs.parse(location.search.slice(1));
        switch (selectBar) {
            case 'tasks':
                getTasks();
                break;
            case 'developping':
                getDevelopping(w);
                break;       
            case 'developend':
                getDevelopend(w);
                break;
            case 'apply':
                getApplys();
                break;
            default:
                break;
        }
    }

    // 骨架屏轮询
    useEffect(() => {
        if (skeletonHash?.hash) {
            awaitRun()
        }
    },[skeletonHash?.hash])


    useEffect(() => {
        getData()
    },[selectBar, pageConfig.page])

    useEffect(() => {
        init()
        getData()
    },[router])

    return (
        <div className="Userprojects">
            <div className="Userprojects-content">
                <div className="sidbar">
                    {
                        who &&
                        sidbar[who].map((e,i) => 
                            <div
                                key={i} 
                                className={`li ${selectBar === e.value ? 'active':''}`}
                                onClick={() => changeItem(e.value)}
                                >
                                <p>
                                    {e.title}
                                </p>
                            </div>)
                    }
                </div>
                <div className="content">
                    <TaskItem 
                        taskList={selectData} 
                        select={selectBar} 
                        who={who} 
                        skeletonHash={skeletonHash}
                        taskInfo={changeTaskInfo} 
                        setTaskInfo={setChangeTaskInfo} 
                        isLoading={isLoading} 

                        applyCancel={cancelWrite}
                    />
                    {
                        selectData.length > 0 &&
                        <Pagination
                            className='item-pagination' 
                            pageSize={pageConfig.pageSize} 
                            current={pageConfig.page}
                            total={pageConfig.total}
                            onChange={(e) => {pageConfig.page = e, setPageConfig({...pageConfig})}}
                        />
                    }
                </div>
            </div>
        </div>
    )
}
