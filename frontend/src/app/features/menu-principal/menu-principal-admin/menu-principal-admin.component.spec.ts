import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPrincipalAdminComponent } from './menu-principal-admin.component';

describe('MenuPrincipalAdminComponent', () => {
  let component: MenuPrincipalAdminComponent;
  let fixture: ComponentFixture<MenuPrincipalAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuPrincipalAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuPrincipalAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
