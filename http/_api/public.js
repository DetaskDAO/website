import serviceAxios from "../index";


// 上传图片
export const upload = (data) => {
    return serviceAxios({
        url: process.env.NEXT_PUBLIC_DEVELOPMENT_UPLOAD ? process.env.NEXT_PUBLIC_DEVELOPMENT_UPLOAD : process.env.NEXT_PUBLIC_PRODUCTION_UPLOAD,
        method: "post",
        data,
    });
}

// 上传头像
export const uploadImage = (data) => {
    return serviceAxios({
        url: "/common/uploadImage",
        method: "post",
        data,
    });
}

export const getHash = (data) => {
    return serviceAxios({
        url: "/common/upload",
        method: "post",
        data,
    });
}




// 获取Task列表
export const searchTask = (data) => {
    return serviceAxios({
        url: `/task/getTaskList?page=${data.page}&pageSize=${data.pageSize}${data.role ? data.role : ''}${data.title ? '&title='+data.title : ''}${data.issuer ? '&issuer='+data.issuer : ''}${data.status ? '&status='+data.status : ''}`,
        method: "get",
        data,
    });
}

// 获取Task详情
export const searchTaskDetail = (data) => {
    return serviceAxios({
        url: `/task/getTaskList?${data.issuer ? '&issuer='+data.issuer : ''}${data.id ? '&id='+data.id : ''}${data.task_id ? '&task_id='+data.task_id : ''}`,
        method: "get",
        data,
    });
}

// 获取个人信息
export const getUserInfo = (data) => {
    return serviceAxios({
        url: `/user/getUserInfo?address=${data.address}`,
        method: "get",
        data,
    });
}

// 修改个人信息
export const updateUserInfo = (data) => {
    return serviceAxios({
        url: `/user/updateUserInfo`,
        method: "post",
        data,
    });
}

// 创建个人信息
export const createUserInfo = (data) => {
    return serviceAxios({
        url: `/user/createUserInfo`,
        method: "post",
        data,
    });
}

// 获取hash状态
export const hashPending = (data) => {
    return serviceAxios({
        url: `/common/hashPending?hash=${data.hash}`,
        method: "get",
        data,
    });
}

// 获取首页统计
export const statistics = (data) => {
    return serviceAxios({
        url: `/base/stats`,
        method: "get",
        data,
    });
}
