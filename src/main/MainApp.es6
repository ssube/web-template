import style from './main.less';

style; // "Use" the style variable

export default class MainApp {
  constructor(params) {
    this._params = params;
  }

  get params() {
    return this._params;
  }
}
