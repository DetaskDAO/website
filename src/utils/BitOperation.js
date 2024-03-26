export const BitOperation = (arr) => {
    // 移位运算 << 12
    let num = 0;
    arr.forEach((ele,index) => {
        num += ele * Math.pow(2, ( arr.length - (index + 1) ) * 12)
    })
    return num
}