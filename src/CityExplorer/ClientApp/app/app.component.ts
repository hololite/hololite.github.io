import { Component } from '@angular/core';
import { App } from './App'

@Component({
  selector: 'vk-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'vk';

    constructor() {
        App.initialize();
        App.instance.start();
    }
}
