import {expect} from 'chai';
import MainApp from '../main/MainApp';

describe('main app', () => {
  it('should store params', () => {
    let params = {foo: 3};
    let app = new MainApp(params);
    expect(app.params).to.equal(params);
  });
});