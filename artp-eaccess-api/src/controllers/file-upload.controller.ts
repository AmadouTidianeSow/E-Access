// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-file-transfer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { inject } from '@loopback/core';
import {
  param, post,
  Request,
  requestBody,
  Response,
  RestBindings
} from '@loopback/rest';
import { FILE_UPLOAD_SERVICE } from '../keys'; import { FileUploadHandler } from '../types';
var xlsx = require("xlsx");
var async = require("async");
const axios = require('axios');


const mapper = (f: globalThis.Express.Multer.File) => ({
  fieldname: f.fieldname,
  originalname: f.originalname,
  encoding: f.encoding,
  mimetype: f.mimetype,
  size: f.size,
  path: f.path
});
/**
 * A controller to handle file uploads using multipart/form-data media type
 */
export class FileUploadController {
  /**
   * Constructor
   * @param handler - Inject an express request handler to deal with the request
   */
  constructor(
    @inject(FILE_UPLOAD_SERVICE) private handler: FileUploadHandler,
  ) { }
  @post('/files/{type}', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Files and fields',
      },
    },
  })
  async fileUpload(
    @requestBody.file()
    request: Request,
    @param.path.string('type') type: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {

    const token = request.headers.authorization || ''; // Assuming 'Authorization' header
    return new Promise<object>((resolve, reject) => {
      this.handler(request, response, (err: unknown) => {
        if (err) reject(err);
        else {
          resolve(FileUploadController.getFilesAndFields(request));
          switch (type) {
            case 'action':
              this.savebulkActions(request, token)
              break;

          }
        }
      });
    });
  }

  /**
   * Get files and fields for the request
   * @param request - Http request
   */
  private static getFilesAndFields(request: Request) {
    const uploadedFiles = request.files;
    let files: any[] = [];
    if (Array.isArray(uploadedFiles)) {
      files = uploadedFiles.map(mapper);
    } else {
      for (const filename in uploadedFiles) {
        files.push(...uploadedFiles[filename].map(mapper));
      }
    }
    return { files, fields: request.body };
  }

  async savebulkActions(request: Request, token?: string) {
    const uploadedFiles = request.files;
    let files: any[] = [];
    if (Array.isArray(uploadedFiles)) {
      files = uploadedFiles.map(mapper);
    }
    if (files[0] && files[0].path.endsWith('xlsx')) {
      const workbook = xlsx.readFile(files[0].path);
      const sheetName = workbook.SheetNames[0];
      const workSheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(workSheet, { raw: false });

      async.eachSeries(jsonData, (data: any, cb: any) => {
        
        cb()
      },
        function (err: any) {
          if (err) {
            console.error(err);
          }
        })
    }
  }

 
}

