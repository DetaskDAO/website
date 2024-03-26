import { useEffect } from "react";
import { useRouter } from "next/router";
// antd
import { Layout } from "antd";
const { Header, Footer, Content } = Layout;
// redux
import store from "@/redux/store";
// utils
import { getUnreadMsg } from "@/utils/GetUnread";
import { detectZoom, zoom } from "@/utils/DetectZoom";
// Internationalization
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';


const headerStyle = {
    width: "100%",
    zIndex: 999,
    position: "fixed"
}

const contentStyle = {
    minHeight: "calc(100vh - 445px)"
}

const DefaultLayout = ({ children }) => {

    const router = useRouter();
    
    useEffect(() => {
        zoom(detectZoom());
    },[])

    useEffect(() => {
        getUnreadMsg();
        // let lang = localize('').split('/')[1];
        // store.dispatch({
        //     type: 'setLang',
        //     payload: lang
        // })
    },[router])
    
    return (
        <Layout>
            <Header 
                style={headerStyle}
                className="style-none"
            >
                <AppHeader />
            </Header>
            <Content 
                style={contentStyle}
            >
                { children }
            </Content>
            <Footer 
                className="style-none"
            >
                <AppFooter />
            </Footer>
        </Layout>
    );
};

export default DefaultLayout;
