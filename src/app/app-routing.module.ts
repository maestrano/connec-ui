import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisualiserComponent } from './visualiser/visualiser.component';
import { DetailComponent } from './detail/detail.component';
import { CreateRecordComponent } from './create-record/create-record.component';
import { MergeRecordsComponent } from './merge-records/merge-records.component';

const routes: Routes = [
  { path: 'visualiser/:collection', component: VisualiserComponent },
  { path: 'visualiser/:collection/new', component: CreateRecordComponent },
  { path: 'visualiser/:collection/merge', component: MergeRecordsComponent },
  { path: 'visualiser/:collection/:id', component: DetailComponent },
  { path: '**', redirectTo: '/visualiser/contacts' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
