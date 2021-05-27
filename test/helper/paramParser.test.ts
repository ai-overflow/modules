const p = require("../../helper/paramParser");
p.paramParser.input = { "a": 0, "b": "Hello World", "c": [1, 2, 3], "d": { "f": 0 }, "e": 99.99999 }

/********************
 * INPUT
********************/

test('Test Input', () => {
    expect(p.paramParser.parseParams("{{input.a}}")).toBe(0);
    expect(p.paramParser.parseParams("{{input.b}}")).toBe("Hello World");
    expect(p.paramParser.parseParams("{{input.c}}")).toStrictEqual([1, 2, 3]);
    expect(p.paramParser.parseParams("{{input.d}}")).toMatchObject({ "f": 0 });
    expect(p.paramParser.parseParams("{{input.e}}")).toBeCloseTo(99.99999);
});

test('Test Fail Input', () => {
    expect(p.paramParser.parseParams("input.a}}")).toBe("input.a}}");
    expect(p.paramParser.parseParams("{{input.a")).toBe("{{input.a");
    expect(p.paramParser.parseParams("{{input}}")).toBe("{{input}}");
    expect(p.paramParser.parseParams("{{input.}}")).toBe("{{input.}}");
    expect(p.paramParser.parseParams("{{input.  }}")).toBe("{{input.  }}");
    expect(p.paramParser.parseParams("{{input.zzz}}")).toBe("{{input.zzz}}");
    expect(p.paramParser.parseParams("{{input.__}}")).toBe("{{input.__}}");
});

test('Test Intermediate Input', () => {
    expect(p.paramParser.parseParams("Test {{input.a}} Test")).toBe("Test 0 Test");
    expect(p.paramParser.parseParams("Test {{input.b}} Test")).toBe("Test Hello World Test");
    expect(p.paramParser.parseParams("Test {{input.c}} Test")).toBe("Test 1,2,3 Test");
    expect(p.paramParser.parseParams("Test {{input.d}} Test")).toBe("Test [object Object] Test"); // This is expected, as we can't deserialize an Object...
    expect(p.paramParser.parseParams("Test {{input.e}} Test")).toBe("Test 99.99999 Test");
});

/********************
 * CONNECTION
********************/

test('Test Empty Response', () => {
    p.paramParser.connection = { "a": { success: true, value: {} } }

    expect(p.paramParser.parseParams("{{connection.a}}")).toMatchObject({});
});

test('Test Response', () => {
    p.paramParser.connection = { "a": { success: true, value: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" } }

    expect(p.paramParser.parseParams("{{connection.a}}")).toBe("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
});

test('Test Failed Response', () => {
    p.paramParser.connection = { "a": { success: false } }

    expect(p.paramParser.parseParams("{{connection.a}}")).toBe("FAILED REQUEST");
});

test('Test Missing Response', () => {
    p.paramParser.connection = {}

    expect(p.paramParser.parseParams("{{connection.a}}")).toBeUndefined();
    expect(p.paramParser.parseParams("{{connection}}")).toBe("{{connection}}");
    expect(p.paramParser.parseParams("{{connection.}}")).toBe("{{connection.}}");
    expect(p.paramParser.parseParams("{{connection.  }}")).toBe("{{connection.  }}");
});

test('Test Intermediate Response', () => {
    p.paramParser.connection = { "a": { success: true, value: "cake cake cake" }, "b": { success: true, value: "" }, };

    expect(p.paramParser.parseParams("Test {{connection.a}} TEST")).toBe("Test cake cake cake TEST");
    expect(p.paramParser.parseParams("Test {{connection.b}} TEST")).toBe("Test  TEST");
    expect(p.paramParser.parseParams("Test {{connection.UNDEFINED}} TEST")).toBe("Test {{connection.UNDEFINED}} TEST");
});

/********************
 * CMD
********************/

test('Test CMD.JSON', () => {
    p.paramParser.connection = {
        "a": { success: true, value: JSON.stringify([1, 2, 3]) },
        "b": { success: true, value: JSON.stringify({ "f": [1, 2, 3] }) },
        "c": { success: true, value: JSON.stringify({ "f": [{ "g": 1 }, { "g": 2 }, { "g": 3 }] }) },
        "d": { success: true, value: JSON.stringify({ "f": [{ "g": { "h": [1, 2, 3] } }] }) },
        "e": { success: true, value: JSON.stringify({ "f": [{ "g": [[1, 2, 3], [4, 5, 6]] }] }) },
        "f": { success: true, value: JSON.stringify({ "f": [[[1, 2, 3], [4, 5, 6]], [1, 2, 3]] }) },
        "g": { success: true, value: JSON.stringify([1, [2, 3]]) },
        "h": { success: true, value: JSON.stringify({"result": [{"proximity": 0}, {"proximity": 1}, {"proximity": 2}]}) },
    };

    expect(p.paramParser.parseParams("{{cmd.json(connection.a)}}")).toStrictEqual([1, 2, 3]);
    expect(p.paramParser.parseParams("{{cmd.json(connection.a[0])}}")).toStrictEqual(1);
    expect(p.paramParser.parseParams("{{cmd.json(connection.b/f)}}")).toStrictEqual([1, 2, 3]);
    expect(p.paramParser.parseParams("{{cmd.json(connection.b/f[0])}}")).toStrictEqual(1);
    expect(p.paramParser.parseParams("{{cmd.json(connection.c/f[0]/g)}}")).toStrictEqual(1);
    expect(p.paramParser.parseParams("{{cmd.json(connection.e/f[0]/g[1])}}")).toStrictEqual([4, 5, 6]);
    expect(p.paramParser.parseParams("{{cmd.json(connection.f/f[0][1])}}")).toStrictEqual([4, 5, 6]);
    expect(p.paramParser.parseParams("{{cmd.json(connection.g/[1]/[1])}}")).toStrictEqual(3);
    expect(p.paramParser.parseParams("{{cmd.json(connection.h/result[]/proximity)}}")).toStrictEqual([0, 1, 2]);
});

test('Test Fail JSON', () => {
    p.paramParser.connection = {
        "a": { success: false, value: JSON.stringify([1, 2, 3]) },
        "b": { success: true, value: JSON.stringify([0]) },
        "c": { success: true, value: JSON.stringify({"f": [0]}) },
    }

    expect(p.paramParser.parseParams("{{cmd.json(connection.a)}}")).toBe("FAILED REQUEST");
    expect(p.paramParser.parseParams("{{cmd.json(connection.b/f)}}")).toBe("Index error at: connection.b/f");
    expect(p.paramParser.parseParams("{{cmd.json(connection.b/f[]/g)}}")).toBe("Index error at: connection.b/f[]/g");
    expect(p.paramParser.parseParams("{{cmd.json(connection.b////)}}")).toBe("Out of Bounds: connection.b////");
    expect(p.paramParser.parseParams("{{cmd.json(connection.b/)}}")).toBe("Index error at: connection.b/");
});