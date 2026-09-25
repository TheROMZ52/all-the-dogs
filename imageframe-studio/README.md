# ImageFrame Studio

A browser toolkit for Minecraft ImageFrame.

## Features
- Supabase Storage upload for PNG/JPEG/WEBP/GIF
- Client-side image downscaling option for large raster images
- Image library with search, preview, select, use, copy URL and multi-delete
- Image URL generation from a public Storage bucket
- ImageFrame command builder with size presets
- Quick command helpers and marker helper
- Responsive dark UI
- No Supabase secret/service-role key in the client

## Setup
1. Create a Supabase Storage bucket named `imageframe-images`.
2. Make the bucket public if ImageFrame must fetch the URL directly.
3. Add INSERT and DELETE Storage policies for the intended role/bucket. The Settings dialog includes starter SQL.
4. Open `index.html` from a static host and enter the project URL plus the public publishable/anon key.

The app uses the browser Supabase client from esm.sh. Settings are kept in localStorage.

Never put a Supabase service-role/secret key in this app.

## ImageFrame note
Command syntax can vary with the exact ImageFrame version and enabled features. The builder keeps the existing command patterns together so they can be adjusted easily if your server build uses a different syntax.
