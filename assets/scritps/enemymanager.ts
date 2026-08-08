import { _decorator, AudioClip, Component, Input, input, instantiate, Node, Prefab } from 'cc';
import { enemy } from './enemy';
import { gamemanager } from './gamemanager';
import { audiomgr } from './audiomgr';
const { ccclass, property } = _decorator;

@ccclass('enemymanager')
export class enemymanager extends Component {
    
    
    private static instance:enemymanager = null;
    public static GetInstance():enemymanager{
        return this.instance;
    }
    @property
    enemy0SpawnRate:number = 1;
    @property(Prefab)
    enemy0Prefab:Prefab = null;

    
    @property
    enemy1SpawnRate:number = 3;
    @property(Prefab)
    enemy1Prefab:Prefab = null;

    @property
    enemy2SpawnRate:number = 10;
    @property(Prefab)
    enemy2Prefab:Prefab = null;

    @property
    rewardSpawnRate:number = 10;
    @property(Prefab)
    reward0Prefab:Prefab = null;
    @property(Prefab)
    reward1Prefab:Prefab = null;

    
    @property(AudioClip)
    useBombAudio:AudioClip = null;

    doubleClickInterval:number = 0.2;

    lastClickTime:number = 0;

    enemyArray:Node[] = [];
    private isSceneTransitioning: boolean = false;

    protected onLoad(): void {

        // 如果已存在实例，先销毁当前节点
        if (enemymanager.instance && enemymanager.instance !== this) {
             this.node.destroy();
            return;
        }

        // 确保敌人数组初始化
        this.enemyArray = [];
        this.lastClickTime = 0;
        input.on(Input.EventType.TOUCH_END,this.onTouchEnd,this)
        enemymanager.instance = this;
    }

    // 辅助方法：确保节点有 Sprite 组件
    private ensureSprite(node: Node): void {
        if (!node || !node.isValid) return;
        if (!node.getComponent('cc.Sprite')) {
            node.addComponent('cc.Sprite');
        }
    }

    public setSceneTransitioning(transitioning: boolean): void {
        this.isSceneTransitioning = transitioning;
    }

    start() {
        // 清空敌人数组，防止重新开始时残留
        this.enemyArray = [];
         this.schedule(this.enemy0Spawn, this.enemy0SpawnRate);
        this.schedule(this.enemy1Spawn, this.enemy1SpawnRate);
        this.schedule(this.enemy2Spawn, this.enemy2SpawnRate);
        this.schedule(this.rewardSpawn, this.rewardSpawnRate);
    }

    update(deltaTime: number) {
        
    }
    protected onDestroy(): void {
        this.unschedule(this.enemy0Spawn);
        this.unschedule(this.enemy1Spawn);
        this.unschedule(this.enemy2Spawn);
        this.unschedule(this.rewardSpawn);
        input.off(Input.EventType.TOUCH_END,this.onTouchEnd,this);

        // 清空敌人数组，防止内存泄漏
        if (this.enemyArray) {
             this.enemyArray = [];
        }

        // 清除单例引用
        if (enemymanager.instance === this) {
            enemymanager.instance = null;
        }
    }

        enemy0Spawn(){
        const enemy0 = instantiate(this.enemy0Prefab);
        this.node.addChild(enemy0);

        this.ensureSprite(enemy0);

        // -200 200
        const randomX = Math.ceil(Math.random() * 400) - 200;
        enemy0.setPosition(randomX,450,0);
        this.addEnemy(enemy0);
     }

    
    enemy1Spawn(){
        const enemy1 = instantiate(this.enemy1Prefab);
        this.node.addChild(enemy1);

        this.ensureSprite(enemy1);

        // -200 200
        const randomX = Math.ceil(Math.random() * 400) - 200;
        enemy1.setPosition(randomX,475,0);
        this.addEnemy(enemy1);

    }

    
    enemy2Spawn(){
        const enemy2 = instantiate(this.enemy2Prefab);
        this.node.addChild(enemy2);

        this.ensureSprite(enemy2);

        // -150 150
        const randomX = Math.ceil(Math.random() * 300) - 150;
        enemy2.setPosition(randomX,550,0);
        this.addEnemy(enemy2);

    }

    
    rewardSpawn(){
        const randomType = Math.floor(Math.random() * 2) ;
        let raward = null;
        if (randomType == 0){
            raward = instantiate(this.reward0Prefab);
        }else{
            raward = instantiate(this.reward1Prefab);
        }
        this.node.addChild(raward);

        this.ensureSprite(raward);

        // -200 215
        const randomX = Math.ceil(Math.random() * 400) - 200;
        raward.setPosition(randomX,474,0);

    }

    onTouchEnd(event){
        let currentTime = Date.now();
        let timeDiff = (currentTime - this.lastClickTime)/1000;

        if (timeDiff < this.doubleClickInterval){
            this.onDoubelClick(event);
        }
        this.lastClickTime = currentTime;
    }

    onDoubelClick(event){
        const gm = gamemanager.getInstance();
        if(!gm || gm.isHaveBomb()===false)return;

        // 检查敌人数组是否存在
        if (!this.enemyArray) {
           return;
        }

        // 创建副本，避免在迭代时修改原数组
        const enemiesCopy = [...this.enemyArray];
        for(let e of enemiesCopy){
            if (e && e.isValid) {
                const curenemy = e.getComponent(enemy);
                if (curenemy && curenemy.fsm) {
                    curenemy.killNow();
                }
            }
        }
        gm.useBomb();
        if (this.useBombAudio) {
            audiomgr.inst.playOneShot(this.useBombAudio);
        }
    }

    removeEnemy(n:Node){
       
        // 如果正在场景切换，不移除敌人
        if (this.isSceneTransitioning) {
             return;
        }

        if (!this.enemyArray || !n || !n.isValid) {
            return;
        }

        const index = this.enemyArray.indexOf(n);
        if (index!==-1){
            this.enemyArray.splice(index,1);
         }
    }

    // 安全地添加敌人到数组
    addEnemy(node: Node): void {
      
        // 如果正在场景切换，不添加敌人
        if (this.isSceneTransitioning) {
            return;
        }

        // 检查节点是否有效
        if (!node || !node.isValid) {
            return;
        }

        if (!this.enemyArray) {
            this.enemyArray = [];
        }

        this.enemyArray.push(node);
    }

}


