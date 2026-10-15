# Performance and accuracy

This records the baseline and the first four steps of the second Milestone 4 pass:
bounding analytic-raster work to the painted path, replacing overlapping stroke pieces
with a traced outline, correcting the area of tessellated round caps and joins, and
replacing dense coverage sweeps with sparse edge-event spans.
Measurements were taken on Node v24.21.0 through the sparse-raster step and v24.22.0 for
the PNG step. Baseline timings are medians of three runs and current corpus timings are
medians of five. Accuracy metrics and hashes are deterministic.
Native backends may defer work from draw to readback, so `draw + PNG` remains the
end-to-end comparison.

## Paint scaling

The same three-point triangle now costs essentially the same at every canvas size:

| Canvas    |  Before | Current | Speedup |
| --------- | ------: | ------: | ------: |
| 64×64     | 12.5 µs |  3.2 µs |    3.9× |
| 1024×768  | 1.69 ms |  3.1 µs |    545× |
| 2048×1536 | 6.78 ms |  3.3 µs |  2,055× |

The largest result is 1.06× the smallest, comfortably within the 2× scaling target. The
rasterizer now uses a geometrically grown workspace local to clipped path bounds, carries
winding rightward from the edge cell, visits only sorted edge events, emits the spans
between them, and clears deltas as it reads them.

## Translucent compositing

The original compositor blended four bytes separately for every pixel. It now handles
short spans two byte lanes at a time, coalesces whole-width rectangles into one span,
uses a native word fill when a long destination span is uniform, and uses a lazily built
16-bit-pair scaling table for other long spans. A focused test checks every source alpha
against the scalar rounding formula, then separately covers both long-span paths.

| Operation                    |  Before | Current | Speedup |
| ---------------------------- | ------: | ------: | ------: |
| Opaque full-canvas fill      | 58.2 µs | 24.3 µs |    2.4× |
| Translucent full-canvas fill | 1.80 ms | 0.48 ms |    3.8× |

The translucent result meets the 0.5 ms target. In focused `node --cpu-prof` runs over
200 paints, measured paint time falls from 1.780 to 0.522 ms and profile duration from
525.9 to 252.8 ms. Before the change, 318 hot samples were split between `fillRect` (141)
and its 768 row-level `compositeSpan` calls (177); afterward the single-span compositor
contains the hot loop directly. The attribution therefore moves to `compositeSpan`, but
the operation and profile wall times both fall. Corpus pixel hashes remain unchanged.

## Real-document performance

The corpus contains the three non-empty gmlrender examples and six real tags. The
truncated `109.gml` was replaced with `20312.gml` (74 strokes, 852 points), `19938.gml`
(58 strokes, 3,145 points), and `18476.gml` (354 single-point strokes). The last tag is
blank in every backend and isolates the fixed cost of an empty paint.

| Document      |  Original | Bounded raster | Round geometry | Sparse sweep | Node draw | Sparse at 2048×1536 |
| ------------- | --------: | -------------: | -------------: | -----------: | --------: | ------------------: |
| example-brush |   5.82 ms |        2.61 ms |        2.06 ms |      1.06 ms |   0.35 ms |             1.71 ms |
| example001    |   4.33 ms |        2.39 ms |        2.22 ms |      0.67 ms |   0.51 ms |             1.75 ms |
| example002    |   6.59 ms |        4.71 ms |        3.80 ms |      1.92 ms |   1.97 ms |             4.87 ms |
| 414           | 178.23 ms |        5.99 ms |        5.52 ms |      5.36 ms |   2.13 ms |            10.92 ms |
| 409           |   5.21 ms |        4.45 ms |        2.39 ms |      1.09 ms |   0.93 ms |             2.28 ms |
| 158           |   4.72 ms |        3.08 ms |        2.76 ms |      1.33 ms |   1.01 ms |             2.72 ms |
| 20312         | 145.57 ms |        4.57 ms |        3.58 ms |      2.52 ms |   2.11 ms |             5.17 ms |
| 19938         | 114.24 ms |        6.44 ms |        4.43 ms |      3.27 ms |   4.03 ms |             6.10 ms |
| 18476         | 648.11 ms |        1.92 ms |        1.92 ms |      0.54 ms |   0.33 ms |             1.14 ms |

`414.gml` is now 33.3× faster than the original and remains below the 10 ms draw target.
The sparse sweep makes the legitimate full-canvas background cheap as well: `18476.gml`
drops from 1.92 ms to 0.54 ms, below the approximate 1 ms goal, while all 354 empty
strokes still return before touching the raster workspace. `example002` falls below its
3 ms draw target for the first time. At 2048×1536, simple and spatially broad documents
improve by 2.0× to 6.9× over the round-geometry step.

