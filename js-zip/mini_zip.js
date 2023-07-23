// 返回字符串第一个字符的 Unicode 编码(H 的 Unicode 值):
// 'P'.charCodeAt(0) 80
// String.fromCharCode(80) P


const readFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            resolve(e.target.result);
        };
        reader.onerror = function (e) {
            reject(e.target.error);
        };
        reader.readAsArrayBuffer(file);
        // reader.readAsBinaryString(file);
        // reader.readAsDataURL(file);
        // reader.readAsText(file, 'utf-8');
    })
}


const load = async (file) => {
    const arrayBuff = await readFile(file)
    const uint8arr = new Uint8Array(arrayBuff)
    console.log('uint8arr===', uint8arr)
    const length = uint8arr.length
    for (var i = 0; i < length; i++) {
        const item = uint8arr[i]
        uint8arr[i] = item & 0xFF;
        if(uint8arr[i] !== item){
            console.log('不等于...', item)
        }
    }
    console.log('end')
}