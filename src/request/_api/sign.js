import serviceAxios from "../index";

// 获取nonce
export const getLoginMessage = (data) => {
    return serviceAxios({
        url: `/sign/getLoginMessage`,
        method: "post",
        data,
    });
}

// 登陆
export const authLoginSign = (data) => {
    return serviceAxios({
        url: `/sign/authLoginSign`,
        method: "post",
        data,
    });
}
