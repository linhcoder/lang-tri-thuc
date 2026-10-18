"""Add verified WebP alternatives to Cocos Web output, retaining PNG fallback."""
import argparse, concurrent.futures, hashlib, json, math, pathlib
from PIL import Image, ImageChops, ImageStat

SCENERY_DIRS = ('village/journey-regions-v1/', 'village/enterable-houses-v1/')
SCENERY_FILES = {'village/reference-banyan-v1.png', 'village/banyan-v3-clean.png',
                 'village/temple-v3.png', 'village/grass-meadow-v1.png',
                 'village/dirt-path-v1.png', 'village/house-v5.png',
                 'village/expansion-v1/riverside.png', 'village/expansion-v1/garden.png',
                 'village/expansion-v1/school.png'}


def visible_psnr(original, decoded, preview=False):
    if preview:
        original, decoded = original.copy(), decoded.copy()
        # Scene art is displayed at roughly 260–650 HUD/world pixels. Assess
        # detail at 768px as well as native resolution; encoded dimensions stay.
        original.thumbnail((768, 768), Image.Resampling.LANCZOS)
        decoded.thumbnail((768, 768), Image.Resampling.LANCZOS)
    difference = ImageChops.difference(original.convert('RGB'), decoded.convert('RGB'))
    stats = ImageStat.Stat(difference, original.getchannel('A'))
    errors = [square / count for square, count in zip(stats.sum2, stats.count) if count]
    mse = sum(errors) / len(errors) if errors else 0
    return 99.0 if mse == 0 else 10 * math.log10(255 * 255 / mse)


def optimize_image(entry):
    source, source_name = entry
    output = source.with_suffix('.webp')
    with Image.open(source) as image:
        rgba = image.convert('RGBA')
        profile = image.info.get('icc_profile', b'')
        scenery = source_name.startswith(SCENERY_DIRS) or source_name in SCENERY_FILES
        mode, psnr, preview_psnr = 'lossless', 99.0, 99.0
        if scenery:
            rgba.save(output, 'WEBP', quality=90, alpha_quality=100, exact=True, method=4, icc_profile=profile)
            with Image.open(output) as decoded:
                decoded_rgba = decoded.convert('RGBA')
                psnr = visible_psnr(rgba, decoded_rgba)
                preview_psnr = visible_psnr(rgba, decoded_rgba, preview=True)
                accepted = decoded.size == rgba.size and rgba.getchannel('A').tobytes() == decoded_rgba.getchannel('A').tobytes() and psnr >= 34 and preview_psnr >= 34
            if accepted:
                mode = 'scenery-quality-90'
        if mode == 'lossless':
            rgba.save(output, 'WEBP', lossless=True, exact=True, method=4, icc_profile=profile)
        with Image.open(output) as decoded:
            decoded_rgba = decoded.convert('RGBA')
            if decoded.size != rgba.size or decoded_rgba.getchannel('A').tobytes() != rgba.getchannel('A').tobytes():
                raise RuntimeError('WebP dimensions/alpha differ: ' + source.name)
            if mode == 'lossless' and decoded_rgba.tobytes() != rgba.tobytes():
                raise RuntimeError('WebP pixels differ: ' + source.name)
        dimensions = list(rgba.size)
    # Avoid requesting an alternative that costs almost as much as the fallback.
    if output.stat().st_size >= source.stat().st_size * .95:
        output.unlink()
        return None
    return {
        'pngBytes': source.stat().st_size, 'webpBytes': output.stat().st_size,
        'dimensions': dimensions, 'pngSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'webpSha256': hashlib.sha256(output.read_bytes()).hexdigest(),
        'source': source_name, 'mode': mode, 'visiblePsnr': round(psnr, 2) if mode != 'lossless' else 99.0,
        'previewPsnr768': round(preview_psnr, 2) if mode != 'lossless' else 99.0,
    }


def optimize_build(build):
    build = pathlib.Path(build).resolve()
    if not (build / 'index.html').is_file():
        raise ValueError('Expected a Cocos Web build directory')
    resources = pathlib.Path(__file__).resolve().parents[1] / 'apps/game-client/assets/resources'
    source_names = {json.loads(path.read_text(encoding='utf-8-sig'))['uuid']:path.relative_to(resources).as_posix()[:-5] for path in resources.rglob('*.png.meta')}
    candidates = []
    # Only touch built ImageAsset files with their own native PNG. Sources and
    # packed texture/sprite metadata (frame coordinates, trim, anchors) stay intact.
    for metadata in sorted((build / 'assets').glob('*/import/*/*.json')):
        if '@' in metadata.stem:
            continue
        data = json.loads(metadata.read_text(encoding='utf-8'))
        if not isinstance(data, list) or len(data) < 6 or data[3] != ['cc.ImageAsset']:
            continue
        payload = data[5][0]
        if not isinstance(payload, dict) or payload.get('fmt') not in {'0', '4_0'}:
            continue
        bundle = metadata.parents[2]
        source = bundle / 'native' / metadata.parent.name / (metadata.stem + '.png')
        if source.is_file():
            candidates.append((metadata, data, payload, source))
    files = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = pool.map(optimize_image, [(entry[3], source_names.get(entry[3].stem, '')) for entry in candidates])
        for (metadata, data, payload, source), result in zip(candidates, results):
            if result:
                payload['fmt'] = '4_0'  # Cocos ImageAsset: WebP first, PNG fallback.
                files[source.relative_to(build).as_posix()] = result
            else:
                payload['fmt'] = '0'
            metadata.write_text(json.dumps(data, separators=(',', ':')), encoding='utf-8')
    report = {'format': 'WebP with PNG fallback', 'alphaExact': True, 'resized': False,
              'policy': 'UI/characters/atlases lossless; allowlisted scenery quality 90, native and 768px preview visible PSNR >= 34 dB',
              'images': len(files), 'pngBytes': sum(x['pngBytes'] for x in files.values()),
              'webpBytes': sum(x['webpBytes'] for x in files.values()), 'files': files}
    (build / 'image-optimization.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({key: value for key, value in report.items() if key != 'files'}))
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--build-dir', required=True)
    optimize_build(parser.parse_args().build_dir)
