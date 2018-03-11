import { Component } from '@angular/core';
import { PlaygroundApp } from './PlaygroundApp'

@Component({
  selector: 'vk-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
constructor() {
        PlaygroundApp.initialize();
        PlaygroundApp.instance.start();
    }
}
