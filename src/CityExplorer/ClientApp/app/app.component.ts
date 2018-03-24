import { Component } from '@angular/core';
import { VkMap } from './Main'

@Component({
  selector: 'vk-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'vk';

    constructor() {
        VkMap.start();
    }
}
