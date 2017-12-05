import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeAttributesComponent } from './merge-attributes.component';

describe('MergeAttributesComponent', () => {
  let component: MergeAttributesComponent;
  let fixture: ComponentFixture<MergeAttributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MergeAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
