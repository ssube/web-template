/// reference path="../../DefinitelyTyped/chai/chai.d.ts"
/// reference path="../../DefinitelyTyped/mocha/mocha.d.ts"

import {expect} from 'chai';
import ExampleParams from '../main/ExampleParams';

describe('example params', () => {
  it('should be defined', () => {
    expect(ExampleParams).to.be.defined;
  });
});