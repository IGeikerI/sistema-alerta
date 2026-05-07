import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Actuadores } from './actuadores';

describe('Actuadores', () => {
  let component: Actuadores;
  let fixture: ComponentFixture<Actuadores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Actuadores],
    }).compileComponents();

    fixture = TestBed.createComponent(Actuadores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
