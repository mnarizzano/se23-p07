import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedPsComponent } from './saved-ps.component';

describe('SavedPsComponent', () => {
  let component: SavedPsComponent;
  let fixture: ComponentFixture<SavedPsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SavedPsComponent]
    });
    fixture = TestBed.createComponent(SavedPsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
