import chai, {expect} from 'chai';
import './TestHelpers';
import MainApp from '../main/MainApp';

describe('main app', () => {
  it('should store params', () => {
    let params = {foo: 3};
    let app = new MainApp(params);
    expect(app.params).to.equal(params);
  });

  it('should return a promise from render', () => {
    let el = {empty: () => {}, append: () => {}};
    let params = {foo: 3, el};
    let app = new MainApp(params);
    return expect(app.render()).to.eventually.equal(app);
  });

  it('should empty and append the element while rendering', () => {
    let el = {empty: chai.spy(), append: chai.spy()};
    let params = {foo: 3, el};
    let app = new MainApp(params);
    return app.render().then(() => {
      expect(el.empty).to.have.been.called;
      expect(el.append).to.have.been.called;
    });
  });
});
