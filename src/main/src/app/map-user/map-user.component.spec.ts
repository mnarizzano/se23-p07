import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapUserComponent } from './map-user.component';

describe('MapUserComponent', () => {
  let component: MapUserComponent;
  let fixture: ComponentFixture<MapUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapUserComponent]
    });
    fixture = TestBed.createComponent(MapUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
