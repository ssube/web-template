import $ from 'jquery';
import MainApp from './MainApp';

function merge(dest, ...src) {
  src.forEach(it => {
    Object.keys(it).forEach(key => {
      dest[key] = it[key];
    });
  });
  return dest;
}

export default function(conf) {
  let params = merge({el: $('.app-container')}, conf);

  new MainApp(params).render();
}
