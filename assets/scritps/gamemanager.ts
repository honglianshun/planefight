import { _decorator, AudioClip, Component, director, Node, sys } from 'cc';
import { bomb } from './UI/bomb';
import { score } from './UI/score';
import { player } from './player';
import { gameover } from './UI/gameover';
import { audiomgr } from './audiomgr';
import { enemymanager } from './enemymanager';
const { ccclass, property } = _decorator;

@ccclass('gamemanager')
export class gamemanager extends Component {

    private static instance:gamemanager;

    public static getInstance():gamemanager{
        return this.instance;
    }

    @property
    private bombCount:number = 0;
    @property(bomb)
    bombUI:bomb = null;

    
    @property(score)
    scoreUI:score = null;

    @property(player)
    player:player = null;

    @property(Node)
    pauseButtonNode:Node = null;
    @property(Node)
    resumeButtonNode:Node = null;

    @property(gameover)
    gameoverUI:gameover=null;

    @property(AudioClip)
    gameBgMusic:AudioClip = null;

    
    @property(AudioClip)
    gameOverAudio:AudioClip = null;

    
    @property(AudioClip)
    buttonAudio:AudioClip = null;

    private score:number = 0;

    protected onLoad(): void {
        // 检查当前场景是否已经有GameManager实例
        const existingInstance = gamemanager.instance;
        if (existingInstance && existingInstance.node && existingInstance.node.isValid) {
           this.node.destroy();
            return;
        }

        gamemanager.instance = this;

        if (this.scoreUI) {
            this.scoreUI.onScoreChange(this.score);
        }
    }

    protected start(): void {
        if (this.gameBgMusic) {
            audiomgr.inst.play(this.gameBgMusic, 0.2);
        }
    }

    public addBomb(){
        this.bombCount += 1;
        this.bombUI.onBombChange(this.bombCount);
    }
    public getBombNumber():number{
        return this.bombCount;
    }

    public addScore(s:number){
        this.score += s;
        this.scoreUI.onScoreChange(this.score);
    }
    
    public onPauseButton(){
        director.pause();
        this.player.setCanControl(false);
        this.pauseButtonNode.active = false;
        this.resumeButtonNode.active = true;
        audiomgr.inst.playOneShot(this.buttonAudio,0.5);
        audiomgr.inst.pause();
    }

    public onResumeButton(){
        director.resume();
        this.player.setCanControl(true);
        this.pauseButtonNode.active = true;
        this.resumeButtonNode.active = false;
        audiomgr.inst.playOneShot(this.buttonAudio,0.5);
        audiomgr.inst.resume();
    }

    public onGameOver(){
        director.pause();
        this.gameoverUI.node.active = true;

        let hScore:string =  localStorage.getItem("HighScore");
        let hScoreInt:number = 0;
        if (hScore){
            hScoreInt = parseInt(hScore,10);
        }
        if (this.score >hScoreInt){
            //hScoreInt = this.score;
            localStorage.setItem("HighScore",this.score.toString());
        }
        this.gameoverUI.updateHighScore(hScoreInt);
        this.gameoverUI.updateNowScore(this.score);
        audiomgr.inst.playOneShot(this.gameOverAudio,1);
        audiomgr.inst.pause();
    }

    public onReStartButtonClick(){
        // 设置场景切换标志
        const em = enemymanager.GetInstance();
        if (em) {
            em.setSceneTransitioning(true);
        }


        try {
            // 先停止所有音频
            audiomgr.inst.stop();

            // 重置游戏数据
            this.score = 0;
            this.bombCount = 0;

            // 直接加载游戏场景
            director.loadScene("game02", (err) => {
                if (err) {
                    console.error('Failed to load game02 scene:', err);
                    return;
                }

                // 确保游戏恢复运行
                if (director.isPaused) {
                    director.resume();
                }

                // 恢复音频
                audiomgr.inst.resume();

                // 播放音效
                if (this.buttonAudio) {
                    audiomgr.inst.playOneShot(this.buttonAudio, 0.5);
                }

                // 延迟清除场景切换标志
                this.scheduleOnce(() => {
                    if (em) {
                        em.setSceneTransitioning(false);
                    }
                }, 0.5);
            });
        } catch (e) {
            console.error('Error in restart process:', e);
        }
    }

    public onQuitButtonClick(){
        // 退出游戏，返回到主菜单
        director.loadScene("main");
        audiomgr.inst.stop();
    }

    
    public isHaveBomb(){
        return this.bombCount > 0 ;
    }

    public useBomb(){
        this.bombCount -=1;
        this.bombUI.onBombChange(this.bombCount);
    }

}


