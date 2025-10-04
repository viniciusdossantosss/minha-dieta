import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealSelectionModalComponent } from './meal-selection-modal.component';

describe('MealSelectionModalComponent', () => {
  let component: MealSelectionModalComponent;
  let fixture: ComponentFixture<MealSelectionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealSelectionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealSelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
