function utils() {
    let obj = {};
    
    obj.asyncMap = async (array, operation) => {
        return Promise.all(array.map(async item => await operation(item)))
    }

    return obj;
}
module.exports = utils;