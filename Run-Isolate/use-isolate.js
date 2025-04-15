const ivm = require('isolated-vm');
const core = require('@actions/core')
const axios = require('axios');
const fs = require('fs');
const isolate = new ivm.Isolate({ memoryLimit: 128 });
const context = isolate.createContextSync();
const jail = context.global;

jail.setSync('global', jail.derefInto());







jail.setSync('log', function(...args) {
    console.log(...args);
})


// Object.keys(core).forEach((key) => {
//     const value = core[key];
//     if (typeof value === 'function') {
//       jail.setSync(key, function (...args) {
//         return value(...args); 
//       });
//     }
//   });

//   Object.keys(axios).forEach((key) => {
//     const value = axios[key];
//     if (typeof value === 'function') {
//       jail.setSync(key, function (...args) {
//         return value(...args); 
//       });
//     }
//   });


// jail.setSync('core_warning', function(warningMessage) {
//     core.warning(warningMessage);  
// });


// Function to recursively expose all properties of an object/module
// expose any module with ASync function 
function exposeModule(module, jail, namespace = 'core') {
const exposed = {};
Object.entries(module).forEach(([key, value]) => {
    if (typeof value === 'function') {
    // Wrap functions in Callback
    exposed[key] = new ivm.Callback((...args) => {
        return value(...args);
    }, { sync: false });
    } else {
    // Copy non-function values
    // exposed[key] = new ivm.ExternalCopy(value).copyInto();
    }
});

// Expose the entire module as an object in the jail
jail.setSync(namespace, new ivm.ExternalCopy(exposed).copyInto());
}


// function exposeAsyncModule(module, jail, namespace) {
// const exposed = {};
// Object.entries(module).forEach(([key, value]) => {
    
//     if (typeof value === 'function') {
//     // Wrap async functions in a callback
//     exposed[key] = new ivm.Callback((...args) => {
//         return value(...args)
//         .then(result => new ivm.ExternalCopy(result).copyInto())
//         .catch(err => {
//             throw new Error(err.message);
//         });
//     }, { async: true });
//     }
// });
// // Expose the module as an object
// jail.setSync(namespace, new ivm.ExternalCopy(exposed).copyInto());
// }

// jail.setSync(
//     'request',
//     new ivm.Callback(async (url) => {
//       try {
//         const response = await axios.get(url);
//         return new ivm.ExternalCopy(response.data).copyInto();
//       } catch (err) {
//         return new ivm.ExternalCopy({ error: err.message }).copyInto();
//       }
//     }, { async: true })
//   );









  // Expose @actions/core module or any module 
//   exposeModule(core, jail);
//   exposeAsyncModule(axios, jail, 'axios')


// try{
//     const result = context.evalSync(`
//         log('Available global functions:', Object.keys(global));  
//         core.warning("hello from isolated vm")
//         request('https://jsonplaceholder.typicode.com/todos/1').then(response => {
//             log('Response:', response);
//         })
//         .catch(error => {
//             log('Error:', error.message);
//         });
        
//         `
        
//     , { promise: true } );
//     console.log(result);
    
// } catch (e) {
//     console.error('Error during VM execution:', e);
// }
// expose module safely with name 
// function exposeModule(module, jail, namespace = 'module') {
// const exposed = {};
// Object.entries(module).forEach(([key, value]) => {
//     if (typeof value === 'function') {
//     exposed[key] = new ivm.Callback((...args) => {
//         return new Promise((resolve, reject) => {
//         try {
//             value(...args, (err, result) => {
//             if (err) reject(err.message);
//             else resolve(result);
//             });
//         } catch (e) {
//             reject(e.message);
//         }
//         });
//     }, { async: true });
//     }
// });
// jail.setSync(namespace, new ivm.ExternalCopy(exposed).copyInto());
// }

// exposeModule(axios, jail, 'axios');








// handling the promis 
// fixed not sure :) 


async function fetchData(url) {
try {
    const response = await axios.get(url);
    console.log(response.data)
    // Return the data as an ExternalCopy to transfer it to the isolate
    return new ivm.ExternalCopy(response.data).copyInto();
} catch (error) {
    // Return the error message as an ExternalCopy
    return new ivm.ExternalCopy({ error: error.message }).copyInto();
}
}

// Wrap the asynchronous function with ivm.Callback
const fetchDataCallback = new ivm.Callback(fetchData, { async: true });

// Expose the asynchronous function to the isolate's global context
jail.setSync('fetchData', fetchDataCallback);
// Test the isolated VM code
try {
const result = isolate.compileScriptSync(`
    log('Available global functions:', Object.keys(global));  // Check global context
    const response = fetchData('https://jsonplaceholder.typicode.com/todos/1')
    if (response){
        log(response)
    }
    // log(f);
`).runSync(context);
console.log('Execution Result:', result);
} catch (e) {
console.error('Execution Error:', e);
} 


