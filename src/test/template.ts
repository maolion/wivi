import { expect } from 'chai';

import {
  buildTemplate,
  format
} from '../template';

import parse from '../template/parser';

describe('template: parse(...)', () => {
  it(`parse('')`, () => {
    let result = parse('');

    expect(result.template)
      .to.be.equal('');
    expect(result.parsedTemplate.indexOf('return'))
      .to.be.equal(0);
    expect(result.defaultValue)
      .to.be.equal('');
    expect(Object.keys(result.statementMapping).length)
      .to.be.equal(0);
    expect(result.identifiers)
      .to.be.equal(undefined);
  });

  it(`parse('hello')`, () => {
    let result = parse('hello');

    expect(result.template)
      .to.be.equal('hello');
    expect(result.parsedTemplate.indexOf('return'))
      .to.be.equal(0);
    expect(result.defaultValue).to.be.equal('');
    expect(Object.keys(result.statementMapping).length)
      .to.be.equal(0);
    expect(result.identifiers)
      .to.be.equal(undefined);
  });

  it(`parse('hello, {name}')`, () => {
    let result = parse('hello, {name}');

    expect(Object.keys(result.statementMapping).length)
      .to.be.equal(1);
  });

  it(`parse('[{Date.now()}] hello, {firstName + ' ' + middleName} {lastName + ', bye~'}', '', true)`, () => {
    let result = parse('[{Date.now()}] hello, {firstName + \' \' + middleName} {lastName + \', bye~\'}', '', true);
    let result2 = parse('[{Date.now()}] hello, {firstName + \' \' + middleName} {lastName + \', bye~\'}', '');
    let result3 = parse('[{Date.now()}] hello, {firstName + \' \' + middleName} {lastName + \', bye~\'}', '', true);

    expect((result === result2) && (result === result3))
      .to.be.equal(true);
    expect(Object.keys(result.statementMapping).length)
      .to.be.equal(3);
    expect(typeof result.identifiers)
      .to.be.equal('object');

    if (result.identifiers) {
      expect(result.identifiers.join(' '))
        .to.be.equal('Date firstName middleName lastName');
    }
  });
});

describe('template: format(...)', () => {
  it(`format('', {})`, () => {
    expect(format('', {}))
      .to.be.equal('');
  });

  it(`format('hello', {})`, () => {
    expect(format('hello', {}))
      .to.be.equal('hello');
  });

  it(`format('hello, {name}', { name: 'lion' })`, () => {
    expect(format('hello, {name}', { name: 'lion' }))
      .to.be.equal('hello, lion');
  });

  it(`format('hello, {firstName} {lastName}!', { firstName: 'Eavii', lastName: 'Jiang' })`, () => {
    expect(format('hello, {firstName} {lastName}!', { firstName: 'Eavii', lastName: 'Jiang' }))
      .to.be.equal('hello, Eavii Jiang!');
  });

  it(`format('hello\' "{name}". "end\'"', { name: 'lion' })`, () => {
    expect(format('hello\' "{name}". "end\'"', { name: 'lion' }))
      .to.be.equal('hello\' "lion". "end\'"');
  });

  it(`format('hello\' "{name}"', { })`, () => {
    try {
      format('hello\' "{name}"', { });
    } catch (e) {
      return;
    }

    throw new Error(`format('hello\' "{name}"', { })`);
  });
});

describe('template: buildTemplate(...)', () => {
  it(`buildTemplate('')`, () => {
    let template = buildTemplate('');

    expect(template({}))
      .to.be.equal('');
  });

  it(`buildTemplate('hello, {name}')`, () => {
    let template = buildTemplate('hello, {name}');

    expect(template({ name: 'lion' }))
      .to.be.equal('hello, lion');

    expect(template({ name: 'xxxx' }))
      .to.be.equal('hello, xxxx');
  });

  it(`buildTemplate('[{Date.now()}] hello, {user.name}')`, () => {
    let template = buildTemplate('[{Date.now()}] hello, {user.name}');

    expect(/^\[\d+\] hello, lion$/.test(template({ user: { name: 'lion' }, Date })))
      .to.be.equal(true);
  });

  it(`buildTemplate('hello, {name}', '...')`, () => {
    let template = buildTemplate('hello, {name}', '...');

    expect(template({ }))
      .to.be.equal('hello, ...');

    expect(template({ }, 'E.T.'))
      .to.be.equal('hello, E.T.');
  });

});
