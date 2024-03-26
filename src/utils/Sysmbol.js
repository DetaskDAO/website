export function Sysmbol(params) {
    const chainName = process.env.NEXT_PUBLIC_DEVELOPMENT_CHAIN;
    const DeOrder = process.env.NEXT_PUBLIC_CONTRACT_DEORDER;
    const dUSDT = process.env.NEXT_PUBLIC_CONTRACT_USDC;
    const Builder = require(`../deployments/${chainName}/BuilderSBT.json`).address;
    const Issuer = require(`../deployments/${chainName}/IssuerSBT.json`).address;

    return { DeOrder, dUSDT, Builder, Issuer}
}