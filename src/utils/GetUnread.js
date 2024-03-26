import { unReadMsgList } from "@/request/_api/user";
import { getJwt } from "./GetJwt";
import store from '@/redux/store';

export const getUnreadMsg = async() => {

    const token = localStorage.getItem(`detask.token`);
    if (!token) {
        return
    }else{
        // 判断token有效期
        const status = getJwt(token);
        if (!status) {
            return
        }
    }
    // console.log(local);
    unReadMsgList()
      .then(res => {
          if (res.code === 0 && res.data.list.length > 0) {
            // redux修改
            store.dispatch({
              type: 'change',
              payload: 'unread'
            })
            // console.log('有未读信息');
          }
          else{
            store.dispatch({
              type: 'change',
              payload: 'read'
            })
          }
      })
}

