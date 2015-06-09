import $ from 'jquery';
import MainApp from './MainApp';

export default function(conf) {
  let params = Object.assign({el: $('.app-container')}, conf);

  new MainApp(params).render();
}
