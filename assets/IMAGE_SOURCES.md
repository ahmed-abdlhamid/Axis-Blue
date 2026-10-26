# Current imagery

- `pool-hero-v3-{1600,800}.jpg`: illustrative modern blue swimming pool, 1600×650 / 800×325.
- `team-installation-{1400,800}.jpg`: illustrative installation team, homepage About, 1400×1050 / 800×600.
- `team-maintenance-{1400,800}.jpg`: illustrative water testing and cleaning team, About page, 1400×1050 / 800×600.

These scenes were generated with the built-in image_gen tool on 2026-10-26. They are not photographs of AXIS Blue employees or completed company projects. Prompts are in `GENERATED_IMAGE_PROMPTS.md`; original PNG outputs remain outside the project in the Codex generated_images folder. The local JPEGs use responsive resizing and compression.

`og-axis-blue-v3.jpg` (1200×630, about 132KB) is a deterministic HTML composition rendered from `qa/og-card.html` using those current scenes, the supplied logo, and local Zain fonts. No logo or Arabic lettering was regenerated.

The owner-supplied logo original is preserved in `logo.png`. Used derivatives are `logo-web.png`, `logo-dark-web.png`, and `favicon.png`.

Product image reference URLs remain in `catalog.json`; all 429 local product images are used. Earlier stock pool photographs and superseded OG/preview images were removed in the cleanup on 2026-10-26.

## Desktop hero revision

The generated hero was edited with the built-in image_gen tool on 2026-10-26 to replace the near-left triangular tiled foreground with matching blue pool water. Local JPEGs: `pool-hero-desktop-1600.jpg` (1600×650) and `pool-hero-desktop-1100.jpg` (1100×447). A picture/source media rule uses this variant only at widths of 1001px and above. The previous image stays unchanged on phones/tablets and in the OG composition. Full edit prompt is in GENERATED_IMAGE_PROMPTS.md.
