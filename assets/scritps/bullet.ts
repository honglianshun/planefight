import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('bullet')
export class bullet extends Component {
    
    @property
    Speed:number = 10;
    
    
    start() {

    }

    update(deltaTime: number) {
        const position = this.node.position;
        this.node.setPosition(position.x,position.y+this.Speed*deltaTime,position.z);

        if(position.y> 500){
            this.node.destroy();
        }
    }
}


