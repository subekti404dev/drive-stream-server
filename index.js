const {getStream} = require('drive-stream');
// https://drive.google.com/file/d/1Am-oIbyyWWXCa-obXtcCLvLiRctGOHpH/view?usp=sharing
const main = async () => {
    const data = await getStream('1Am-oIbyyWWXCa-obXtcCLvLiRctGOHpH');
    console.log(data);
}

main();