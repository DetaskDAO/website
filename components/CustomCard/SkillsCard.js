import { message, Popover } from "antd";
import { useEffect, useState } from "react";
import { deform_Skills } from "../../utils/Deform";


export default function SkillsCard(params) {
    
    const { stree, value ,setValue, defaultValue } = params;
    let [selectItem,setSelectItem] = useState([]);
    let [tree1,setTree1] = useState([]);
    let [tree2,setTree2] = useState([]);
    const [open, setOpen] = useState(false);

    const handleOpenChange = (newOpen) => {
      setOpen(newOpen);
    };

    const outPrint = (e) => {
        return location.pathname.indexOf("/zh") === -1 ? 
        e.en
        :
        e.zh
    }

    const changeTree1 = (e) => {
        checkItem(e)
        if (e.children) {
            tree1 = e.children;
        }else{
            tree1 = [];
        }
        setTree1([...tree1]);
        setTree2([...[]]);
    }

    const changeTree2 = (e) => {
        checkItem(e)
        if (e.children) {
            tree2 = e.children;
        }else{
            tree2 = [];
        }
        setTree2([...tree2]);
    }

    const checkItem = (e) => {
        // max显示
        if (!e.checked && selectItem.length === 4) {
            // message.warning('最多可选4个')
            return
        }
        e.checked = e.checked ? false : true;
        let flag = true;
        selectItem.map((ele,index) => {
            if (ele.id === e.id) {
                selectItem.splice(index,1);
                flag = false;
            }
        })
        if (flag) {
            selectItem.push({
                en: e.en,
                zh: e.zh,
                id: e.id,
                index: e.index
            });
        }
        setSelectItem([...selectItem]);
    }

    const removeSelectItem = (e) => {
        selectItem.map((ele,index) => {
            if (ele.id === e.id) {
                selectItem.splice(index,1)
            }
        })
        console.log("stree ==>",stree);
        stree.map(item1 => {
            if (e.id === item1.id) {
                item1.checked = !item1.checked;
            }
            // 第二层
            item1.children && item1.children.map(item2 => {
                if (e.id === item2.id) {
                    item2.checked = !item2.checked;
                }
                // 第三层
                item2.children && item2.children.map(item3 => {
                    if (e.id === item3.id) {
                        item3.checked = !item3.checked;
                    }
                })
            })
        })

        setSelectItem([...selectItem]);
    }

    const init = () => {
        for (let i = 0; i < defaultValue.length; i++) {
            stree.map(item1 => {
                if (defaultValue[i] == item1.index) {
                    item1.checked = !item1.checked;
                }
                // 第二层
                item1.children && item1.children.map(item2 => {
                    if (defaultValue[i] == item2.index) {
                        item2.checked = !item2.checked;
                    }
                    // 第三层
                    item2.children && item2.children.map(item3 => {
                        if (defaultValue[i] == item3.index) {
                            item3.checked = !item3.checked;
                        }
                    })
                })
            })
            
        }
        selectItem = deform_Skills(defaultValue, stree);
        setSelectItem([...selectItem]);
    }

    useEffect(() => {
        let obj = JSON.stringify(selectItem);
        value.list = JSON.parse(obj);
        setValue({...value});
    },[selectItem])

    useEffect(() => {
        if (defaultValue) {
            init()
        }
    },[stree])

    const panel = <div className="tree">
        <ul>
            {
                stree.map(e => 
                    <li 
                        key={e.id}
                        onClick={()=>changeTree1(e)}
                        className={e.checked ? 'active':''}
                    >{outPrint(e)}</li>
                )
            }
        </ul>
        <ul>
            {
                tree1.map(e => 
                    <li 
                        key={e.id}
                        className={e.checked ? 'active':''}
                        onClick={()=>changeTree2(e)}
                    >{outPrint(e)}</li>
                )
            }
        </ul>
        <ul>
            {
                tree2.map(e => 
                    <li 
                        key={e.id}
                        className={e.checked ? 'active':''}
                        onClick={()=>checkItem(e)}
                    >{outPrint(e)}</li>
                )
            }
        </ul>
    </div>

    return <div className="skillsCard">

        <Popover
            overlayClassName="Tree"
            placement="bottomLeft"
            content={panel}
            trigger="click"
            open={open}
            onOpenChange={handleOpenChange}
            >
            <div className="inner">
                {
                    selectItem.map(e => 
                        <p key={e.id} className="checkItem" onClick={() => removeSelectItem(e)}>
                            {outPrint(e)}
                        </p>
                    )
                }
            </div>
        </Popover>
    </div>
}