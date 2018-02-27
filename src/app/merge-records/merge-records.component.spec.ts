import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeRecordsComponent } from './merge-records.component';

describe('MergeRecordsComponent', () => {
  let component: MergeRecordsComponent;
  let fixture: ComponentFixture<MergeRecordsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MergeRecordsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
