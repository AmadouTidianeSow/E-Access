import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVisitPageComponent } from './edit-visit-page.component';

describe('EditVisitPageComponent', () => {
  let component: EditVisitPageComponent;
  let fixture: ComponentFixture<EditVisitPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditVisitPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditVisitPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
