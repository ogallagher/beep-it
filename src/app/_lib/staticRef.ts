export default class StaticRef<T> {
    public current: T

    constructor(value: T) {
        this.current = value
    }
}