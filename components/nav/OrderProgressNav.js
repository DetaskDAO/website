


export default function OrderProgressNav(params) {
    
    const { progress, who } = params;


    const print = () => {
        if (!params) {
            return
        }
        switch (progress) {
            case 0:
                printUnSetstage();      //  返回未设置阶段
                break;
            case 1:
                printSetstage()
                break;
            case 2:
                printSetStage()
                break;
            default:
                break;

        }
    }

    return <>
        
    </>
}