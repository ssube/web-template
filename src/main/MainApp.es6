import './main.less';
import templateMain from './main-template.hbs';
import Promise from 'bluebird';

export default class MainApp {
  constructor(params) {
    this._params = params;
  }

  get params() {
    return this._params;
  }

  render() {
    let el = this._params.el;
    el.empty();
    el.append(templateMain({
      welcome: this._params.welcome
    }));

    return Promise.resolve(this);
  }
}
