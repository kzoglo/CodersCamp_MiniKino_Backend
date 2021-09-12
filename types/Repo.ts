//TODO - think about more generic methods
export interface IRepo<T> {
  // exists(t: T): Promise<boolean>;
  // delete(t: T): Promise<any>;
  create(t: T): Promise<any>;
}
