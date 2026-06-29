import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { MenuPrincipalUsuarioComponent } from './menu-principal-usuario/menu-principal-usuario.component';
import { MenuPrincipalAdminComponent } from './menu-principal-admin/menu-principal-admin.component';

@NgModule({
  declarations: [MenuPrincipalUsuarioComponent, MenuPrincipalAdminComponent],
  imports: [CommonModule, SharedModule, FormsModule, RouterModule],
  exports: [MenuPrincipalUsuarioComponent, MenuPrincipalAdminComponent],
})
export class MenuPrincipalModule {}
