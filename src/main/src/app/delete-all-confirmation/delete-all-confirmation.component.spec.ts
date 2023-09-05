import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAllConfirmationComponent } from './delete-all-confirmation.component';

describe('DeleteAllConfirmationComponent', () => {
  let component: DeleteAllConfirmationComponent;
  let fixture: ComponentFixture<DeleteAllConfirmationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteAllConfirmationComponent]
    });
    fixture = TestBed.createComponent(DeleteAllConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
