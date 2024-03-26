export const getDate = (params, type) => {
    var date = new Date(params);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    let h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours() + ':'; 
    let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    let s = date.getSeconds();
    switch (type) {
        case 'd':
            return Y+M+D;
        case 'm':
            return Y+M+D+h+m;
        case 's':
            return Y+M+D+h+m+s;
        case 'y':
            return Y;
        default:
            return '';
    }
}