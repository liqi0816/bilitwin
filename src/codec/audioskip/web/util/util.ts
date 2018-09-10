function getAllCombinations<T>(array: ArrayLike<T>) {
    const a = Array.from(array);
    const ret = [] as T[][];
    for (let i = 0; i < (1 << a.length); i++) {
        ret.push(a.filter((_, j) => (i >> j) & 1))
    }
    return ret;
}

export { getAllCombinations }
