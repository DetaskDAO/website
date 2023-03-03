const _data = require('../data/data.json')

const isCf = (arr, index) => {
    let flag = false;
    arr.map(e => {
        if (e.index === index) {
            flag = true
        }
    })
    return flag
}

export const deform_Skills = (role, skill) => {
    let arr = [];
    let newArr = [];
    for (let i = 0; i < role.length; i++) {
        
        for (let item1 = 0; item1 < skill?.length; item1++) {
            const e1 = skill[item1];
            if (e1.index === role[i]) {
                arr.push(e1);
            }

            if (e1.children) {
                for (let item2 = 0; item2 < e1.children.length; item2++) {
                    const e2 = e1.children[item2];
                    if (e2.index === role[i]) {
                        arr.push(e2);
                    }

                    if (e2.children) {
                        for (let item3 = 0; item3 < e2.children.length; item3++) {
                            const e3 = e2.children[item3];
                            if (e3.index === role[i]) {
                                arr.push(e3);
                            }
                        }
                    }
                }
            }
        }
    }
    arr.map((e,i) => {
        // 遍历
        if (!isCf(newArr, e.index)) {
            newArr.push(e)
        }
    })
    return newArr
}

export const deform_Count = (count,currency) => {
    if (currency === 'ETH') {
        count = count / Math.pow(10,18);
    }
    return count
}




// export const deform_ProjectTypes = (arr) => {
//     let newArr = []
//     arr.forEach(e => {
//         _data.projectTypes.forEach(ele => {
//             if (e === ele.value) {
//                 newArr.push(ele.name)
//             }
//         })
//     })
//     return newArr
// }