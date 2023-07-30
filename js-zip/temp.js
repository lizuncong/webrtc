// JSZip
// const zip = new JSZip()；zip对象的格式如下：
const zip = {
    clone: () => { },
    comment: null,
    files: {
        // 值是ZipObject
        'Hello.txt': {
            comment: null,
            date: new Date(),
            dir: false,
            dosPermissions: null,
            name: "Hello.txt",
            options: { compression: null, compressionOptions: null },
            unixPermissions: null,
            _data: Promise.resolve(''),
            _dataBinary: false
        },
        'images/': {
            comment: null,
            date: new Date(),
            dir: true,
            dosPermissions: null,
            name: "images/",
            options: { compression: 'STORE', compressionOptions: null },
            unixPermissions: null,
            _data: Promise.resolve(),
            _dataBinary: true
        }
    },
    root: ""
}
// const img = zip.folder('images)；img对象格式如下：其实就是将zip复制一份，然后将root修改成images/
const img = {
    clone: () => { },
    comment: null,
    files: {
        // 值是ZipObject
        'Hello.txt': {
            comment: null,
            date: new Date(),
            dir: false,
            dosPermissions: null,
            name: "Hello.txt",
            options: { compression: null, compressionOptions: null },
            unixPermissions: null,
            _data: Promise.resolve(''),
            _dataBinary: false
        },
        'images/': {
            comment: null,
            date: new Date(),
            dir: true,
            dosPermissions: null,
            name: "images/",
            options: { compression: 'STORE', compressionOptions: null },
            unixPermissions: null,
            _data: Promise.resolve(),
            _dataBinary: true
        },
        'images/my.txt': {
            comment: null,
            date: new Date(),
            dir: false,
            dosPermissions: null,
            name: "images/my.txt",
            options: { compression: null, compressionOptions: null },
            unixPermissions: null,
            _data: Promise.resolve(),
            _dataBinary: false
        }
    },
    root: "images/"
}

const generateInternalStream = () => {
    const opts = {
        comment: null,
        compression: "STORE",
        compressionOptions: null,
        encodeFileName: (str) => {
            if (support.nodebuffer) {
                return nodejsUtils.newBufferFrom(str, "utf-8");
            }

            return string2buf(str);
        },
        mimeType: "application/zip",
        platform: "DOS",
        streamFiles: false,
        type: "blob"
    }
}

const string2buf = (str) => {

}

const chunk = {
    data: "Hello World\n",
    meta: {
        percent: 100
    }
}