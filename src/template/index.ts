import parse from './parser';

// 原理是，把字符串模板 简单转换成可执行的js代码，然后把会被使用到的数据对象的属性标识符，添加
// 到这段js代码运行上下文中(下面实现是在函数参数申明位置)
//
// format("hello, {name}", { name: "lion" })
// 上面的调用，简单编译后的js代码会像下面这样
// (new Function('name', 'return ("hello, " + name)'))('lion');

/**
 * 编译一个字符串模板，并返回可多次填充模块数据的可执行函数
 *
 * @example
 * var templte = buildTemplate(`hello, {name}`);
 * templte({ name: 'lion' }); // hello, lion
 * templte({ name: 'xxxx' }); // hello, xxxx
 */
export function buildTemplate(template: string, defaultValue = '') {
  let parseResult = parse(template, defaultValue, true);
  let paramKeys = parseResult.identifiers || [];

  let func = Function.bind.apply(Function, [ '' ].concat(paramKeys, parseResult.parsedTemplate));

  let formatFunc = new func();

  return (data: any, defVal = '') => {
    let paramValues = [];

    defVal = defVal || defaultValue;

    for (let i = 0, l = paramKeys.length; i < l; i++) {
      let key = paramKeys[i];
      let value = data.hasOwnProperty(key) ? data[key] : defVal;
      paramValues.push(value);
    }

    return formatFunc.apply(undefined, paramValues);
  };
}

/**
 * 将数据填充到模板中，并返回填充后的最终字符串结果
 *
 * @example
 * format(`{1+1}`, {}); // 2
 * format(`{1 + n}`, { n: 2 }); // 3
 * format(`{a} + {b} = {a + b}`, { a: 1, : b: 2 }); // 1 + 2 = 3
 */
export function format(template: string, data: any, defaultValue = '') {
  if (!template) {
    return '';
  }

  let paramKeys: any[] = [ undefined ];
  let paramValues: string[] = [];

  for (let key of Object.keys(data)) {
    paramKeys.push(key);
    paramValues.push(data[key]);
  }

  let func = Function.bind.apply(Function, paramKeys.concat(
    parse(template, defaultValue).parsedTemplate
  ));

  return (new func()).apply(undefined, paramValues);
}
