import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideFirebaseApp } from '@angular/fire/app';
import { initializeApp } from 'firebase/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zone change detection configuration
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router configuration
    provideRouter(routes),

    // Animation providers
    provideAnimations(),
    provideAnimationsAsync(),

    // HTTP client provider
    provideHttpClient(),

    // Firebase initialization
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyB9BppsGvvQCCU4eZnh5RdK_ncBKG3rGwI",
      authDomain: "tikoy-s-pilot.firebaseapp.com",
      projectId: "tikoy-s-pilot",
      storageBucket: "tikoy-s-pilot.firebasestorage.app",
      messagingSenderId: "1063380458504",
      appId: "1:1063380458504:web:461cb56573e27c1efd85bd",
      measurementId: "G-0R6LYEDXQ8"
    })),

    // Firebase services initialization
    provideAuth(() => getAuth()),           // Provide Auth service
    provideFirestore(() => getFirestore()), // Provide Firestore service
    provideStorage(() => getStorage()),     // Provide Storage service (Firebase Storage)
  ],
};
