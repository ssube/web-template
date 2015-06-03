import ExampleParams from './ExampleParams';

export default class ExampleUser {
  constructor(params = new ExampleParams()) {
    this._params = params;
  }
  
  get params() {
    return this._params;
  }
}