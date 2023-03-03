export const ChangeLanguage = () => {
    let url = location.search.replace('?','')
    if (url === 'zh_CN' || url === '') {
        return 'zh_CN'
    }
    if (url === 'en_US') {
        return url
    }
}