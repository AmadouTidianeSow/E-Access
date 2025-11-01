import { inject, service } from '@loopback/core';
import {
  get,
  HttpErrors,
  oas,
  param,
  Response,
  RestBindings,
} from '@loopback/rest';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { STORAGE_DIRECTORY } from '../keys';

const readdir = promisify(fs.readdir);

/**
 * A controller to handle file downloads using multipart/form-data media type
 */
export class FileDownloadController {
  constructor(@inject(STORAGE_DIRECTORY) private storageDirectory: string) { }
  @get('/download', {
    responses: {
      200: {
        content: {
          // string[]
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        description: 'A list of files',
      },
    },
  })
  async listFiles() {
    const files = await readdir(this.storageDirectory);
    return files;
  }

  @get('/download/{filename}')
  @oas.response.file()
  async downloadFile(
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @param.path.string('filename') fileName: string,
    // @param.query.string('dateDebut') dateDebut?: string,  // Paramètre optionnel dateDebut
    // @param.query.string('dateFin') dateFin?: string,
  ) {

    const file = this.validateFileName(fileName);
    response.download(file, fileName.split('_')[1]);
    return response;

  }

  /**
   * Validate file names to prevent them goes beyond the designated directory
   * @param fileName - File name
   */
  private validateFileName(fileName: string) {
    const resolved = path.resolve(this.storageDirectory, fileName);
    if (resolved.startsWith(this.storageDirectory)) return resolved;
    // The resolved file is outside sandbox
    throw new HttpErrors.BadRequest(`Invalid file name: ${fileName}`);
  }
}
