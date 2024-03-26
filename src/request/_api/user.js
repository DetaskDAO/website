import serviceAxios from "../index";


// 获取个人资料
export const getUserInfo = (data) => {
    console.log('api ==> ',data);
    return serviceAxios({
        url: `/user/getUserInfo?address=${data.address}`,
        method: "get",
        data
    })
}

// 创建个人资料
export const createUserInfo = (data) => {
    return serviceAxios({
        url: "/user/createUserInfo",
        method: "post",
        data
    })
}

// 修改个人资料
export const updateUserInfo = (data) => {
    return serviceAxios({
        url: "/user/updateUserInfo",
        method: "post",
        data
    })
}

// 获取个人消息
export const msgList = (data) => {
    return serviceAxios({
        url: `/user/msgList?page=${data.page}&pageSize=${data.pageSize}`,
        method: "get",
        data
    })
}

// 阅读消息
export const readMsg = (data) => {
    return serviceAxios({
        url: "/user/readMsg",
        method: "post",
        data
    })
}

// 获取个人未读消息
export const unReadMsgList = (data) => {
    return serviceAxios({
        url: `/user/unReadMsgList`,
        method: "get",
        data
    })
}