The outline change reduces a completed `414.gml` render from 1,447 contours and 15,028
points to 93 contours and 3,504 points: 15.6× fewer contours and 4.3× fewer vertices.
Its 60-frame draw-and-readback animation improves from 26.57 to 25.48 ms/frame, versus
21.26 ms for node-canvas and 18.30 ms for skia-canvas in the same run. The draw-plus-PNG
target remains unmet because encoding, not the raster sweep, now dominates the tscanvas
end-to-end path.

The round correction adds no vertices. Five-run draw medians move between -5% and +12%
relative to the outline step, without a consistent relationship to round-arc count. In a
matched 100-draw instrumentation run, `414.gml` moves from 5.19 ms to 5.08 ms and stroker
time from 0.12 ms to 0.11 ms. The change is therefore performance-neutral within run
noise; the correction avoids the roughly 2× edge-count cost of finer tessellation.

## CPU profiles

Matched `node --cpu-prof` runs over three completed renders show the fixed paint cost
disappearing. Counts below are self samples; totals include startup, native backends,
encoding, and comparison work.

| Workload | State          | Total samples | Raster `fill` | Edge rows | Coverage sweep | PNG filter |
| -------- | -------------- | ------------: | ------------: | --------: | -------------: | ---------: |
| 414      | original       |         2,197 |           907 |         — |            685 |         54 |
| 414      | bounded raster |           930 |             6 |        11 |            305 |         51 |
| 414      | stroke outline |           749 |             2 |         7 |            242 |         59 |
| 414      | round geometry |           870 |             2 |        11 |            296 |         63 |
| 414      | sparse sweep   |           721 |            11 |        12 |             15 |         63 |
| 18476    | original       |         5,740 |            82 |         — |          5,192 |         57 |
| 18476    | bounded raster |           537 |             2 |         — |            162 |         62 |

The sparse event walk reduces compositor self samples from 296 to 15 (94.9%) and total
samples from 870 to 721 (17.1%). Edge-row work is essentially unchanged at 12 samples.
The raster `fill` increase includes the typed-array sort, which the profiler attributes
to its caller, but it is far smaller than the dense sweep it replaces. The compositor is
no longer the dominant tscanvas entry; PNG filter selection now contributes 63 samples,
and neither outline construction nor stroker geometry appears as meaningful self time.
This directs the next performance step back to PNG rather than further raster or stroker
work.

A profile repeated immediately before the round change recorded 783 total samples, 238
in coverage sweep, and 11 in edge-row accumulation; the post-change profile recorded
870, 296, and 11 respectively, even though its profiled draw median was faster (5.46 ms
versus 6.12 ms). `areaMatchedRadius` had zero self samples. That variation was sampler
noise; the subsequent 20× reduction in coverage samples is large enough to distinguish
the sparse-sweep effect clearly.

## Accuracy metrics

Images are composited onto white before calculating per-pixel average-RGB luminance.
Metrics cover every pixel with non-zero ink in either image:

- ink bias is `(candidate ink mass / Skia ink mass) - 1`;
- mean and maximum `|Δ|` are absolute luminance differences;
- `>16` is the share of touched pixels whose absolute difference exceeds 16;
- ground truth is Skia rendered with geometry and brush widths scaled 16×, followed by
  an exact 16×16 box downsample.

| Document      | Ink bias, outline → round | Mean &#124;Δ&#124; | Max &#124;Δ&#124; | &#124;Δ&#124; > 16 | GT distance, outline → round |
| ------------- | ------------------------: | -----------------: | ----------------: | -----------------: | ---------------------------: |
| example-brush |           +0.03% → +0.06% |        1.08 → 1.11 |           31 → 35 |      1.33% → 1.43% |                  4.32 → 4.29 |
| example001    |           +0.43% → +0.45% |        4.00 → 4.01 |         124 → 124 |      6.72% → 6.77% |                  0.46 → 0.44 |
| example002    |           +0.14% → +0.15% |        1.75 → 1.75 |         141 → 141 |      2.72% → 2.72% |                  0.29 → 0.28 |
| 414           |           -0.00% → +0.02% |        1.94 → 1.95 |           78 → 78 |      4.13% → 4.17% |                  0.39 → 0.35 |
| 409           |           +0.09% → +0.10% |        1.72 → 1.72 |         111 → 111 |      2.78% → 2.80% |                  0.18 → 0.16 |
| 158           |           +0.05% → +0.07% |        4.70 → 4.70 |         125 → 125 |    10.45% → 10.50% |                  0.36 → 0.35 |
| 20312         |           +0.04% → +0.10% |        2.94 → 2.91 |         125 → 125 |      5.50% → 5.43% |                  0.49 → 0.43 |
| 19938         |           +0.11% → +0.22% |        3.07 → 3.04 |         141 → 144 |      5.34% → 5.19% |                  0.86 → 0.75 |
| 18476         |           +0.00% → +0.00% |        0.00 → 0.00 |             0 → 0 |      0.00% → 0.00% |                  0.00 → 0.00 |

