import { Button } from "antd";
import Computing_time from "../Computing_time";


export default function navbar(params) {
 
    const { data } = params;
    

    return <div className="content-nav">
    <div className="nav-left">
        <div className="img">

        </div>
        <div className="info">
            <p className="title">{data.title}</p>
            <div className='time'>
                <img className='time-icon' src='/clock-white.jpg' />
                <Computing_time create_time={data.create_time} />
            </div>
            <p className="skills">
                    Recruitment type： {
                    data.role.map((e,i) => <span key={i}>{e}</span> )
                } 
            </p>
        </div>
    </div>
    {
        isApply ? 
        <div className='applyed-btns'>
            <Button className='applyed-inspect' onClick={()=>setIsModalOpen(true)}>Registration information</Button>
            <Button className='applyed-cancel' onClick={celApply}>Cancel registration</Button>
        </div> 
        :
        <Button className="btn" onClick={showModal}>Go to register</Button>
    }
</div>
}