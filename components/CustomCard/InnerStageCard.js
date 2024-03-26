import { Button, Tabs } from "antd";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import StageInner from "../CustomItem/StageInner";
import OutputStageCard from "./OutputStageCard";



export default function InnerStageCard(params) {
    

    const { defaultAmount, getInner, dataStages, edit, setIsChange, token, currency, order } = params;

    const { t } = useTranslation("task");
    const [activeKey, setActiveKey] = useState();    //  当前选中标签
    let [items,setItems] = useState([]);    //  tabs
    let [inner,setInner] = useState({});    //  参数
    let [viewModel,setViewModel] = useState(false);    //  展示模式
    let [dataViewModel, setDataViewModel] = useState(false);       //   data展示模式

    // 子组件修改时更新当前组建inner
    const changeInner = (obj) => {
        setInner({...obj});

        // console.log('inner 修改 ===>',obj);
    }

    // 添加tabs
    const add = () => {
        if (setIsChange) {
            setIsChange(true);  //  确认修改返回上层 ==> agree ==> 修改阶段划分
        }
        const index = items.length + 1;

        // 收集各阶段参数
        inner[`item-${index}`] = {
            name: '', period: '', amount: '', desc: ''
        }
        setInner({...inner})
        setItems([
          ...items,
          {
            label: `P ${index}`,
            children: <StageInner 
                        defaultAmount={defaultAmount} 
                        currency={currency}
                        index={`item-${index}`}
                        inner={inner}
                        setInner={changeInner} 
                        setViewModel={setViewModel}     //  修改展示模式
                        setDataViewModel={setDataViewModel}     //  修改data展示模式
                      />,
            key: `item-${index}`,
          },
        ]);
        setActiveKey(`item-${index}`)
        setDataViewModel(true);

    };

    // 移除tabs
    const remove = (targetKey) => {
        if (setIsChange) {
            setIsChange(true);  //  确认修改返回上层 ==> agree ==> 修改阶段划分
        }
        items.map((e,i) => {
            if (e.key === targetKey) {
                items.splice(i,1);
                delete inner[targetKey];
            }
        })
        items.map((e,i) => {
            e.key = `item-${i+1}`;
            e.label = `P ${i+1}`;
        })
        // inner重新排序
        let obj = {};
        let num = 1;
        for (const i in inner) {
            obj[`item-${num}`] = inner[i];
            num++;
        }
        setItems([...items]);
        inner = obj;
        setInner({...inner});
        setActiveKey(`item-${items.length}`)
        setDataViewModel(true);
    };

    // tabs事件处理
    const onEdit = (targetKey, action) => {
        if (action === 'add') {
          add();
        } else {
          remove(targetKey);
        }
    };

    // 切换tab
    const onChange = (key) => {
        setViewModel(false);
        setDataViewModel(true);
        setActiveKey(key);
    }

    // 切换模式
    const toggleModel = () => {
        add();
        setViewModel(false);
    }

    // 监听inner改变 ==> 返回给上一级
    useEffect(() => {
        const lastInner = items[items.length-1]?.children.props.inner;
        if (order?.signature && lastInner) {
            if (items.length === Object.keys(lastInner).length) {
                // console.log('对应');
            }else{
                // console.log('不对应');
                // console.log(Object.keys(lastInner));
                delete lastInner[Object.keys(lastInner).pop()];
                // console.log(lastInner);
            }
        }
        getInner(items[items.length-1]?.children.props.inner)
    },[inner])

    useEffect(() => {
        if (dataStages) {
            let arr = [];
            dataStages.map((e,i) => {
                if (e.period !== 0) {
                    const newIndex = dataStages[0].period === 0 ? i : i + 1
                    inner[`item-${newIndex}`] = { ...e };
                    setInner({...inner});
                    arr.push({
                        label: `P ${newIndex}`,
                        children: <StageInner 
                                    defaultAmount={defaultAmount} 
                                    index={`item-${newIndex}`}
                                    inner={inner}
                                    setInner={changeInner} 
                                    setViewModel={setViewModel}     //  修改展示模式
                                    setDataViewModel={setDataViewModel}     //  修改data展示模式
                                />,
                        key: `item-${newIndex}`,
                    })
                }
            })
            items = arr;
            setItems([...items]);
        }
    },[dataStages])

    useEffect(() => {
        dataViewModel && setIsChange && setIsChange(true)      //  确认修改返回上层 ==> agree ==> 修改阶段划分
    },[dataViewModel])

    return <>
        {
            items.length === 0 &&
            <div style={{marginTop: "100px"}}>
                <Button className="btn-add mb60" onClick={add}>{t("order.btn-add")}</Button>
            </div>
        }
        {
            items.length > 0 && !viewModel && !dataStages &&
            <Tabs 
                type="editable-card" 
                className="tabs" 
                items={items} 
                onEdit={onEdit} 
                activeKey={activeKey}
                onChange={onChange}
            /> 
        }
        {
            items.length > 0 && viewModel && !dataStages &&
            <div className="stageList">
            <OutputStageCard edit={onChange} remove={remove} cache={inner} token={token} />
            <Button className="btn-add mb60" onClick={() => toggleModel()}>{t("order.btn-add")}</Button>
            </div>
        }
        {
            items.length > 0 && dataStages &&
            <div className="stageList">
            {
                !dataViewModel ? 
                <OutputStageCard edit={onChange} remove={remove} cache={inner} isEdit={edit} token={token} />
                :
                <Tabs 
                    type="editable-card" 
                    className="tabs" 
                    items={items} 
                    onEdit={onEdit} 
                    activeKey={activeKey}
                    onChange={onChange}
                /> 
            }
            {
                edit === 'block' &&
                <Button className="btn-add mb60" onClick={() => toggleModel()}>{t("order.btn-add")}</Button>
            }
            </div>
        }
    </>
}