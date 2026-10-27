Page image only. This release does not include desktop installers, the engine image, or the model pack.

Tag: `web-v__VERSION__`

- Image: `__WEB_IMAGE__:__VERSION__`
- `latest` on this image moves only when the publish option says so
- Digest file: `tucools-web-__VERSION__.txt`

The image includes `linux/amd64` and `linux/arm64`. It serves the page and forwards cutout, enhance, and erase to an engine on the same origin.

The package is private the first time it is published. To let others pull it, make `tucools-web` public on GitHub Packages.

Pin this page without changing the engine:

    TUCOOLS_WEB_IMAGE=__WEB_IMAGE__:__VERSION__

See `docs/deploy.md`. Engine images and desktop installers have their own releases.
