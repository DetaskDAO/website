
  export default (state = '', { type, payload }) => {
    switch (type) {
    //这个位置是改变数据的地方 ，暂时先不说，先看看怎么存取。后期补上怎么改变数据。
      case "change":
        return state = payload
      default:
        return state
    }
  }
  