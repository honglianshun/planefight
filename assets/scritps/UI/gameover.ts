import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('gameover')
export class gameover extends Component {
    
    @property(Label)
    highScore:Label = null ;

    @property(Label)
    nowScore:Label = null ;
    
    
    start() {

    }

    update(deltaTime: number) {
        
    }

    public updateHighScore(score:number){
        this.highScore.string = score.toString();
    }

    
    public updateNowScore(score:number){
        this.nowScore.string = score.toString();
    }

    public onReStart(){

    }

    public onQuit(){

    }
}


