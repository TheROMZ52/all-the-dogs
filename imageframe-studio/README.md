# ImageFrame Studio

A small browser-based control panel for the Minecraft ImageFrame plugin.

## Features

- Upload PNG, JPEG, WEBP and GIF images to Supabase Storage
- Automatic public image URL generation
- Image preview and dimensions
- ImageFrame command builder
- Create, selection, combined and overlay command modes
- Refresh, get, delete, rename and marker command helpers
- One-click copy for commands and URLs
- Remembers Supabase project settings locally in the browser

## Supabase setup

Create a Storage bucket named `imageframe-images`.

For a simple public-image setup, make the bucket public and add an INSERT policy for the browser client. The SQL example is available inside the app under Settings.

Use only your Supabase project URL and publishable/anon key in the browser. Never put a Supabase secret/service-role key into this site.

ImageFrame accepts image URLs and supports PNG, JPEG, WEBP and GIF. The command format used by the builder follows the current ImageFrame documentation.
