export class Timer {
    /**
     * diff 2 `Date` in Millisecond
     * @param {Date} since
     * @param {Date} until
     */
    static diff(since, until) {
        return (until.getTime() - since.getTime());
    }

    constructor() {
        /** time elapsed in millisecond */
        this.sum = 0;
        this.running = false;
        this.begin = new Date(0);
    }

    set(millisecond) {
        this.sum = Math.trunc(millisecond);
        if (this.running) {
            this.begin = new Date();
        }
    }

    offset(offset) {
        const target = this.get() + Math.trunc(offset);
        this.set(target);
    }

    get() {
        if (!this.running) return this.sum;
        return this.sum + Timer.diff(this.begin, new Date());
    }

    start() {
        if (!this.running) {
            this.running = true;
            this.begin = new Date();
        }
    }

    stop() {
        if (this.running) {
            this.running = false;
            this.sum += Timer.diff(this.begin, new Date());
        }
    }

    /** clear elapsed time, then start */
    clear() {
        this.sum = 0;
        this.running = true;
        this.begin = new Date();
    }

    /** clear elapsed time, but do __NOT__ start */
    reset() {
        this.sum = 0;
        this.running = false;
        this.begin = new Date(0);
    }
}
