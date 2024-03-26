import serviceAxios from "../index";

// 创建需求 
export const createTask = (data) => {
    return serviceAxios({
        url: `/task/createTask`,
        method: "post",
        data,
    });
}

// 报名开关
export const modifyApplySwitch = (data) => {
    return serviceAxios({
        url: `/task/modifyApplySwitch`,
        method: 'post',
        data
    })
}

// 删除任务
export const deleteTask = (data) => {
    return serviceAxios({
        url: "/task/deleteTask",
        method: 'post',
        data
    })
}

// 修改需求
export const updateTask = (data) => {
    return serviceAxios({
        url: '/task/updatedTask',
        method: 'post',
        data
    })
} 

// 获取task报名列表
export const getApply = (data) => {
    return serviceAxios({
        url: `/apply/getApplyList?task_id=${data.task_id}`,
        method: "get",
        data,
    });
}

// 报名
export const createApply = (data) => {
    return serviceAxios({
        url: `/apply/createApply`,
        method: "post",
        data,
    });
}

// 取消报名
export const deleteApply = (data) => {
    return serviceAxios({
        url: `/apply/deleteApply`,
        method: 'post',
        data
    })
}

// 更新报名信息
export const updateApplyInfo = (data) => {
    return serviceAxios({
        url: `/apply/updatedApply`,
        method: 'post',
        data
    })
}

// 获取个人正在报名列表
export const getApplyList = (data) => {
    return serviceAxios({
        url: `/apply/getApply?page=${data.page}&pageSize=${data.pageSize}&apply_addr=${data.apply_addr}${data.status ? '&status='+data.status : ''}`,
        method: "get",
        data,
    });
}

// 修改列表排序
export const updatedApplySort = (data) => {
    return serviceAxios({
        url: `/apply/updatedApplySort`,
        method: "post",
        data,
    });
}

// 获取当前报名状态
export const getApplyStatus = (data) => {
    return serviceAxios({
        url: `/apply/getApply?page=1&pageSize=10&apply_addr=${data.address}&task_id=${data.task_id}`,
        method: "get",
        data,
    });
}

// 获取技能树   ==>     所有技能树
export const getSillTreeMap = (data) => {
    return serviceAxios({
        url: `/task/getSillTreeMap?id=0`,
        method: "get",
        data,
    });
}

