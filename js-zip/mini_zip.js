// 返回字符串第一个字符的 Unicode 编码(H 的 Unicode 值):
// 'P'.charCodeAt(0) 80
// String.fromCharCode(80) P


const readFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        let result = {};
        let count = 0;
        reader.onload = function (e) {
            console.log('load...', e)
            count++;
            if (count === 1) {
                result.arrayBuff = e.target.result
                reader.readAsBinaryString(file);
            } else if (count === 2) {
                result.binaryString = e.target.result
                reader.readAsDataURL(file);
            }
            else if (count === 3) {
                result.dataURL = e.target.result
                reader.readAsText(file, 'utf-8');
            } else if (count === 4) {
                result.text = e.target.result
                resolve(result)
            }
        };
        reader.onerror = function (e) {
            reject(e.target.error);
        };
        reader.readAsArrayBuffer(file);
    })
}


const load = async (file) => {
    const result = await readFile(file)
    console.log('arrayBuff...', result.arrayBuff)
    console.log('binaryString...', result.binaryString)
    console.log('dataURL...', result.dataURL)
    console.log('text...', result.text)

    // const uint8arr = new Uint8Array(arrayBuff)
    // console.log('uint8arr===', uint8arr)
    // const length = uint8arr.length
    // for (var i = 0; i < length; i++) {
    //     const item = uint8arr[i]
    //     uint8arr[i] = item & 0xFF;
    //     if (uint8arr[i] !== item) {
    //         console.log('不等于...', item)
    //     }
    // }
    console.log('end')
}