The exact horizontal two-segment repro remains byte-identical to one uninterrupted
segment. Before the outline change, a shallow fractional turn reproduced the union bug
with +5.09% ink bias and maximum error 124. The traced outline measures -0.10% ink bias,
mean error 0.22, maximum error 8, and no pixels over 16 against the 16× box-filtered
reference. Against native-resolution Skia it still has +4.39% ink bias, but maximum error
falls to 63; the supersampled result shows that native Skia underfills this focused case.

`414.gml` now meets every strict compatibility target and its formerly expected-failing
test is a normal passing test. `example001` and `example002` still miss one or more strict
limits, chiefly maximum per-pixel error, and remain explicit expected failures.

The focused round-geometry scene combines zero-length round caps at widths 2–33, an open
round-capped segment, and a round join. With inscribed vertices it had -0.68% ink bias,
mean error 1.62, maximum error 36, and 4.42% of pixels over 16 against the 16× reference.
Centering the radial error improved those to -0.16%, 0.67, 18, and 0.13%. Matching polygon
area performed best at +0.02%, 0.58, 16, and 0%, while retaining the same number of edges.
On the full corpus, native-Skia compatibility changes only marginally, but 16×
ground-truth distance improves on every nonblank document. This confirms the geometric
fix without misrepresenting it as the cause of the remaining compatibility outliers.

The 16× reference produces a second notable result: tscanvas is closest on `414`, `409`,
`158`, and `20312`, while node-canvas is closest on the other three nonblank non-brush documents.
Native-resolution Skia is not the most area-accurate result for any of them. Compatibility
and ground-truth correctness must therefore remain separate metrics.

## Pixel hashes

These SHA-256 prefixes cover decoded tscanvas RGBA pixels at 1024×768. The round correction
deliberately changes boundary coverage, so the table audits each image against the stroke-
outline output from step 2:

| Document      | New hash prefix    | Changed pixels | Maximum byte difference |
| ------------- | ------------------ | -------------: | ----------------------: |
| example-brush | `f707b022e4936c46` |             60 |                      23 |
| example001    | `f7facba799e2a24f` |            106 |                       8 |
| example002    | `f027797b6d920250` |            363 |                      36 |
| 414           | `4c105aaf9b0eca9f` |          1,450 |                      20 |
| 409           | `33d5d2958754c6da` |             76 |                      17 |
| 158           | `987ea02f5e3e43d8` |            231 |                       9 |
| 20312         | `7b9e306ac579fd89` |          1,794 |                      20 |
| 19938         | `aeca4af16262f466` |          3,275 |                      21 |
| 18476         | `908b6cfc9aef496d` |              0 |                       0 |

Across the corpus, 7,355 pixels and 22,065 RGBA bytes changed, with a maximum absolute
byte difference of 36. Every change is confined to a nonblank stroked document; the blank
`18476` case is byte-identical. These hashes are rebaselined in the same accuracy commit
because the corrected round boundary intentionally changes coverage.

The sparse sweep is a pure performance change. A full decoded-pixel audit produced the
same nine hashes as the round-geometry step: zero pixels and zero RGBA bytes changed,
with a maximum absolute byte difference of zero. No hash rebaseline was needed.

Switching the winding carry from the canvas origin to each edge changed floating-point
summation order. A byte-for-byte audit against the pre-change renders found one affected
pixel in each of `example002`, `20312`, and `19938`: three RGB bytes per pixel changed by
exactly one (9 bytes total, maximum absolute difference 1). The other six corpus images
are identical. These three hashes were deliberately rebaselined instead of adding
fixed-point conversion to the hot edge loop for differences far below one 8-bit level.

## Commands

```bash
# Microbenchmarks and canvas-size scaling (in packages/canvas)
vp run bench

# The GML benchmarks run in packages/render. Full default corpus at 1024×768:
vp run bench:gml

# Both target resolutions and the 60-frame 414 animation
vp run bench:gml -- --runs 3 --sizes 1024x768,2048x1536 --frames 60

# 16× ground truth plus heatmaps and worst-error crops
vp run bench:gml -- --runs 1 --frames 0 --ground-truth-scale 16 \
  --report-dir test-results/accuracy-baseline
```

