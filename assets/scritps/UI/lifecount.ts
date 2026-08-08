import { _decorator, Component, LabelComponent, Node, RichText } from 'cc';
import { gamemanager } from '../gamemanager';
const { ccclass, property } = _decorator;

@ccclass('lifecount')
export class lifecount extends Component {

    @property(RichText)
    lifeCount:RichText = null;
    start() {
        //gamemanager.getInstance().node.on("onBombChange",this.onBombChange);
    }

    update(deltaTime: number) {
        
    }

    public onLifeChange(count:number){
        this.lifeCount.string= "<color=#00ff00>x</color><color=#0fffff>"+count+"</color>";
    }
}


