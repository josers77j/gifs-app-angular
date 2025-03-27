import {  Component } from '@angular/core';
import { environment } from '@enviroments/environment.development';

@Component({
  selector: 'gifs-side-menu-header',
  imports: [],
  templateUrl: './side-menu-header.component.html',

})
export default class SideMenuHeaderComponent {
  envs = environment
 }
