/** 通用状态接口:所有状态行为由 owner 持有可变数据,状态本身无状态 */
export interface IState<T> {
    onEnter(owner: T): void;
    onUpdate(owner: T, dt: number): void;
    onExit(owner: T): void;
}
