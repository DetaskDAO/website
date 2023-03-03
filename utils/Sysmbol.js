
export function Sysmbol(params) {
    const chainName = process.env.NEXT_PUBLIC_DEVELOPMENT_CHAIN;
    const DeOrder = require(`../../deployments/${chainName}/DeOrder.json`).address;
    const dUSDT = require(`../../deployments/${chainName}/dUSDT.json`).address;
    const WETH = require(`../../deployments/${chainName}/WETH.json`).address;

    return { DeOrder, dUSDT, WETH}
}