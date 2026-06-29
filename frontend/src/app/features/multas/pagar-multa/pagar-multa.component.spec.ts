import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagarMultaComponent } from './pagar-multa.component';

describe('PagarMultaComponent', () => {
  let component: PagarMultaComponent;
  let fixture: ComponentFixture<PagarMultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagarMultaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagarMultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
