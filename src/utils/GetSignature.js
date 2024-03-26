import { authLoginSign, getLoginMessage } from "@/request/_api/sign";

export async function GetSignature(params) {
    
    const { address, signer } = params;
    let message;

    // 1、获取nonce
    await getLoginMessage({address: address})
    .then(res => {
        if (res.code === 0) {
            message = res.data.loginMessage;
        }
    })
    // 2、获取签名
    await signer.signMessage(message)
    .then(res => {
        // 3、获取token
        authLoginSign({
            address: address,
            message: message,
            signature: res
        })
        .then(res => {
            if (res.code === 0) {
                localStorage.setItem('detask.token', res.data.token)

            }
        })
    })
    .catch(err => {
        console.log(err);
    })

}