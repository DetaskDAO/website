import { ethers } from "ethers";
import { Sysmbol } from "./Sysmbol";


export function Currency(token, value) {
    value = `${value}`
    let newValue;
    switch (token) {
        case Sysmbol().dUSDT:
            newValue = Number(value) * Math.pow(10,6);
            break;

        case ethers.constants.AddressZero:
            newValue = ethers.utils.parseEther(`${value}`);
            break;
    
        default:
            break;
    }
    return newValue
}

export function ConvertToken(token, value) {
    let newValue;
    switch (token) {
        case Sysmbol().dUSDT:
            newValue = value / Math.pow(10,6);
            break;
    
        case ethers.constants.AddressZero:
            newValue = value / Math.pow(10,18);
            break;

        default:
            break;
    }
    return newValue
}

export function ConvertTokenAddress(tokenAddress) {
    let token;
    switch (tokenAddress) {
        case Sysmbol().dUSDT:
            token = "USDT";
            break;
    
        case ethers.constants.AddressZero:
            token = "MATIC";
            break;

        default:
            break;
    }
    return token
}


export function CurrencyMin(token) {
    switch (token) {
        case Sysmbol().dUSDT:
            return 0.000001;
        case ethers.constants.AddressZero:
            return 0.000000000000000001;
        default:
            break;
    }
}

export function taskCurrencyValue(token, value) {
    value = `${value}`
    let newValue;
    switch (token) {
        case 'MATIC':
            newValue = ethers.utils.parseEther(`${value}`);
            break;
        case 'USDT':
            newValue = Number(value) * Math.pow(10,6);
            break;
        default:
            break;
    }
    return newValue
}

export function taskCurrencyName(index) {
    switch (index) {
        case 4:
            return 'MATIC';
        case 1:
            return 'USDT';
        default:
            break;
    }
}

export function taskCurrency(token, amount) {
    switch (token) {
        case 'MATIC':
            return amount / Math.pow(10,18);
        case 'USDT':
            return amount / Math.pow(10,6);
        default:
            break;
    }
}

export function taskCurrencyNameV(name) {
    switch (name) {
        case 'MATIC':
            return 4;
        case 'USDT':
            return 1;
        default:
            break;
    }
}