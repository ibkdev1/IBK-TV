# Keep all app classes (Channel, adapters, etc.)
-keep class com.ibktv.app.** { *; }

# Keep Media3/ExoPlayer
-keep class androidx.media3.** { *; }
-dontwarn androidx.media3.**
