# Bixby Custom

A lightweight Persian-first Android voice assistant inspired by Bixby's interaction model. This is an independent implementation and is not affiliated with Samsung.

## First milestone

- Native Android app using Kotlin and Jetpack Compose
- Persian speech recognition through the Android speech service
- Persian text-to-speech through the device TTS engine
- Local shortcuts for Android Settings, Wi-Fi, Bluetooth, Alarms, and Calculator
- Optional OpenAI-compatible Chat Completions endpoint for online conversations
- GitHub Actions debug APK build

## Device target

- Minimum Android: 8.0 (API 26)
- Target SDK: 35
- Designed for Android 12 devices such as Samsung Galaxy A21s
- JDK 17, Gradle 8.9, Android Gradle Plugin 8.7.3

## Build

Open this directory in Android Studio, or install Gradle 8.9 and run:

```bash
gradle assembleDebug
```

APK: `app/build/outputs/apk/debug/app-debug.apk`

## Online AI

Enter an OpenAI-compatible Chat Completions endpoint, API key, and model in app settings. The key is stored in the app's private preferences. Never commit API keys.

Local shortcuts work without an API key. Offline speech recognition depends on the speech service installed on the device; the offline preference is only a hint to that service.

## Privacy

Microphone permission is requested only after the user taps the microphone. Speech is processed by the Android speech service. Prompts are sent to the configured AI endpoint only for requests not handled locally and only when an API key is configured.
