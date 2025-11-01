import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { CameraCaptureComponent } from './camera-capture/camera-capture.component';


@NgModule({
  declarations: [
    CameraCaptureComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ],
  exports: [
    CameraCaptureComponent,  // exportez-le pour les autres modules
  ],
})
export class SharedModule { }
