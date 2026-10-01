# Three.js vendored files

Version: `0.160.0`

These files are stored in the repository so the site does not execute JavaScript
from a third-party CDN at runtime:

- `build/three.min.js`
- `examples/jsm/controls/OrbitControls.js`
- `examples/jsm/controls/OrbitControls.global.js`

They were downloaded from the versioned `three@0.160.0` package on jsDelivr.
The `.global.js` file is a minimal local wrapper around the downloaded
`OrbitControls.js` source. It preserves lazy loading and also works when the site
is opened directly with `file://`, where browsers block local ES module imports.
The upstream MIT license is included in `LICENSE`.

SHA-256 checksums:

```text
170c6789f43217c96b3170f4b42fafe135de7f7cd48497a4218f9757ee1d49fa  build/three.min.js
5a44a9e86a2a0fb11933eed69bc2cd33c76a496854c1aed6ed776efa87d7b064  examples/jsm/controls/OrbitControls.js
162aa34235206468483ca337268feb34b3013d88f951207a4250545cb30b60c2  examples/jsm/controls/OrbitControls.global.js
852e0e8699169bf9f6fdc6bda3e682d078dcbc738b5d33e74df594721bff271d  LICENSE
```
