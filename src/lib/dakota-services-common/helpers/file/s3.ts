import * as AWS from "aws-sdk";

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();

type TUploadParams = {
  Body: AWS.S3.Body,
  Key: string,
  ContentType: string,
}

const uploadFile = (uploadParams: TUploadParams): Promise<AWS.S3.ManagedUpload.SendData | AWS.AWSError> => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: AWS_S3_BUCKET_NAME,
      ...uploadParams
    };

    s3.upload(params, {}, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  })
};

const deleteFile = (key: string): Promise<AWS.S3.DeleteObjectOutput | AWS.AWSError> => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: key
    };

    s3.deleteObject(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  })
};

const getFile = (key: string): Promise<AWS.S3.GetObjectOutput | AWS.AWSError> => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: key
    };

    s3.getObject(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data);
    });
  })
}

const copyFile = (sourceKey: string, key: string): Promise<AWS.S3.CopyObjectOutput | AWS.AWSError> => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: AWS_S3_BUCKET_NAME,
      CopySource: `/${AWS_S3_BUCKET_NAME}/${sourceKey}`,
      Key: key
    };

    s3.copyObject(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data);
    });
  })
}

export const s3Helper = {
  uploadFile,
  deleteFile,
  getFile,
  copyFile
};
