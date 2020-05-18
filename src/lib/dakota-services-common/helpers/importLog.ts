import pubSub from "./subscriptions/pubSub";
import { s3Helper } from "./file/s3";
import { EVENTS } from "./subscriptions/constants";

export function logImport(writeStream){
    return function(...args){
      let output = `${args.join(' ')}\n`;
      if(writeStream.writable)
        writeStream.write(output);
  
      pubSub.publish(EVENTS.IMPORT_LOGS.SEED, { logs: [output] }); // send to subscriber
    }
};

export async function writeFinished(fs, file, key) {
    try{
      await s3Helper.uploadFile({
        Body: fs.createReadStream(file),
        Key: key,
        ContentType: 'txt',
      });
      fs.unlinkSync(file);
    } catch (err) {
      console.log('file upload failed: ', err.message)
    }
  }