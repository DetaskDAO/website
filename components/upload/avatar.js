import { uploadImage } from "../../http/_api/public";

export const uploadImageProps = {
    multiple: false,
    maxCount: 1,
    onStart(file) {
      console.log('开始了 ==>');
      // console.log('onStart', file, file.name);
    },
    onError(err) {
      console.log("onError", err);
    },
    customRequest({
      data,
      file,
      filename,
      onError,
      onSuccess
    }) {
      const formData = new FormData();
      if (data) {
        Object.keys(data).forEach(key => {
          formData.append(key, data[key]);
        });
      }
      formData.append(filename, file);
      uploadImage(formData)
      .then(res => {
        onSuccess(res, file);
      })
      .catch(err => {
        console.log(err);
      });

      return {
        abort() {
          console.log("upload progress is aborted.");
        }
      };
    }
  };