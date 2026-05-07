import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Predicciones } from './predicciones';

describe('Predicciones', () => {
  let component: Predicciones;
  let fixture: ComponentFixture<Predicciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Predicciones],
    }).compileComponents();

    fixture = TestBed.createComponent(Predicciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
