export default class ExampleParams {
  _params:any;
  
  constructor(params:any) {
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