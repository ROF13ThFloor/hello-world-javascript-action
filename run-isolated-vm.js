const Module = require('module');


function createProxyForModule(modulePath, target, parentPath = '') {
    return new Proxy(target, {
        get(target, prop, receiver) {
            const fullPath = parentPath ? `${parentPath}.${prop}` : prop.toString();

            
            const descriptor = Object.getOwnPropertyDescriptor(target, prop);
            if (descriptor && !descriptor.configurable) {
                return Reflect.get(target, prop, receiver);
            }

            const originalValue = Reflect.get(target, prop, receiver);

            if (typeof originalValue === 'function') {
                
                return new Proxy(originalValue, {
                    apply(targetFn, thisArg, args) {
                        console.log(
                            `Function called in module ${modulePath}: ${fullPath}, arguments:`,
                            args
                        );
                        return Reflect.apply(targetFn, thisArg, args);
                    },
                });
            } else if (originalValue && typeof originalValue === 'object') {
                
                return createProxyForModule(modulePath, originalValue, fullPath);
            }

            return originalValue;
        },
    });
}


global = new Proxy(global, {
    get(target, prop, receiver) {
        const originalValue = Reflect.get(target, prop, receiver);
        if (typeof originalValue === 'function') {
            return new Proxy(originalValue, {
                apply(targetFn, thisArg, args) {
                    console.log(`Global function called: ${prop}, arguments:`, args);
                    return Reflect.apply(targetFn, thisArg, args);
                },
            });
        }
        return originalValue;
    },
});


const originalRequire = Module.prototype.require;

Module.prototype.require = function (modulePath) {
    const module = originalRequire.call(this, modulePath);
    console.log(`Module required: ${modulePath}`);

    if (typeof module === 'object' || typeof module === 'function') {
        return createProxyForModule(modulePath, module);
    }

    return module;
};

require('./src/index.js');
