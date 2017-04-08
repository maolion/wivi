import { HashMap } from '../types';

const templateStatementRegex = /\{([^\}]+)\}/g;
const conflictStatementStartFlagRegx = /\\\{/g;
const conflictStatementEndFlagRegx = /\\\}/g;
const singleQuoteRegx = /(?=[^\\]|^)'/g;
const quoteWrapStringRegx = /[^\\](["']).*?[^\\]\1/g;
const identifierRegex = /(?:[\s\[\(]|^)((?:\$|[^\s\d`!-\/:-\@\[-^\{-~])[^\s`!-\/:-\@\[-^\{-~]*)/g;

let cache: {
  template: string;
  parsedTemplate: string;
  defaultValue: string;
  statementMapping: HashMap<string>;
  identifiers: string[] | undefined;
};

/** 将模板代码简单转换成可执行的 js代码 */
export default function parse(template: string, defaultValue = '', needParseIdentifiers = false) {
  if (!template) {
    return {
      template,
      defaultValue,
      parsedTemplate: 'return \'\'',
      statementMapping: {},
      identifiers: undefined
    };
  }

  // 如果解析数据与最近一次的解析数据一样，就返缓存的解析结果
  if (cache &&
      cache.template.length === template.length &&
      cache.template === template &&
      cache.defaultValue === defaultValue
  ) {
    if (needParseIdentifiers && cache.identifiers === undefined) {
      cache.identifiers = parseIdentifiers(Object.keys(cache.statementMapping));
    }

    return cache;
  }

  let parsedTemplate = 'return \'';
  let match: any;
  let statementMapping: HashMap<string> = {};
  let lastIndex = 0;

  templateStatementRegex.lastIndex = 0;
  template = resolveConflictStatementFlags(template);

  while (true) {
    match = templateStatementRegex.exec(template);

    if (!match) {
      break;
    }

    let tplStatement = match[1].trim();

    parsedTemplate += escapeSingleQuoute(template.substr(lastIndex, match.index - lastIndex));

    lastIndex = templateStatementRegex.lastIndex;

    if (!tplStatement) {
      continue;
    }

    let statement;

    // 相同 pattern 做一次 字符串拼接处理
    if (statementMapping.hasOwnProperty(tplStatement)) {
      statement = statementMapping[tplStatement];
    } else {
      statement = `' + ((${tplStatement}) || '${defaultValue}') + '`;
      statementMapping[tplStatement] = statement;
    }

    parsedTemplate += statement;
  }

  parsedTemplate += `${escapeSingleQuoute(template.substr(lastIndex))}\'`;

  return cache = {
    template,
    defaultValue,
    parsedTemplate,
    statementMapping,
    identifiers: needParseIdentifiers ? parseIdentifiers(Object.keys(statementMapping)) : undefined
  };
}

/** 解析语句中所有的变量标识符 */
function parseIdentifiers(statements: string[]) {
  let identifiers: string[] = [];

  for (let statement of statements) {
    let match: RegExpExecArray | null;

    // 删除语句中的字符串
    statement = statement.replace(quoteWrapStringRegx, '');

    while (true) {
      match = identifierRegex.exec(statement);

      if (!match) {
        break;
      }

      identifiers.push(match[1]);
    }
  }

  return identifiers;
}

/** 将 \{ 或 \} 这些 可能会干扰到 模板字符串结果的的字符 替换成 unicode */
function resolveConflictStatementFlags(template: string) {
    if (!template) {
        return template;
    }

    return template = template
        .replace(conflictStatementStartFlagRegx, '\\x7b')
        .replace(conflictStatementEndFlagRegx, '\\x7d');
}

/** 单引号转义处理 */
function escapeSingleQuoute(str: string) {
  if (!str) {
    return str;
  }

  return str.replace(singleQuoteRegx, '\\\'');
}
