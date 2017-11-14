import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnecUiComponent } from './connec-ui.component';

describe('ConnecUiComponent', () => {
  let component: ConnecUiComponent;
  let fixture: ComponentFixture<ConnecUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnecUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnecUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
