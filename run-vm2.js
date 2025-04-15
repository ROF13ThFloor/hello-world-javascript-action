const { VM } = require('vm2');
const fs = require('fs');
const path = require('path');
const dependencyTree = require('dependency-tree');


const bundledCode = fs.readFileSync('dist/index.js', 'utf8');


const fetchProxy = new Proxy(fetch, {
  get(target, property) {
    if (Object.prototype.hasOwnProperty.call(target, property)) {
      return Reflect.get(target, property);
    } else {
      console.log(Object.prototype.toString)
      return undefined; 
    }
  },
  apply(target, thisArg, args) {
    console.log('Intercepted fetch call:', args);
    
    return Reflect.apply(target, thisArg, args);
  },
});

const vm = new VM({
  sandbox: {
    console, 
    allowAsync: true,   
    fetch:fetchProxy,
  },
  timeout: 5000, 
});

try {
  vm.run(bundledCode);
  console.log('Script executed successfully');
} catch (err) {
  console.error('Error executing the script:', err);
}