The GML benchmark lives in `packages/render` and renders through its `gmljs-canvas` context,
which imports the built `@gmljs/canvas`: run `vp pack` here after changing the rasterizer.
Generated reports are ignored by Git.

## PNG encoding

The first Milestone 4 profile found PNG row-filter selection dominating encoding. Fusing
five scoring passes into one reduced PNG time on `example002` from 62.57 ms to 24.18 ms,
but did not establish whole-corpus performance. Before the second PNG pass, tscanvas and
node-canvas were both confirmed to use zlib level 6 and the default strategy. Node-canvas
asks libpng to consider all five standard filters, matching the tscanvas filter set.

The second pass copies complete rows in native typed-array code, repairs only pixels with
partial alpha, and scores every second pixel while retaining all RGBA channels. The
winning filter is still applied to every byte. This changes compressed bytes and size,
but not decoded pixels:

| Document      | PNG before | PNG current | Node PNG | Current total / node | Size current / node |
| ------------- | ---------: | ----------: | -------: | -------------------: | ------------------: |
| example-brush |   20.44 ms |    13.93 ms | 13.13 ms |        14.36 / 13.44 |       7.8 / 8.1 KiB |
| example001    |   21.51 ms |    14.32 ms | 14.52 ms |        15.46 / 15.03 |     25.0 / 28.6 KiB |
| example002    |   24.48 ms |    16.56 ms | 18.06 ms |        18.66 / 20.15 |     59.5 / 66.2 KiB |
| 414           |   24.42 ms |    16.59 ms | 20.90 ms |        20.59 / 22.63 |   129.1 / 129.3 KiB |
| 409           |   22.91 ms |    14.50 ms | 15.40 ms |        15.29 / 16.18 |     28.4 / 31.2 KiB |
| 158           |   22.76 ms |    15.24 ms | 16.30 ms |        16.28 / 17.13 |     47.9 / 58.0 KiB |
| 20312         |   26.26 ms |    17.75 ms | 19.36 ms |        20.00 / 21.53 |   105.1 / 123.1 KiB |
| 19938         |   28.31 ms |    18.95 ms | 18.20 ms |        22.40 / 22.28 |     81.3 / 93.3 KiB |
| 18476         |   24.38 ms |    14.85 ms | 13.73 ms |        15.15 / 14.15 |       4.8 / 4.8 KiB |

PNG time improves by 1.47× to 1.64×. Both PNG-only and draw-plus-PNG are now within
1.2× of node-canvas on every corpus document; the largest end-to-end ratio is 1.07×.
Sampling increases file size by at most 3.3% over exhaustive scoring in this corpus, and
every tscanvas file remains no larger than its node-canvas counterpart.

Matched Node v24.22.0 CPU profiles of three `414.gml` renders show where the time moved:

| PNG state        | Total samples | `chooseFilter` | Unpremultiply | Filter write |
| ---------------- | ------------: | -------------: | ------------: | -----------: |
| Exhaustive score |           816 |             57 |            17 |           13 |
| Sampled score    |           814 |             31 |             8 |           10 |

The three encoder loops fall from 87 to 49 self samples, a 43.7% reduction. Whole-process
sample counts are flat because startup, native encoders, comparison work, and idle time
are included; the independently timed tscanvas PNG result falls from 24.42 to 16.59 ms.
All nine decoded-pixel hashes remain identical to the sparse-raster step.

## JPEG encoding

The baseline JPEG benchmark uses a GML-like 1920×1080 scene with 36 thick, round-capped
strokes on a dark background, quality 0.92, and 15 timed runs. Skia is explicitly asked
for 4:2:0 output so its time and size are comparable with the default tscanvas mode.

| Encoder           |   Median |      Size |   Y-PSNR | RGB-PSNR |
| ----------------- | -------: | --------: | -------: | -------: |
| tscanvas 4:2:0    | 24.68 ms | 650.6 KiB | 42.72 dB | 29.66 dB |
| tscanvas 4:4:4    | 36.51 ms | 919.5 KiB | 42.72 dB | 37.73 dB |
| jpeg-js 4:4:4     | 85.16 ms | 919.5 KiB | 42.72 dB | 37.73 dB |
| skia-canvas 4:2:0 | 12.18 ms | 622.3 KiB | 42.71 dB | 29.66 dB |

