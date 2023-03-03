import BigNumber from "bignumber.js";


export function Permit2Nonce(nonce, nonceBitmap) {

    // const wordPos = nonce >> 8;
    const bitPos = nonce % 256;

    const bit = 1 << bitPos;
    const flipped = nonceBitmap ^= bit;
    if ((flipped & bit) == 0) {
        return false;
    }else{
        return true;
    }
}

export function BigNumberRandom() {
    const random = BigNumber.random(18).toString();
    const newRandom = parseInt(random.toString().split('.')[1])

    return newRandom
}

export function NonceBitmap(newRandom) {
    const permit2Nonce = parseInt(newRandom / Math.pow(2, 8));

    return permit2Nonce
}