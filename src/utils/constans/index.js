import { getJwt } from "../GetJwt";

export const constans = () => {


    const subStringAddr = (addr) => {
        return addr.substring(0,5) + "..." + addr.substring(38,42)
    }

    const getToken = () => {
        let token = localStorage.getItem('detask.token');
        if (!token || !getJwt(token)) {
            return null
        }else{
            return token
            
        }
    }


    return {
        subStringAddr,
        getToken
    }
}