import { _decorator, Component, LabelComponent, Node, RichText } from 'cc';
import { gamemanager } from '../gamemanager';
const { ccclass, property } = _decorator;

@ccclass('bomb')
export class bomb extends Component {

    @property(RichText)
    bombCount:RichText = null;
    start() {
        //gamemanager.getInstance().node.on("onBombChange",this.onBombChange);
    }

    update(deltaTime: number) {
        
    }

    public onBombChange(count:number){
        let num = count ; 
        this.bombCount.string= "<color=#00ff00>x</color><color=#0fffff>"+num+"</color>";
    }
}