The 4:2:0 encoder is 3.45× faster than jpeg-js and meets the required 3× target. It is
2.03× the Skia time, narrowly missing the within-2× stretch target. Its output is 4.5%
larger than Skia's and remains within the ±10% size target. The 4:4:4 bytes remain
identical to the pre-optimization encoder.

The 1024×768 real-document results are medians of seven runs. PNG is included to retain
the end-to-end context, while the three JPEG columns compare encoders directly.

| Document      | Gmljs PNG | Gmljs JPEG | Skia JPEG | Node JPEG |
| ------------- | --------: | ---------: | --------: | --------: |
| example-brush |  14.18 ms |    1.02 ms |   2.78 ms |   0.81 ms |
| example000    |  13.24 ms |    0.74 ms |   2.71 ms |   0.82 ms |
| example001    |  14.74 ms |    1.12 ms |   3.06 ms |   0.87 ms |
| example002    |  17.32 ms |    2.96 ms |   4.40 ms |   1.02 ms |
| 414           |  18.52 ms |    6.22 ms |   5.38 ms |   1.31 ms |
| 409           |  15.51 ms |    1.27 ms |   3.48 ms |   0.89 ms |
| 158           |  16.09 ms |    1.82 ms |   3.57 ms |   0.93 ms |
| 20312         |  20.55 ms |    3.82 ms |   4.94 ms |   1.15 ms |
| 19938         |  18.22 ms |    3.02 ms |   5.70 ms |   1.10 ms |
| 18476         |  13.54 ms |    0.64 ms |   2.95 ms |   0.83 ms |

Optimization log:

- A temporary SHA-256 guard covered 21 deterministic sources at four qualities in both
  subsampling modes (168 encodes). Moving uniform detection to the source MCU changed no
  hashes. It removes conversion, DCT, and quantization entirely for uniform 16×16 or 8×8
  regions, including partial edge MCUs. The focused flat 1024×768 case measured 0.705 ms,
  although the non-uniform line-art scene initially moved from 31.63 to 33.23 ms.
- Fusing 4:2:0 conversion and 2×2 chroma averaging moved line art from 33.23 to 29.92 ms.
  This deliberately changed 41 of the 84 guarded 4:2:0 hashes and none of the 84 4:4:4
  hashes. The changed 4:2:0 set was rebaselined once after verifying the fidelity and size
  bounds below.
- Replacing the layered byte/bit writers with one fixed-shape writer moved the same scene
  from 29.92 to 27.36 ms. It reserves a conservative worst-case capacity once per MCU,
  writes byte stuffing directly, and returns a zero-copy subarray for normal outputs. Only
  unusually compressible output is copied, so it does not retain a much larger estimate.
  This step changed no guarded hash.
- Caching quality tables and reusing synchronous module-level MCU, DCT, coefficient, and
  offset scratch removed per-call allocation churn. `Int16Array` sample planes were kept:
  hashes stayed unchanged, the flat case moved from 0.705 to 0.629 ms, and the texture
  scene improved from its 64.43 ms baseline to 54.73 ms. Together with the finalized
  writer hot path, line art reached 24.68 ms.
- Two measured experiments were reverted. Combining Huffman and coefficient bits through
  a single-shift branch moved representative line-art runs from 25.01 to 25.70 ms. Reducing
  the initial output estimate from 0.5 to 0.35 bytes per pixel moved one matched run from
  24.68 to 25.53 ms. The earlier Float32-plane and last-nonzero experiments also remain
  reverted because both regressed the realistic scene.

The fused 4:2:0 path stayed inside the requested 0.05 dB and 0.5% limits on every scene:

| Scene       | Y-PSNR before → after | RGB-PSNR before → after |   Size before → after |
| ----------- | --------------------: | ----------------------: | --------------------: |
| line art    |      42.71 → 42.72 dB |        29.66 → 29.66 dB |     650.6 → 650.6 KiB |
| gradient    |      52.18 → 52.17 dB |        49.66 → 49.68 dB |     100.1 → 100.3 KiB |
| texture     |      37.78 → 37.78 dB |        13.06 → 13.06 dB | 1,970.6 → 1,970.7 KiB |
| transparent |      40.00 → 40.00 dB |        30.79 → 30.79 dB |     675.8 → 675.9 KiB |

A matched final CPU profile attributed the largest encoder self-sample counts to
`encodeBlock` (452), entropy writes (122), MCU conversion (75), the one-dimensional DCT
transform (43), and source uniform detection (23). The pre-pass profile recorded 525,
141, 460, and 98 samples respectively for block encoding, entropy writes, strip conversion,
and transform. Conversion is no longer the dominant fixed per-pixel cost; block entropy
coding is now the clearest remaining pure-TypeScript limit.
