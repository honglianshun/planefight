import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('startui')
export class startui extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }
    public onStartButtonClick(){
        director.loadScene("game02")
    }
}


