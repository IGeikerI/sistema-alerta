import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pronostico } from './pronostico';

describe('Pronostico', () => {
  let component: Pronostico;
  let fixture: ComponentFixture<Pronostico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pronostico],
    }).compileComponents();

    fixture = TestBed.createComponent(Pronostico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
