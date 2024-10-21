import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoTimeComponent } from './info-time.component';

describe('InfoTimeComponent', () => {
  let component: InfoTimeComponent;
  let fixture: ComponentFixture<InfoTimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfoTimeComponent]
    });
    fixture = TestBed.createComponent(InfoTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
