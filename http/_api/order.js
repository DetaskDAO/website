import serviceAxios from "../index";

// 新建任务
export const createOrder = (data) => {
    return serviceAxios({
        url: `/order/createOrder`,
        method: "post",
        data,
    });
}

// 获取个人进行中的项目
export const getOrderList = (data) => {
    return serviceAxios({
        url: `/order/getOrderList?page=${data.page}&pageSize=${data.pageSize}&state=0${data.issuer ? '&issuer='+data.issuer : ''}${data.worker ? '&worker='+data.worker : ''}`,
        method: "get",
        data,
    });
}

// 获取个人结束的项目
export const getOrderFinish = (data) => {
    return serviceAxios({
        url: `/order/getOrderList?page=${data.page}&pageSize=${data.pageSize}&state=1${data.issuer ? '&issuer='+data.issuer : ''}${data.worker ? '&worker='+data.worker : ''}`,
        method: "get",
        data,
    });
}

// 获取个人结束的项目
export const getOrderUser = (data) => {
    return serviceAxios({
        url: `/order/getOrderList?page=${data.page}&pageSize=${data.pageSize}&state=1&progress=5${data.issuer ? '&issuer='+data.issuer : ''}${data.worker ? '&worker='+data.worker : ''}`,
        method: "get",
        data,
    });
}

// 获取任务详情
export const getOrderDetail = (data) => {
    return serviceAxios({
        url: `/order/getOrderList?order_id=${data.order_id}${data.issuer ? '&issuer='+data.issuer : ''}${data.worker ? '&worker='+data.worker : ''}`,
        method: "get",
        data,
    });
}

// 获取单个任务状态
export const getOrderMsg = (data) => {
    return serviceAxios({
        url: `/user/unReadMsgList?order_id=${data.order_id}&type=1`,
        method: "get",
        data
    })
}

// 阅读单个任务状态
export const readOrderMsg = (data) => {
    return serviceAxios({
        url: "/user/readMsg",
        method: "post",
        data
    })
}

// 更新阶段划分
export const updatedStage = (data) => {
    return serviceAxios({
        url: `/order/updatedStage`,
        method: "post",
        data,
    });
}

// 更新阶段划分
export const startOrder = (data) => {
    return serviceAxios({
        url: `/order/updatedProgress`,
        method: "post",
        data,
    });
}

// 删除任务
export const deleteOrder = (data) => {
    return serviceAxios({
        url: `/order/deleteOrder`,
        method: "post",
        data,
    });
}