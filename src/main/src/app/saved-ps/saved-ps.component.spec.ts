import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedPSComponent } from './saved-ps.component';

describe('SavedPsComponent', () => {
  let component: SavedPSComponent;
  let fixture: ComponentFixture<SavedPSComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SavedPSComponent]
    });
    fixture = TestBed.createComponent(SavedPSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
