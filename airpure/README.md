# AirPure HVAC – scroll-controlled video website
Open index.html in a browser (no build step, no server needed).

## How the video works
The HVAC clip is stored as 192 frames in assets/frames/. Scrolling down plays it forward, scrolling up plays it backward, and it stops when you stop scrolling.

## Replace the video
ffmpeg -i your-video.mp4 -vf "scale=1280:-2" -c:v libwebp -quality 52 assets/frames/f%03d.webp
Then set FRAMES at the top of script.js to the number of files created.

## Customize
- Brand name, phone, email, prices, reviews: index.html (sample content).
- Colors/fonts: :root in style.css.
- Booking form shows a thank-you only; connect it to Formspree/EmailJS/your backend in script.js.
