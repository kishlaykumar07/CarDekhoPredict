import { Routes } from '@angular/router';
import { ResultComponent } from './result.component';
import { WizardComponent } from './wizard.component';

export const routes: Routes = [
	{ path: '', component: WizardComponent },
	{ path: 'results', component: ResultComponent },
	{ path: '**', redirectTo: '' }
];
