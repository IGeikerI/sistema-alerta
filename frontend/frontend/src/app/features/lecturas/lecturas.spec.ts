import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lecturas } from './lecturas';

describe('Lecturas', () => {
  let component: Lecturas;
  let fixture: ComponentFixture<Lecturas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lecturas],
    }).compileComponents();

    fixture = TestBed.createComponent(Lecturas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
