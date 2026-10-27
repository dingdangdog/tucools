Engine image only. This release does not include the page image, desktop installers, or the model pack.

Tag: `engine-v__VERSION__`

- Image: `__ENGINE_IMAGE__:__VERSION__`
- `latest` on this image moves only when the publish option says so
- Digest file: `tucools-engine-__VERSION__.txt`

`linux/amd64` installs PyTorch for CUDA 12.8. `linux/arm64` is the CPU build.

The package is private the first time it is published. To let others pull it, make `tucools-engine` public on GitHub Packages.

Pin this engine without changing the page:

    TUCOOLS_ENGINE_IMAGE=__ENGINE_IMAGE__:__VERSION__

See `docs/deploy.md`. The page image and desktop installers have their own releases.
