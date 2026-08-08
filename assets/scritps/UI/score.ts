import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('score')

export class score extends Component {
     @property(Label)
    score:Label = null;
    start() {

    }

    public onScoreChange(count:number){
        this.score.string = "得分："+count;
    }
}


