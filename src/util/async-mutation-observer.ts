
class AsyncMutationObserver extends Promise<MutationRecord[]> {
    observer: MutationObserver

    constructor() {
        let observer: MutationObserver;
        super(resolve => {
            observer = new MutationObserver(mutations => {
                resolve(mutations);
                observer.disconnect();
            })
        });
        this.observer = observer!;
    }

    observe(target: Node, options: MutationObserverInit) {
        return this.observer.observe(target, options);
    }

    disconnect() {
        return this.observer.disconnect();
    }
}
