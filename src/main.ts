import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

if (typeof window !== 'undefined') {
  Promise.all([
    import('uikit'),
    import('uikit/dist/js/uikit-icons')
  ])
    .then(([{ default: UIkit }, { default: Icons }]) => {
      UIkit.use(Icons);
    })
    .catch((error) => console.warn('UIKit failed to initialize:', error));
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
