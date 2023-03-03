import { Steps } from "antd";

export default function CustomStep(props) {

    const { list, size, status, current } = props;
    const { Step } = Steps;

    return (
        <Steps current={current} className="none-icon" status={status} size={size}>
            {
                list &&
                list.map((e,i) => 
                    <Step title={e} key={i} />
                )
            }
        </Steps>
    )
}