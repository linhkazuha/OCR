import fs from "fs";
import FormData from "form-data";

export function addMultipartFormData(requestParams, context, ee, next) {
    const form = new FormData();
    form.append('files', fs.createReadStream("./src/tests/test-image.png"));
    form.append('files', fs.createReadStream("./src/tests/test-image2.png"));
    form.append('files', fs.createReadStream("./src/tests/test-image3.png"));
    // form.append('files', fs.createReadStream("./src/tests/test-image4.png"));
    // form.append('files', fs.createReadStream("./src/tests/test-image5.png"));
    requestParams.body = form;
    requestParams.headers = form.getHeaders();
  
    return next(); 
}