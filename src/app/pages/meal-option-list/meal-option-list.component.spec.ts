import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealOptionListComponent } from './meal-option-list.component';

describe('MealOptionListComponent', () => {
  let component: MealOptionListComponent;
  let fixture: ComponentFixture<MealOptionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealOptionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealOptionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
