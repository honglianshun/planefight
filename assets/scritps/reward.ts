import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum RewardType{
    TwoShoot,
    Bomb
}
@ccclass('reward')
export class reward extends Component {
    @property
    speed:number = 300;

    
    @property
    rewardtype:RewardType = RewardType.TwoShoot;


    start() {

    }

    update(deltaTime: number) {
        const p = this.node.position;
        this.node.setPosition(p.x,p.y-this.speed*deltaTime, p.z);
       
        if(this.node.position.y<-500){
            this.node.destroy();
        } 
    }
}


