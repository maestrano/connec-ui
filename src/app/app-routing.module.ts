import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisualiserComponent } from './visualiser/visualiser.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
  { path: 'visualiser', component: VisualiserComponent },
  { path: 'visualiser/:collection/:id', component: DetailComponent },
  { path: '**', redirectTo: '/visualiser' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
