/**
 * @jest-environment jsdom
 */

const u = require("../../helper/utility");

test('Test zip()', () => {
    expect(u.zip([[1, 2, 4, 5, 6], ["a", "b", "c", "d", "e"]])).toStrictEqual([[1, "a"], [2, "b"], [4, "c"], [5, "d"], [6, "e"]])
    expect(u.zip([[1], ["a"]])).toStrictEqual([[1, "a"]])
    expect(u.zip([[[1, 2], [3, 4]], [["a", "b"], ["c", "d"]]])).toStrictEqual([[[1, 2], ["a", "b"]], [[3, 4], ["c", "d"]]])
    expect(u.zip([[1, 2], ["a", "b"], ["!", "#"]])).toStrictEqual([[1, "a", "!"], [2, "b", "#"]])
});

test('Test Edge zip()', () => {
    expect(u.zip([[1, 2, 3], ["a"]])).toStrictEqual([[1, "a"], [2, undefined], [3, undefined]])
    expect(u.zip([[1], ["a", "b", "c"]])).toStrictEqual([[1, "a"]]) // Is this expected?
    expect(u.zip([[1, 2, 3]])).toStrictEqual([[1], [2], [3]])
    expect(u.zip([])).toStrictEqual([])
});

test('Test scaleToSize()', () => {
    expect(u.scaleToSize({width: 10, height: 10}, 10)).toStrictEqual({"height": 10, "scaleFactor": 1, "width": 10})
    expect(u.scaleToSize({width: 1000, height: 1000}, 10)).toStrictEqual({"height": 10, "scaleFactor": 0.01, "width": 10})
    expect(u.scaleToSize({width: 0.1, height: 1}, 10)).toStrictEqual({"height": 10, "scaleFactor": 10, "width": 1})
});

test('Test cutStringLength()', () => {
    expect(u.cutStringLength("TEST STRING", 5)).toStrictEqual("TEST ...")
    expect(u.cutStringLength("TEST STRING", 0)).toStrictEqual("...")
});