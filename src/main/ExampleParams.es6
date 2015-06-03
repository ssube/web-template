export default class ExampleParams {
  constructor(params) {
    this._params = params;
  }

  get params() {
    return this._params;
  }

  print() {
    Object.keys(this._params).forEach(it => {
      console.log(it, this._params[it]);
    });
  }
}
