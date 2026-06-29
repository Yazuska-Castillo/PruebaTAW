import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPrincipalUsuarioComponent } from './menu-principal-usuario.component';

describe('MenuPrincipalUsuarioComponent', () => {
  let component: MenuPrincipalUsuarioComponent;
  let fixture: ComponentFixture<MenuPrincipalUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuPrincipalUsuarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuPrincipalUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
