
export function Sysmbol(params) {
    const chainName = process.env.NEXT_PUBLIC_DEVELOPMENT_CHAIN;
    const DeOrder = process.env.NEXT_PUBLIC_CONTRACT_DEORDER;
    const dUSDT = process.env.NEXT_PUBLIC_CONTRACT_USDC;
    // const WETH = process.env.NEXT_PUBLIC_CONTRACT_USDC;

    return { DeOrder, dUSDT}
}