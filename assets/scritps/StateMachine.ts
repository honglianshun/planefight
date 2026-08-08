import type { IState } from './IState';

/**
 * 轻量有限状态机
 * - 状态以单例形式传入,changeState 用引用相等做 no-op(替代 haveDead 等守卫)
 * - 计时器/标志由 owner 持有,状态类自身不保存可变状态(避免跨场景重载残留)
 */
export class StateMachine<T> {
    private _owner: T;
    private _current: IState<T> | null = null;

    constructor(owner: T) {
        this._owner = owner;
    }

    get current(): IState<T> | null {
        return this._current;
    }

    /** 设置初始状态,仅当当前无状态时生效,不触发 onExit */
    setInitial(state: IState<T>): void {
        if (this._current !== null) return;
        this._current = state;
        state.onEnter(this._owner);
    }

    /** 切换状态;若与当前状态为同一引用则 no-op */
    changeState(state: IState<T>): void {
        if (this._current === state) return;
        if (this._current) {
            this._current.onExit(this._owner);
        }
        this._current = state;
        state.onEnter(this._owner);
    }

    update(dt: number): void {
        try {
            if (this._current && this._owner && this._owner.node && this._owner.node.isValid) {
                this._current.onUpdate(this._owner, dt);
            }
        } catch (e) {
            console.error('Error in StateMachine update:', e);
            // 如果发生错误，尝试切换到安全状态
            if (this._current) {
                this._current.onExit(this._owner);
            }
            this._current = null;
        }
    }

    destroy(): void {
        if (this._current) {
            this._current.onExit(this._owner);
        }
        this._current = null;
        this._owner = null;
    }
}
